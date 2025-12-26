Review email endpoint
=====================

This repository includes a small Express server that accepts review submissions from the website and sends them as email.

Files added:
- `server.js` — Express server with `/send-review` POST endpoint.
- `package.json` — Node package file (server dependencies).

How it works
- The frontend form posts JSON to `/send-review`.
- The server uses Nodemailer and SMTP credentials (set via environment variables) to send the email.

Environment variables (required):
- `SMTP_HOST` — SMTP server host (e.g. `smtp.gmail.com`)
- `SMTP_PORT` — SMTP server port (e.g. `587`)
- `SMTP_SECURE` — `true` for TLS, `false` for STARTTLS (usually `false` for 587)
- `SMTP_USER` — SMTP username
- `SMTP_PASS` — SMTP password

Optional:
- `REVIEW_DEST_EMAIL` — destination email (defaults to `judecommey37@gmail.com`)
- `EMAIL_FROM` — from address used in the message (defaults to `SMTP_USER`)

Gmail-specific notes
--------------------
If you want to send reviews using a Gmail account, the easiest approach for most developers is to use an App Password (recommended when the Gmail account has 2-Step Verification enabled):

1. Enable 2-Step Verification on the Gmail account.
2. Create an App Password (Google account > Security > App passwords). Choose `Mail` as the app and `Other` / `Custom` for device.
3. Use these settings in your environment variables:

Example (Unix shell):

```bash
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=465
export SMTP_SECURE=true
export SMTP_USER="yourgmail@gmail.com"
export SMTP_PASS="your_app_password_here"
export REVIEW_DEST_EMAIL=judecommey37@gmail.com
```

Notes:
- Port `465` with `SMTP_SECURE=true` uses SSL. Alternatively you can use port `587` and `SMTP_SECURE=false` with STARTTLS.
- If you prefer OAuth2 for Gmail, you'll need to add OAuth2 credentials and configure Nodemailer accordingly; the current server expects username/password.

SMTP_SERVICE (simpler Gmail setup)
---------------------------------
You can use Nodemailer's `service` shorthand for Gmail which accepts `SMTP_SERVICE=gmail` along with `SMTP_USER` and `SMTP_PASS` (app password). This avoids manually specifying host/port/secure.

Example using `SMTP_SERVICE`:

```bash
export SMTP_SERVICE=gmail
export SMTP_USER="yourgmail@gmail.com"
export SMTP_PASS="your_app_password_here"
export REVIEW_DEST_EMAIL=judecommey37@gmail.com
```

Troubleshooting Gmail:
- If you see authentication errors, double-check the app password and that 2-Step Verification is enabled.
- Review server logs (where you run `npm start`) for authentication error messages returned by Nodemailer/Gmail.

Run locally
1. Install dependencies:

```bash
cd ecotourghana-main
npm install
```

2. Set environment variables (example using a Unix shell):

```bash
export SMTP_HOST=smtp.example.com
export SMTP_PORT=587
export SMTP_SECURE=false
export SMTP_USER=you@example.com
export SMTP_PASS=yourpassword
export REVIEW_DEST_EMAIL=judecommey37@gmail.com
```

3. Start server:

```bash
npm start
```

Now the frontend will POST to `http://localhost:3000/send-review` if you serve the site from the same origin. If you serve the site from a different origin, update the fetch URL in `js/main.js` or configure CORS accordingly.

Security note
- Do not commit real SMTP credentials to source control. Use environment variables and secure deployment practices.
