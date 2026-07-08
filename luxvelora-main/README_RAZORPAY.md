# VELORA Razorpay Integration

This project uses Razorpay Standard Checkout for secure prepaid payments.

## Installation

Install the Razorpay server SDK:

```bash
npm install razorpay
```

The package is declared in `package.json`.

## Environment Variables

Create a local `.env.local` file:

```bash
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_TAfKUroxloEPUi
RAZORPAY_KEY_ID=rzp_test_TAfKUroxloEPUi
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
MONGO_URL=your_mongodb_connection_string
DB_NAME=velora
```

Never commit `RAZORPAY_KEY_SECRET`. The secret is only read by server API routes.

## Running Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, visit any product, choose size/color/quantity, and click **Buy Now**. The order summary modal creates a Razorpay order from server-side product pricing before opening Checkout.

The existing cart checkout also supports the Razorpay payment option.

## Testing Payments

Use Razorpay test mode credentials and test payment instruments from the Razorpay dashboard documentation.

Flow:

1. Click **Buy Now** or choose Razorpay in checkout.
2. Confirm the order summary.
3. Complete Razorpay Standard Checkout.
4. The app calls `/api/verify-payment`.
5. Valid payments redirect to `/payment/success`.
6. Failed or unverifiable payments redirect to `/payment/failed`.

## Going Live

Before production:

1. Replace test keys with live Razorpay keys.
2. Set `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_ID` to the live key id.
3. Set `RAZORPAY_KEY_SECRET` to the live secret in your deployment provider.
4. Confirm your Razorpay dashboard has UPI, cards, net banking, and wallets enabled.
5. Run a low-value production transaction and verify the success page shows the correct order and payment IDs.

## Deployment

Required deployment secrets:

```bash
NEXT_PUBLIC_RAZORPAY_KEY_ID
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
MONGO_URL
DB_NAME
```

Do not expose `RAZORPAY_KEY_SECRET` to the browser. Only `NEXT_PUBLIC_RAZORPAY_KEY_ID` is client-visible.
