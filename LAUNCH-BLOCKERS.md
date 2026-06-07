# Accurai — Launch Blockers

Two items must be resolved before the site goes live. Everything else is built, QA-clean, and prerendering 23/23 routes.

## 1. Formspree form ID (forms are wired, ID is a placeholder)

Both forms (Audit Request on /contact, Sample Report on the homepage) now POST to a single Formspree endpoint. The code is done — it just needs a real form ID.

Steps:
1. Create a free account at https://formspree.io (sign up with the inbox you want submissions sent to).
2. Create one form; set its notification email to hello@accurai.ca (or your interim inbox).
3. Copy the form's endpoint ID (the part after `/f/`, e.g. `mqkvabcd`).
4. In `src/index.html`, search for `YOUR_FORM_ID` and replace it (one line):
   `const FORMSPREE_ENDPOINT='https://formspree.io/f/YOUR_FORM_ID';`
5. Push — Vercel rebuilds automatically.

Each submission arrives tagged with a hidden `form_name` field ("Audit Request" or "Sample Report Request") and a distinct email subject, so one endpoint covers both. A honeypot field (`_gotcha`) is included for spam. If a submission fails, the visitor sees an inline error with the fallback email — they're never silently dropped.

## 2. hello@accurai.ca does not exist yet — domain is unregistered

As of June 6, 2026, `accurai.ca` returns NXDOMAIN — the domain has no DNS at all (likely not registered). That means `hello@accurai.ca` cannot receive mail, and the site's forms, CTAs, mailto links, and JSON-LD all point to it.

Required, in order:
1. Register `accurai.ca` (CIRA registrar — e.g., GoDaddy CA, Namecheap, Porkbun, or Rebel.ca).
2. Set up email on the domain. Cheapest path: registrar email forwarding from hello@accurai.ca to an inbox you already monitor. Proper path: Google Workspace (~CAD $8/user/mo) or Microsoft 365.
3. Send a test email to hello@accurai.ca and confirm it lands somewhere monitored.
4. Point the domain's DNS at Vercel (A record `76.76.21.21` or CNAME per Vercel's domain instructions) and add the domain in the Vercel project settings.

Do not launch or enable Formspree notifications to hello@accurai.ca until step 3 is confirmed — otherwise leads vanish.

## Status of everything else

- Forms: wired (placeholder ID), success/error/honeypot all tested headlessly — success path, HTTP error, and network failure all behave correctly.
- Build: `npm run build` renders 23/23 routes, 0 issues, sitemap generated.
- Remaining post-launch items (from the handoff): Search Console/Bing submission, Rich Results test, OG cache priming, analytics.
