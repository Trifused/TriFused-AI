import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart, CartItem } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Sparkles,
  Zap,
  BarChart3,
  Check,
  ArrowLeft,
  Loader2,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface StripePrice {
  id: string;
  unit_amount: number;
  currency: string;
  recurring: { interval: string } | null;
  active: boolean;
  metadata: Record<string, string>;
}

interface StripeProduct {
  id: string;
  name: string;
  description: string;
  active: boolean;
  metadata: Record<string, string>;
  prices: StripePrice[];
}

function formatPrice(amount: number, currency: string = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function ProductCard({ product, onAddToCart, onSelectSubscription, selectedSubscriptionId }: {
  product: StripeProduct;
  onAddToCart: (item: CartItem) => void;
  onSelectSubscription: (item: CartItem | null) => void;
  selectedSubscriptionId: string | null;
}) {
  const price = product.prices[0];
  if (!price) return null;

  const isSubscription = !!price.recurring;
  const isSelected = selectedSubscriptionId === price.id;

  const getIcon = () => {
    const name = product.name.toLowerCase();
    if (name.includes("call pack")) return <Plus className="w-6 h-6 text-orange-400" />;
    if (name.includes("report card")) return <BarChart3 className="w-6 h-6 text-cyan-400" />;
    if (name.includes("api")) return <Zap className="w-6 h-6 text-yellow-400" />;
    if (name.includes("report") || name.includes("ai")) return <Sparkles className="w-6 h-6 text-purple-400" />;
    return <BarChart3 className="w-6 h-6 text-green-400" />;
  };

  const handleAction = () => {
    const cartItem: CartItem = {
      priceId: price.id,
      productId: product.id,
      productName: product.name,
      unitAmount: price.unit_amount,
      currency: price.currency,
      type: isSubscription ? "subscription" : "one_time",
      quantity: 1,
      recurring: price.recurring || undefined,
    };

    if (isSubscription) {
      if (isSelected) {
        onSelectSubscription(null);
      } else {
        onSelectSubscription(cartItem);
      }
    } else {
      onAddToCart(cartItem);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`glass-panel border-white/10 hover:border-primary/50 transition-all duration-300 ${
          isSelected ? "border-primary ring-2 ring-primary/20" : ""
        }`}
        data-testid={`product-card-${product.id}`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-white/5">
              {getIcon()}
            </div>
            {isSubscription ? (
              <Badge variant="outline" className="text-cyan-400 border-cyan-400/50">
                Subscription
              </Badge>
            ) : (
              <Badge variant="outline" className="text-green-400 border-green-400/50">
                One-time
              </Badge>
            )}
          </div>
          <CardTitle className="text-white mt-4">{product.name}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {product.description || "Premium feature access"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">
              {formatPrice(price.unit_amount, price.currency)}
            </span>
            {isSubscription && price.recurring && (
              <span className="text-muted-foreground">/{price.recurring.interval}</span>
            )}
          </div>
          <ul className="mt-4 space-y-2">
            {product.metadata?.features?.split(",").map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-green-400" />
                {feature.trim()}
              </li>
            )) || (
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-green-400" />
                Full feature access
              </li>
            )}
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            className={`w-full ${isSelected ? "bg-primary" : ""}`}
            variant={isSelected ? "default" : "outline"}
            onClick={handleAction}
            data-testid={`btn-add-${product.id}`}
          >
            {isSubscription ? (
              isSelected ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Selected
                </>
              ) : (
                "Select Plan"
              )
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

function CartSheet() {
  const { items, selectedSubscription, removeItem, updateQuantity, setSubscription, clearCart, itemCount, subtotal, hasSubscription, hasOneTimeItems } = useCart();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const checkoutMutation = useMutation({
    mutationFn: async ({ priceId, mode }: { priceId: string; mode: "payment" | "subscription" }) => {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ priceId, mode }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Checkout failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Checkout Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to complete your purchase",
      });
      navigate("/portal");
      return;
    }

    if (hasSubscription && hasOneTimeItems) {
      toast({
        title: "Mixed cart not supported",
        description: "Please checkout subscriptions and one-time purchases separately",
        variant: "destructive",
      });
      return;
    }

    if (selectedSubscription) {
      checkoutMutation.mutate({
        priceId: selectedSubscription.priceId,
        mode: "subscription",
      });
    } else if (items.length > 0) {
      checkoutMutation.mutate({
        priceId: items[0].priceId,
        mode: "payment",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative" data-testid="btn-cart">
          <ShoppingCart className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-xs flex items-center justify-center text-white">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="glass-panel border-l border-white/10 w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-white">Shopping Cart</SheetTitle>
          <SheetDescription>
            {itemCount === 0 ? "Your cart is empty" : `${itemCount} item${itemCount > 1 ? "s" : ""} in cart`}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 flex-1 overflow-auto">
          {selectedSubscription && (
            <div className="p-4 rounded-lg bg-white/5 border border-primary/30" data-testid="cart-subscription">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{selectedSubscription.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(selectedSubscription.unitAmount, selectedSubscription.currency)}
                    {selectedSubscription.recurring && `/${selectedSubscription.recurring.interval}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSubscription(null)}
                  data-testid="btn-remove-subscription"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <Badge className="mt-2" variant="outline">Subscription</Badge>
            </div>
          )}

          {items.map((item) => (
            <div key={item.priceId} className="p-4 rounded-lg bg-white/5" data-testid={`cart-item-${item.priceId}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-white">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(item.unitAmount, item.currency)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateQuantity(item.priceId, item.quantity - 1)}
                    data-testid={`btn-decrease-${item.priceId}`}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center text-white">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateQuantity(item.priceId, item.quantity + 1)}
                    data-testid={`btn-increase-${item.priceId}`}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.priceId)}
                    data-testid={`btn-remove-${item.priceId}`}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {itemCount > 0 && (
          <>
            <Separator className="my-4 bg-white/10" />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-white">{formatPrice(subtotal)}</span>
              </div>
            </div>
            <SheetFooter className="mt-6">
              <div className="w-full space-y-2">
                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={checkoutMutation.isPending}
                  data-testid="btn-checkout"
                >
                  {checkoutMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  Checkout
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={clearCart}
                  data-testid="btn-clear-cart"
                >
                  Clear Cart
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default function StorePage() {
  const { addItem, setSubscription, selectedSubscription } = useCart();
  const { toast } = useToast();

  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ["stripe-products"],
    queryFn: async () => {
      const response = await fetch("/api/stripe/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  const products: StripeProduct[] = productsData?.data || [];
  const oneTimeProducts = products.filter(p => p.prices[0] && !p.prices[0].recurring);
  const subscriptionProducts = products.filter(p => p.prices[0]?.recurring);

  const handleAddToCart = (item: CartItem) => {
    addItem(item);
    toast({
      title: "Added to cart",
      description: `${item.productName} added to your cart`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="btn-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Store</h1>
              <p className="text-muted-foreground">Premium features and services</p>
            </div>
          </div>
          <CartSheet />
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-400">Failed to load products</p>
            <p className="text-muted-foreground text-sm mt-2">Please try again later</p>
          </div>
        )}

        {!isLoading && !error && products.length === 0 && (
          <div className="text-center py-20">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-white text-lg">No products available</p>
            <p className="text-muted-foreground text-sm mt-2">Check back soon for new offerings</p>
          </div>
        )}

        {subscriptionProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Subscription Plans
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptionProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onSelectSubscription={setSubscription}
                  selectedSubscriptionId={selectedSubscription?.priceId || null}
                />
              ))}
            </div>
          </section>
        )}

        {oneTimeProducts.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              One-Time Purchases
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {oneTimeProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onSelectSubscription={setSubscription}
                  selectedSubscriptionId={selectedSubscription?.priceId || null}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
