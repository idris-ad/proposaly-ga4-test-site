# Proposaly GA4 test site

A mock business website (**Brightwell Home Studio**, a fictional interior-design studio, light theme only) on
GitHub Pages that hosts the Proposaly web agent next to Google Analytics 4.
Used to test **Connect GA4** (server-side `proposaly_conversation` / `proposaly_lead` events) and the
host-page events the widget fires.

## Setup

1. **GA4**: create a GA4 property with a *web* data stream for the Pages URL (see below) and copy its
   Measurement ID (`G-…`).
2. **Agent**: in Proposaly (test environment), open the agent → Channels → Web chat, add the Pages
   domain to the allowed domains (`idris-ad.github.io`), set the agent live, and copy the
   `data-bot-id` value from the embed snippet.
3. Edit `index.html` — the constants at the top:
   - `GA_MEASUREMENT_ID`
   - `PROPOSALY_BOT_ID` (currently the test agent `wcEeLN…`)
   (`PROPOSALY_WIDGET_SRC` points at the test CDN; switch to `cdn.proposaly.io` for production.)
4. Commit to `main`; GitHub Pages redeploys in about a minute.

## Testing Connect GA4

1. In Proposaly: agent → Mission → Conversion settings → Tracking → **Connect GA4**, pick the property /
   stream from step 1, finish setup.
2. Open this site, send a message to the agent. The page log shows `proposaly_conversation`; GA4 →
   Reports → **Realtime** shows the same event with `transport: server` and `source: proposaly`.
3. Give the agent contact details so it creates a lead → `proposaly_lead`.

The page does **not** forward the host-page events to GA4 client-side (that would double count with
the server-side events). To test the GTM-less client-side path instead, uncomment the last block in
`index.html`.

## Developer panel

Hidden by default so the page looks like a real business site. Open it with the **Developer panel** link in the
footer, or with `?debug=1` in the URL. It shows GA4 / widget / `_ga` cookie status and logs every
`proposaly_conversation` / `proposaly_lead` the widget fires.

Files: `index.html` (content + config), `styles.css`, `app.js` (widget loader, chat buttons, developer panel).
