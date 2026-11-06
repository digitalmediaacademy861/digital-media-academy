// Digital Media Academy: payment settings. These two values are public, they are not passwords.
// The Paystack SECRET key never goes in this file. It is stored privately inside Cloudflare.

// Paystack public key. Live keys start with pk_live_ (real money). Test keys start with pk_test_ (fake money).
export const PAYSTACK_PUBLIC_KEY = 'pk_live_37b0fe34ed4f1debab5b9bde5278fc828c6c0705';

// Address of the payment checker (the Cloudflare Worker). Paste it here once the Worker is deployed.
// While this still says PASTE_..., payments are switched off and the lessons stay open to every member.
export const WORKER_URL = 'https://dma-pay.godswilludo90.workers.dev';

// Price in kobo (100 kobo = 1 naira). 100000 = N1,000
export const PRICE_KOBO = 100000;
