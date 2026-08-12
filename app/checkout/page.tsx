import { Checkout } from "@/components/checkout";
import { Container } from "@/components/shared/layout-primitives";

export default function CheckoutPage() {
  return (
    <div className="pt-[120px] pb-20">
      <Container>
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Checkout</h1>
          <p className="mt-2 text-foreground-muted">Complete your order</p>
        </div>
        <Checkout />
      </Container>
    </div>
  );
}
