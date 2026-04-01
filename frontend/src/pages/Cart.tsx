import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="max-w-md mx-auto space-y-6">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold">Your cart is empty</h2>
                    <p className="text-muted-foreground">Looks like you haven't added any lovely cards to your cart yet.</p>
                    <Link to="/cards">
                        <Button size="lg" className="mt-4">Browse Cards</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <h1 className="text-4xl font-serif font-bold mb-10">Your Shopping Cart</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-6">
                    {cartItems.map((item) => (
                        <div key={item.slug} className="flex gap-6 p-4 rounded-2xl border bg-card/50 hover:shadow-md transition-shadow">
                            <div className="w-24 h-32 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                                <img src={item.thumbnail_url} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg">{item.name}</h3>
                                        <button onClick={() => removeFromCart(item.slug)} className="text-muted-foreground hover:text-destructive">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <p className="text-primary font-bold mt-1">₹{item.base_price} <span className="text-xs font-normal text-muted-foreground">/card</span></p>
                                </div>
                                
                                <div className="flex items-center gap-4 mt-4">
                                    <div className="flex items-center border rounded-lg overflow-hidden">
                                        <button 
                                            onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                                            className="p-2 hover:bg-muted"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="px-4 font-medium text-sm">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                                            className="p-2 hover:bg-muted"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="text-sm font-semibold">
                                        Total: ₹{item.base_price * item.quantity}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <Button variant="ghost" onClick={clearCart} className="text-muted-foreground">
                        Clear Cart
                    </Button>
                </div>
                
                <div className="lg:col-span-1">
                    <div className="p-8 rounded-3xl border bg-muted/30 sticky top-8">
                        <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>₹{cartTotal}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="border-t pt-4 flex justify-between font-bold text-xl">
                                <span>Total</span>
                                <span>₹{cartTotal}</span>
                            </div>
                        </div>
                        <Link to="/checkout">
                            <Button size="lg" className="w-full h-14 text-lg">Proceed to Checkout</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
