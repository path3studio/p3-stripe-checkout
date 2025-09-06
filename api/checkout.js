// /api/checkout.js — Endpoint para Stripe Checkout en Vercel (monto dinámico MXN)
import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { orderId, total } = req.body || {};
    if (!orderId || typeof total !== "number" || total <= 0) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });

    // Construye tu dominio (https://<lo-que-te-de Vercel>)
    const proto = (req.headers["x-forwarded-proto"] || "https");
    const origin = `${proto}://${req.headers.host}`;
    const success_url = `${origin}/ok.html?session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url  = `${origin}/cancelado.html`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "mxn",
          unit_amount: Math.round(total * 100),
          product_data: { name: `Pedido Path3 Studio ${orderId}` }
        },
        quantity: 1
      }],
      success_url,
      cancel_url
    });

    res.status(200).json({ url: session.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "No se pudo crear el checkout" });
  }
}
