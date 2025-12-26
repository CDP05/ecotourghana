// Simple Express server to receive review submissions and send email via SMTP
// Configure SMTP via environment variables documented in README.

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Helper to create transporter from env vars
function createTransporter() {
    const service = process.env.SMTP_SERVICE; // e.g. 'gmail'
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = (process.env.SMTP_SECURE === 'true');

    // Prefer service shorthand (e.g., Gmail) when provided
    if (service && user && pass) {
        return nodemailer.createTransport({
            service: service,
            auth: { user: user, pass: pass }
        });
    }

    // Fallback to explicit host/port configuration
    if (host && port && user && pass) {
        return nodemailer.createTransport({
            host: host,
            port: parseInt(port, 10),
            secure: secure,
            auth: { user: user, pass: pass }
        });
    }

    return null;
}

app.post('/send-review', async (req, res) => {
    try {
        // Log incoming request details for debugging
        try {
            var clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
            console.log('Incoming review request from:', clientIp);
            console.log('Headers:', JSON.stringify({ host: req.headers.host, origin: req.headers.origin, 'user-agent': req.headers['user-agent'] }));
            console.log('Payload:', JSON.stringify(req.body));
        } catch (logErr) {
            console.warn('Error logging request info', logErr);
        }
        const { name, email, rating, message } = req.body || {};
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const transporter = createTransporter();
        if (!transporter) {
            console.error('SMTP configuration missing (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS)');
            return res.status(500).json({ success: false, error: 'Server email not configured' });
        }

        const toEmail = process.env.REVIEW_DEST_EMAIL || 'judecommey37@gmail.com';
        console.log('Sending review email to:', toEmail);
        const subject = `New review from ${name} (${rating || 'N/A'} stars)`;
        const text = `New review submitted\n\nName: ${name}\nEmail: ${email}\nRating: ${rating || 'N/A'}\n\nMessage:\n${message}`;
        const html = `<p>New review submitted</p>
            <p><strong>Name:</strong> ${name}<br/>
            <strong>Email:</strong> ${email}<br/>
            <strong>Rating:</strong> ${rating || 'N/A'}</p>
            <p><strong>Message:</strong><br/>${message.replace(/\n/g,'<br/>')}</p>`;

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || user || 'no-reply@example.com',
            to: toEmail,
            subject: subject,
            text: text,
            html: html
        });

        console.log('Review email sent:', info && info.messageId);
        return res.json({ success: true });
    } catch (err) {
        console.error('Error sending review email', err);
        return res.status(500).json({ success: false, error: 'Failed to send email' });
    }
});

app.get('/', (req, res) => {
    res.send('Review email endpoint running');
});

app.listen(PORT, () => console.log(`Review server listening on port ${PORT}`));
