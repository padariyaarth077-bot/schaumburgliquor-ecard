# Schaumburg Liquors digital card

A mobile-first business card built with standard HTML, CSS, browser JavaScript and a small Node server. The project started with photos only. No framework, database or admin panel is needed.

## Run locally

Requires Node 24 or newer.

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Open http://localhost:3000/schaumburg-liquors. The root route also serves the card.

## Business data and launch setup

Edit `public/business.js` for business information, gallery order, categories, weekly hours and special hours. Phone, address and regular hours come from the supplied screenshots. Social links were supplied by the owner. Gallery images are the original project photos, optimized into WebP. The supplied logo was cropped only to remove whitespace, preserving its proportions and artwork.

Set these server environment values before public launch:

- `PUBLIC_URL`: permanent HTTPS origin, used by canonical metadata, QR and sharing. Localhost QR codes are for local preview only; do not print them for customers.
- `GOOGLE_REVIEW_URL`: the store’s exact verified Google review destination. No place ID or destination has been invented. Until configured, the card explains that the direct link is pending and still supports writing and copying a draft.
- `OPENAI_API_KEY`, `AI_MODEL`: server-side AI credentials and a model supporting Chat Completions JSON mode. Optional `AI_ENDPOINT` supports a compatible provider. There is no fake AI or canned success response when credentials are absent.
- `WEBSITE_URL`: optional main store website, hidden until configured.

The optional private-feedback form is omitted because no receiving email or delivery service was provided. Customers can call the store for private feedback. No messages are silently collected or discarded.

## Review assistant

Experience → topics → optional note → five drafts → edit → copy → Google. All experience levels are available and the Google action is independent of rating. The customer must review suggestions for accuracy. Nothing is automatically posted. Continue copies the draft and presents a normal Google link, avoiding popup blocking and allowing time to read the copy confirmation.

Only the business name, selected experience, selected topics and note enter the AI request. Keys remain on the server. Drafts are not persisted or sent to analytics. The AI provider processes submitted notes; customers are advised to avoid private information.

`POST /api/review-assistant` validates input, caps request size, uses a 20-second upstream timeout, validates exactly five unique strings, and limits requests to 5 per client per 15 minutes. **Deployment limit:** the in-memory limiter suits one Node process. Behind a proxy, configure trusted client identity and a shared rate-limit store before scaling; never blindly trust forwarded headers. Use HTTPS and deployment-level abuse protection for a public release. The current server intentionally binds loopback for local preview; adapt the listen host explicitly for your deployment environment.

## Validation

```powershell
npm run check
npm test
npm audit
```

Tests cover input/output validation, all experience levels, provider request privacy, service failure/timeout handling, rate limits, Chicago time/DST, special closures, overnight hours, HTTP failures, QR downloads and static-file boundaries. Live AI output requires credentials; actual phone-camera QR scanning and contact imports require real devices.

Native modal dialogs provide keyboard focus containment and Escape dismissal. Gallery supports keyboard arrows. Reduced motion is respected. Analytics is an opt-in `card:action` CustomEvent hook with action name and business name only; no third-party tracker is installed.

No offers, prices, ratings, testimonials or inventory availability are fabricated. Updates link to the supplied Instagram account. The reference and social pages could not be retrieved during implementation, so no scraped claims were used.


## Cloudflare deployment (AI deferred)

The public Cloudflare Worker entry is `worker.mjs`, configured in `wrangler.jsonc`. Deploy to the signed-in Cloudflare account with `npm run deploy`; use `npm run dev:cloudflare` for the actual Workers runtime locally. Static assets are served through the ASSETS binding. QR, metadata and sharing derive their public URL from the incoming HTTPS origin, so localhost URLs are never printed by the deployed version.

The deployed Worker deliberately returns an unavailable response for AI generation and leaves the Google review link blank. The Node AI implementation remains available for the later integration, but setting Node `.env` values alone does not activate AI on Cloudflare. That next phase needs a Worker-compatible backend, server-side secrets, a verified Google review link, production rate limiting and a live end-to-end check.

Live deployment: https://schaumburg-liquors-card.padariyaarth077.workers.dev/schaumburg-liquors
