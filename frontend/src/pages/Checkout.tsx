import { useState, useEffect, Suspense } from "react";
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const fadeVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

function CheckoutWizard() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const designSlug = searchParams.get('design');

    const [step, setStep] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [design, setDesign] = useState<any>(null);

    // Form states
    const [customization, setCustomization] = useState({
        event_type: "", bride_name: "", groom_name: "", event_date: "", venue: "", extra_notes: "", print_color: "",
        birthday_person: "", age_turning: "", event_title: "", organizer: "", time: ""
    });

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
                if (fetchedDesign.categories && fetchedDesign.categories.length > 0) updates.event_type = fetchedDesign.categories[0];
                setCustomization(prev => ({ ...prev, ...updates }));
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

    if (!user) return <div className="py-24 text-center">Loading authentication state...</div>;

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
            alert("Order submission failed. " + (e.response?.data?.detail || ""));
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
                        alert("Payment verification failed. Please contact support.");
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
                alert(`Payment Failed: ${response.error.description}`);
                setIsLoading(false);
            });
            rzp.open();
        } catch (error: any) {
            alert("Failed to initiate payment. " + (error.response?.data?.detail || ""));
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

            <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-3 text-primary">Complete Your Order</h1>
            <p className="text-center text-muted-foreground mb-12 font-medium tracking-wide">
                {step === 1 ? "Step 1: Event Basics" : step === 2 ? "Step 2: Printing Details" : step === 3 ? "Step 3: Delivery Address" : "Step 4: Review & Confirm"}
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
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">Basic Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Event Type</label>
                                <select className="w-full p-2 border rounded-md capitalize"
                                    value={customization.event_type}
                                    onChange={e => setCustomization({ ...customization, event_type: e.target.value })}>
                                    {(design?.categories || ["wedding"]).map((cat: string) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Event Date</label>
                                <input type="date" className="w-full p-2 border rounded-md"
                                    min={getMinDateString()}
                                    value={customization.event_date}
                                    onChange={e => setCustomization({ ...customization, event_date: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Card Quantity</label>
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
                                    Must be a multiple of 25. {design?.min_quantity ? `Minimum order: ${design.min_quantity} units.` : ""}
                                </p>
                                {design && design.available_stock !== undefined && (
                                    <p className="text-[10px] text-muted-foreground">Available in stock: {design.available_stock}</p>
                                )}
                            </div>
                        </div>

                        {design && design.print_colors && design.print_colors.length > 0 && (
                            <div className="space-y-2 mt-4">
                                <label className="text-sm font-medium">Select Print Color</label>
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
                            <Button onClick={handleNext} disabled={!customization.event_date}>Next: Printing Details</Button>
                        </div>
                    </div>
                )}

                {/* STEP 2: Printing Details */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b pb-4">
                            <h2 className="text-xl font-bold">What should we print?</h2>
                            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer p-2 rounded-md bg-secondary/20 hover:bg-secondary/30 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={giveDetailsByPhone}
                                    onChange={(e) => setGiveDetailsByPhone(e.target.checked)}
                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                />
                                Give details on phone call/WhatsApp
                            </label>
                        </div>

                        {giveDetailsByPhone ? (
                            <div className="bg-primary/5 border border-primary/20 text-primary-foreground/90 text-sm p-4 rounded-md">
                                You have chosen to provide printing details over a phone call or WhatsApp. Our team will contact you shortly after you place the order!
                            </div>
                        ) : (
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-4 rounded-md">
                                Detailed online forms for specific events are currently under construction. Please check the box above to provide your details via phone call or WhatsApp after placing the order.
                            </div>
                        )}

                        {/* Hidden dynamic forms - kept in state but not rendered for now per user request */}
                        {!giveDetailsByPhone && (
                            <div className="space-y-4 transition-all duration-300">

                                {(customization.event_type.toLowerCase() === 'wedding' || customization.event_type.toLowerCase() === 'engagement') && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Bride's Name</label>
                                            <input type="text" className="w-full p-2 border rounded-md"
                                                value={customization.bride_name}
                                                onChange={e => setCustomization({ ...customization, bride_name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Groom's Name</label>
                                            <input type="text" className="w-full p-2 border rounded-md"
                                                value={customization.groom_name}
                                                onChange={e => setCustomization({ ...customization, groom_name: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                {customization.event_type.toLowerCase() === 'birthday' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Birthday Person Name</label>
                                            <input type="text" className="w-full p-2 border rounded-md"
                                                value={customization.birthday_person}
                                                onChange={e => setCustomization({ ...customization, birthday_person: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Age Turning</label>
                                            <input type="text" className="w-full p-2 border rounded-md"
                                                value={customization.age_turning}
                                                onChange={e => setCustomization({ ...customization, age_turning: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                {customization.event_type.toLowerCase() !== 'wedding' && customization.event_type.toLowerCase() !== 'engagement' && customization.event_type.toLowerCase() !== 'birthday' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Event/Function Title</label>
                                            <input type="text" className="w-full p-2 border rounded-md" placeholder="e.g. Diwali Puja, Corporate Gala"
                                                value={customization.event_title}
                                                onChange={e => setCustomization({ ...customization, event_title: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Hosted By / Organizer</label>
                                            <input type="text" className="w-full p-2 border rounded-md"
                                                value={customization.organizer}
                                                onChange={e => setCustomization({ ...customization, organizer: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Event Time</label>
                                        <input type="time" className="w-full p-2 border rounded-md"
                                            value={customization.time}
                                            onChange={e => setCustomization({ ...customization, time: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 mt-4">
                                    <label className="text-sm font-medium">Venue Details</label>
                                    <textarea className="w-full p-2 border rounded-md" rows={2}
                                        value={customization.venue}
                                        onChange={e => setCustomization({ ...customization, venue: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Additional Notes (Optional)</label>
                                    <textarea className="w-full p-2 border rounded-md" rows={2} placeholder="Any specific instructions for our designers?"
                                        value={customization.extra_notes}
                                        onChange={e => setCustomization({ ...customization, extra_notes: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                        )}
                        {/* End Hidden dynamic forms */}

                        <div className="pt-6 flex justify-between">
                            <Button variant="outline" onClick={handlePrev}>Back</Button>
                            <Button onClick={handleNext}>Next: Delivery Address</Button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Address */}
                {step === 3 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">Where should we deliver?</h2>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <input type="text" className="w-full p-2 border rounded-md"
                                value={address.full_name} onChange={e => setAddress({ ...address, full_name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Street Address</label>
                            <input type="text" className="w-full p-2 border rounded-md"
                                value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">City</label>
                                <input type="text" className="w-full p-2 border rounded-md"
                                    value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">State</label>
                                <input type="text" className="w-full p-2 border rounded-md"
                                    value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Zip / Postal Code</label>
                                <input type="text" className="w-full p-2 border rounded-md"
                                    value={address.zip_code} onChange={e => setAddress({ ...address, zip_code: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone Number</label>
                                <input type="text" className="w-full p-2 border rounded-md"
                                    value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-6 flex justify-between">
                            <Button variant="outline" onClick={handlePrev}>Back</Button>
                            <Button onClick={handleNext} disabled={!address.street || !address.city || !address.zip_code || !address.phone}>Review Order</Button>
                        </div>
                    </div>
                )}

                {/* STEP 4: Confirm */}
                {step === 4 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold border-b pb-2">Order Summary</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-4 rounded-lg">
                            <div>
                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">Event Details</h3>
                                <p className="font-medium">Design Slug: {designSlug}</p>
                                <p>Quantity: {quantity} cards</p>
                                <p>Date: {customization.event_date}</p>
                                {giveDetailsByPhone ? (
                                    <p className="text-amber-600 font-medium">Details to be provided via phone call or WhatsApp</p>
                                ) : (
                                    <>
                                        {(customization.event_type.toLowerCase() === 'wedding' || customization.event_type.toLowerCase() === 'engagement') && <p>Names: {customization.bride_name} & {customization.groom_name}</p>}
                                        {customization.event_type.toLowerCase() === 'birthday' && <p>Name: {customization.birthday_person} ({customization.age_turning})</p>}
                                        {customization.event_type.toLowerCase() !== 'wedding' && customization.event_type.toLowerCase() !== 'engagement' && customization.event_type.toLowerCase() !== 'birthday' && <p>Event: {customization.event_title}</p>}
                                    </>
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">Delivery To</h3>
                                <p className="font-medium">{address.full_name}</p>
                                <p>{address.street}</p>
                                <p>{address.city}, {address.state} {address.zip_code}</p>
                                <p>Phone: {address.phone}</p>
                            </div>
                        </div>

                        <div className="bg-primary/5 p-4 rounded-lg flex flex-col gap-2 border border-primary/20">
                            {design ? (
                                <>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Cards (x{quantity})</span>
                                        <span>₹{design.base_price * quantity}</span>
                                    </div>
                                    {design.print_price > 0 && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Printing Cost</span>
                                            <span>₹{(design.print_price / design.print_price_unit) * quantity}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-primary/10 pt-2 flex justify-between items-center mt-2">
                                        <span className="font-semibold text-lg">Total Amount Due</span>
                                        <span className="font-bold text-2xl text-primary">
                                            ₹{(design.base_price * quantity) + ((design.print_price / design.print_price_unit) * quantity)}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-lg">Total Amount Due</span>
                                    <span className="font-bold text-2xl text-primary">Calculating...</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 flex justify-between">
                            <Button variant="outline" onClick={handlePrev} disabled={isLoading}>Back</Button>
                            <Button
                                onClick={handlePayment}
                                disabled={isLoading}
                                className="px-8"
                            >
                                {isLoading ? "Processing..." : "Pay & Place Order"}
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
    return (
        <Suspense fallback={<div className="py-24 text-center">Loading checkout...</div>}>
            <CheckoutWizard />
        </Suspense>
    );
}
