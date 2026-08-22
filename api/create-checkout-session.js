// Vercel serverless function — creates an embedded Stripe Checkout Session
// for the Living Leadership deposit and returns its client secret.
//
// Requires the environment variable STRIPE_SECRET_KEY to be set in Vercel
// (Project > Settings > Environment Variables). Never hard-code the secret key.
//
// PRICE_ID is the Stripe Price (price_...) for the deposit — safe to keep in code.

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PRICE_ID = 'price_1U7N8bRoQXKqP1qiiTFX6fA2'; // TEMP: $1 test price — swap back to price_1TyyGiRoQXKqP1qiSDdNcyyw (deposit $2,250) after testing
const DOMAIN = 'https://heartofmen.org';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      allow_promotion_codes: true,
      return_url: `${DOMAIN}/confirm?session_id={CHECKOUT_SESSION_ID}`,
    });

    res.status(200).json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error('create-checkout-session error:', err.message);
    res.status(500).json({ error: 'Unable to start checkout. Please try again.' });
  }
};
