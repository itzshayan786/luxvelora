export const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

export async function openRazorpayCheckout({
  order,
  prefill,
  notes,
  description,
  image,
  orderPayload,
  onVerified,
  onDismiss,
}) {
  const loaded = await loadRazorpay();

  if (!loaded) {
    throw new Error("Unable to load Razorpay Checkout.");
  }

  const options = {
    key: order.key,
    amount: order.order.amount,
    currency: order.order.currency,
    name: "VELORA",
    description,
    image,

    order_id: order.order.id,

    prefill,

    notes,

    theme: {
      color: "#111827",
    },

    modal: {
      ondismiss: () => {
        onDismiss?.();
      },
    },

    handler: async function (response) {
      try {
        const verifyRes = await fetch("/api/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderPayload,
          }),
        });

        const verified = await verifyRes.json();

        if (!verifyRes.ok) {
          throw new Error(
            verified.error || "Payment verification failed."
          );
        }

        onVerified?.({
          order_id: response.razorpay_order_id,
          payment_id: response.razorpay_payment_id,
          order: verified.order,
        });
      } catch (err) {
        alert(err.message);
      }
    },
  };

  const rzp = new window.Razorpay(options);

  rzp.on("payment.failed", function (response) {
    alert(response.error.description);
  });

  rzp.open();
}