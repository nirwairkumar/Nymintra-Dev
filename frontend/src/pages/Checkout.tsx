import { useState, useEffect, Suspense } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';

const fadeVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

function CheckoutWizard() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const designSlug = searchParams.get('design');
    const { t } = useTranslation();

    const [step, setStep] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [design, setDesign] = useState<any>(null);

    // Form states
    const [customization, setCustomization] = useState<any>({
        event_type: "", print_color: "", 
        form_responses: {} // Store dynamic form data here mapped by field.label
    });
    
    const [activeFormTemplate, setActiveFormTemplate] = useState<any>(null);

    const [giveDetailsByPhone, setGiveDetailsByPhone] = useState(true);

    const [address, setAddress] = useState({
        full_name: "", street: "", city: "", state: "", zip_code: "", phone: ""
    });

    const [quantity, setQuantity] = useState(100);

    // Initial auth & design check
    useEffect(() => {
        authService.getCurrentUser()
            .then(data => setUser(data))
            .catch(() => {
                navigate(`/login?redirect=/checkout?design=${designSlug}`);
            });

        if (designSlug) {
            api.get(`/designs/${designSlug}`).then(res => {
                const fetchedDesign = res.data;
                setDesign(fetchedDesign);
                if (fetchedDesign.min_quantity) setQuantity(fetchedDesign.min_quantity);

                const updates: any = {};
                if (fetchedDesign.print_colors && fetchedDesign.print_colors.length > 0) updates.print_color = fetchedDesign.print_colors[0];
                
                let evtType = "wedding";
                if (fetchedDesign.categories && fetchedDesign.categories.length > 0) {
                    evtType = fetchedDesign.categories[0];
                    updates.event_type = evtType;
                }
                setCustomization((prev: any) => ({ ...prev, ...updates }));
                
                // Fetch dynamic form structure based on category
                api.get(`/form-templates/category/${evtType}`).then(fRes => {
                    setActiveFormTemplate(fRes.data);
                }).catch(() => {
                    setActiveFormTemplate(null);
                });
            }).catch(err => console.error("Failed to load design", err));
        }
    }, [navigate, designSlug]);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) document.body.removeChild(script);
        }
    }, []);

    const getMinDateString = () => new Date().toISOString().split("T")[0];

    if (!user) return <div className="py-24 text-center">{t('checkout.loadingAuth')}</div>;

    const handleNext = () => setStep(s => s + 1);
    const handlePrev = () => setStep(s => s - 1);

    const submitFinalOrder = async (paymentDetails: any = null) => {
        try {
            const payload = {
                design_slug: designSlug,
                quantity: quantity,
                customization_data: customization,
                delivery_address: address,
                razorpay_payment_id: paymentDetails?.razorpay_payment_id || null,
                payment_status: paymentDetails ? "paid" : "pending"
            };

            const res = await api.post("/orders", payload);
            if (res.data && res.data.order_id) {
                navigate("/orders?success=true");
            }
        } catch (e: any) {
            console.error("Order failed", e);
            alert(`${t('checkout.orderFailed')} ` + (e.response?.data?.detail || ""));
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!design) return;
        setIsLoading(true);

        try {
            const totalAmount = (design.base_price * quantity) + ((design.print_price / design.print_price_unit) * quantity);
            const { data: orderData } = await api.post("/payments/create-order", { amount: totalAmount });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use Vite env vars
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Nymintra",
                description: "Custom Card Order",
                order_id: orderData.id,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await api.post("/payments/verify", response);
                        if (verifyRes.data.status === "success") {
                            await submitFinalOrder(response);
                        }
                    } catch (verifyError: any) {
                        alert(t('checkout.paymentVerifyFailed'));
                        setIsLoading(false);
                    }
                },
                prefill: {
                    name: user?.name || "",
                    email: user?.email || "",
                    contact: user?.phone || address?.phone || ""
                },
                theme: { color: "#8a3a41" }, // Match Kumkum maroon
                modal: { ondismiss: function () { setIsLoading(false); } }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                alert(t('checkout.paymentFailed', { error: response.error.description }));
                setIsLoading(false);
            });
            rzp.open();
        } catch (error: any) {
            alert(`${t('checkout.paymentInitFailed')} ` + (error.response?.data?.detail || ""));
            setIsLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="container mx-auto px-4 py-12 max-w-3xl relative"
        >
            <div className="absolute top-0 right-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-10 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>

            <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-3 text-primary">{t('checkout.title')}</h1>
            <p className="text-center text-muted-foreground mb-12 font-medium tracking-wide">
                {step === 1 ? t('checkout.step1Label') : step === 2 ? t('checkout.step2Label') : step === 3 ? t('checkout.step3Label') : step === 4 ? t('checkout.step4Label') : "Step 5: Order Confirmed"}
            </p>

            {/* Stepper UI */}
            <div className="flex items-center justify-between mb-12 relative max-w-xl mx-auto">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted/50 -z-10 rounded-full"></div>
                <motion.div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${((step - 1) / 3) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />

                {[1, 2, 3, 4].map(i => (
                    <motion.div 
                        initial={false}
                        animate={{ 
                            scale: step === i ? 1.2 : 1,
                            backgroundColor: step >= i ? "var(--color-primary)" : "var(--color-muted)",
                            color: step >= i ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)",
                            borderColor: step >= i ? "transparent" : "var(--color-border)"
                        }}
                        key={i} 
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors border`}
                    >
                        {step > i ? "✓" : i}
                    </motion.div>
                ))}
            </div>

            <div className="bg-card/80 backdrop-blur-sm border rounded-2xl shadow-xl p-6 md:p-10 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    <motion.div key={step} variants={fadeVariants} initial="initial" animate="animate" exit="exit" className="w-full">
                {/* STEP 1: Basic Customization */}
                {step === 1 && (
                    <div className="space-y-6 shadow-none">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">{t('checkout.basicInfo')}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('checkout.eventType')}</label>
                                <select className="w-full p-2 border rounded-md capitalize"
                                    value={customization.event_type}
                                    onChange={e => setCustomization({ ...customization, event_type: e.target.value })}>
                                    {(design?.categories || ["wedding"]).map((cat: string) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('checkout.cardQuantity')}</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded-md"
                                    value={quantity}
                                    min={design?.min_quantity || 25}
                                    step={25}
                                    onChange={e => setQuantity(Number(e.target.value))}
                                    onBlur={e => {
                                        let val = Math.max(Number(e.target.value), design?.min_quantity || 25);
                                        // Snap to nearest multiple of 25
                                        val = Math.ceil(val / 25) * 25;
                                        setQuantity(val);
                                    }}
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    {t('checkout.qtyHint')} {design?.min_quantity ? t('checkout.minOrder', { count: design.min_quantity }) : ""}
                                </p>
                                {design && design.available_stock !== undefined && (
                                    <p className="text-[10px] text-muted-foreground">{t('checkout.availableStock', { count: design.available_stock })}</p>
                                )}
                            </div>
                        </div>

                        {design && design.print_colors && design.print_colors.length > 0 && (
                            <div className="space-y-2 mt-4">
                                <label className="text-sm font-medium">{t('checkout.selectPrintColor')}</label>
                                <div className="flex flex-wrap gap-3">
                                    {design.print_colors.map((color: string) => (
                                        <label key={color} className={`cursor-pointer flex items-center gap-2 border rounded-md p-3 transition-all ${customization.print_color === color ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'hover:border-primary/50'}`}>
                                            <input
                                                type="radio"
                                                name="print_color"
                                                value={color}
                                                checked={customization.print_color === color}
                                                onChange={e => setCustomization({ ...customization, print_color: e.target.value })}
                                                className="text-primary focus:ring-primary"
                                            />
                                            <span className="flex items-center gap-2 text-sm">
                                                <span
                                                    className="w-4 h-4 rounded-full border shadow-sm block"
                                                    style={{ backgroundColor: color.toLowerCase() === 'gold' ? '#FFD700' : color.toLowerCase() === 'silver' ? '#C0C0C0' : color.toLowerCase() }}
                                                />
                                                {color}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-6 flex justify-end">
                            <Button onClick={handleNext}>{t('checkout.nextPrinting')}</Button>
                        </div>
                    </div>
                )}

                {/* STEP 2: Printing Details */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b pb-4">
                            <h2 className="text-xl font-bold">{t('checkout.whatToPrint')}</h2>
                            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer p-2 rounded-md bg-secondary/20 hover:bg-secondary/30 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={giveDetailsByPhone}
                                    onChange={(e) => setGiveDetailsByPhone(e.target.checked)}
                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                />
                                {t('checkout.giveDetailsByPhone')}
                            </label>
                        </div>

                        {giveDetailsByPhone ? (
                            <div className="bg-primary/5 border border-primary/20 text-primary-foreground/90 text-sm p-4 rounded-md">
                                {t('checkout.phoneDetailsMsg')}
                            </div>
                        ) : (
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-4 rounded-md">
                                {t('checkout.formUnderConstruction')}
                            </div>
                        )}

                        {/* Render Dynamic Form If Available */}
                        {!giveDetailsByPhone && activeFormTemplate && (
                            <div className="space-y-4 transition-all duration-300">
                                {activeFormTemplate.fields.map((field: any) => (
                                    <div key={field.id} className="space-y-2">
                                        <label className="text-sm font-medium">
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        
                                        {field.type === 'text' && (
                                            <input type="text" className="w-full p-2 border rounded-md" 
                                                placeholder={field.placeholder || ""}
                                                value={customization.form_responses[field.label] || ""}
                                                onChange={e => setCustomization({ ...customization, form_responses: { ...customization.form_responses, [field.label]: e.target.value }})}
                                                required={field.required}
                                            />
                                        )}
                                        
                                        {field.type === 'textarea' && (
                                            <textarea className="w-full p-2 border rounded-md" rows={3}
                                                placeholder={field.placeholder || ""}
                                                value={customization.form_responses[field.label] || ""}
                                                onChange={e => setCustomization({ ...customization, form_responses: { ...customization.form_responses, [field.label]: e.target.value }})}
                                                required={field.required}
                                            />
                                        )}
                                        
                                        {field.type === 'date' && (
                                            <input type="date" className="w-full p-2 border rounded-md" 
                                                min={getMinDateString()}
                                                value={customization.form_responses[field.label] || ""}
                                                onChange={e => setCustomization({ ...customization, form_responses: { ...customization.form_responses, [field.label]: e.target.value }})}
                                                required={field.required}
                                            />
                                        )}
                                        
                                        {field.type === 'time' && (
                                            <input type="time" className="w-full p-2 border rounded-md" 
                                                value={customization.form_responses[field.label] || ""}
                                                onChange={e => setCustomization({ ...customization, form_responses: { ...customization.form_responses, [field.label]: e.target.value }})}
                                                required={field.required}
                                            />
                                        )}
                                        
                                        {field.type === 'select' && (
                                            <select className="w-full p-2 border rounded-md"
                                                value={customization.form_responses[field.label] || ""}
                                                onChange={e => setCustomization({ ...customization, form_responses: { ...customization.form_responses, [field.label]: e.target.value }})}
                                                required={field.required}
                                            >
                                                <option value="">{t('checkout.selectOption')}</option>
                                                {(field.options || []).map((opt: string) => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* If no template available and customer unchecks provide by phone, show placeholder message */}
                        {!giveDetailsByPhone && !activeFormTemplate && (
                           <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-4 rounded-md mt-4">
                               {t('checkout.noFormAvailable')}
                           </div> 
                        )}

                        <div className="pt-6 flex justify-between">
                            <Button variant="outline" onClick={handlePrev}>{t('checkout.back')}</Button>
                            <Button onClick={handleNext}>{t('checkout.nextDelivery')}</Button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Address */}
                {step === 3 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">{t('checkout.deliveryTitle')}</h2>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('checkout.fullName')}</label>
                            <input type="text" className="w-full p-2 border rounded-md"
                                value={address.full_name} onChange={e => setAddress({ ...address, full_name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('checkout.streetAddress')}</label>
                            <input type="text" className="w-full p-2 border rounded-md"
                                value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('checkout.city')}</label>
                                <input type="text" className="w-full p-2 border rounded-md"
                                    value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('checkout.state')}</label>
                                <input type="text" className="w-full p-2 border rounded-md"
                                    value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('checkout.zipCode')}</label>
                                <input type="text" className="w-full p-2 border rounded-md"
                                    value={address.zip_code} onChange={e => setAddress({ ...address, zip_code: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('checkout.phone')}</label>
                                <input type="text" className="w-full p-2 border rounded-md"
                                    value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-6 flex justify-between">
                            <Button variant="outline" onClick={handlePrev}>{t('checkout.back')}</Button>
                            <Button onClick={handleNext} disabled={!address.street || !address.city || !address.zip_code || !address.phone}>{t('checkout.reviewOrder')}</Button>
                        </div>
                    </div>
                )}

                {/* STEP 4: Confirm */}
                {step === 4 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold border-b pb-2">{t('checkout.orderSummary')}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-4 rounded-lg">
                            <div>
                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">{t('checkout.eventDetails')}</h3>
                                <p className="font-medium">{t('checkout.designSlug', { slug: designSlug })}</p>
                                <p>{t('checkout.quantity', { count: quantity })}</p>
                                {giveDetailsByPhone ? (
                                    <p className="text-amber-600 font-medium mt-1">{t('checkout.detailsByPhone')}</p>
                                ) : (
                                    <div className="mt-2 space-y-1">
                                        {Object.entries(customization.form_responses || {}).map(([key, val]) => val ? (
                                            <p key={key} className="text-xs break-words whitespace-pre-line"><span className="font-semibold">{key}:</span> {String(val)}</p>
                                        ) : null)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">{t('checkout.deliveryTo')}</h3>
                                <p className="font-medium">{address.full_name}</p>
                                <p>{address.street}</p>
                                <p>{address.city}, {address.state} {address.zip_code}</p>
                                <p>{t('checkout.phoneLabel', { phone: address.phone })}</p>
                            </div>
                        </div>

                        <div className="bg-primary/5 p-4 rounded-lg flex flex-col gap-2 border border-primary/20">
                            {design ? (
                                <>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">{t('checkout.cardsCount', { count: quantity })}</span>
                                        <span>₹{design.base_price * quantity}</span>
                                    </div>
                                    {design.print_price > 0 && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">{t('checkout.printingCostLabel')}</span>
                                            <span>₹{(design.print_price / design.print_price_unit) * quantity}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-primary/10 pt-2 flex justify-between items-center mt-2">
                                        <span className="font-semibold text-lg">{t('checkout.totalAmount')}</span>
                                        <span className="font-bold text-2xl text-primary">
                                            ₹{(design.base_price * quantity) + ((design.print_price / design.print_price_unit) * quantity)}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-lg">{t('checkout.totalAmount')}</span>
                                    <span className="font-bold text-2xl text-primary">{t('checkout.calculating')}</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 flex justify-between">
                            <Button variant="outline" onClick={handlePrev} disabled={isLoading}>{t('checkout.back')}</Button>
                            <Button
                                onClick={handlePayment}
                                disabled={isLoading}
                                className="px-8"
                            >
                                {isLoading ? t('checkout.processing') : t('checkout.payAndPlace')}
                            </Button>
                        </div>
                    </div>
                )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

export default function CheckoutPage() {
    const { t } = useTranslation();
    return (
        <Suspense fallback={<div className="py-24 text-center">{t('checkout.loadingCheckout')}</div>}>
            <CheckoutWizard />
        </Suspense>
    );
}
