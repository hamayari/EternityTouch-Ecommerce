# Email Configuration Guide

## ✅ Current Setup (Gmail SMTP)

The email system is now configured and working with Gmail SMTP.

### Configuration Details

- **Service**: Gmail SMTP
- **Host**: smtp.gmail.com
- **Port**: 587
- **Email**: hamayari71@gmail.com
- **Authentication**: App Password (16 characters)

### Email Features

1. **Order Confirmation** - Sent automatically when customer places an order
2. **Verification Email** - Sent when new user registers
3. **Welcome Email** - Sent after email verification
4. **Tracking Updates** - Sent when order is shipped with tracking number

### How It Works

When a customer places an order:
1. Order is saved to database
2. Stock is decremented
3. Cart is cleared
4. Email confirmation is sent to customer's email
5. If email fails, order still succeeds (email is non-blocking)

### Testing

Run this command to test email sending:
```bash
node send-test-order-email.js
```

### Gmail App Password Setup

If you need to create a new App Password:

1. Go to https://myaccount.google.com/apppasswords
2. Make sure 2-Step Verification is enabled
3. Create a new App Password for "Mail"
4. Copy the 16-character password (remove spaces)
5. Update `EMAIL_PASS` in `.env` file

### Troubleshooting

**Error: "Invalid login: 535"**
- App Password is incorrect or expired
- Create a new App Password
- Make sure 2-Step Verification is enabled

**Error: "Missing credentials for PLAIN"**
- Environment variables not loaded
- Restart the server after updating `.env`
- Check that `.env` file has no line breaks in EMAIL_PASS

**Email not received**
- Check spam folder
- Verify email address is correct
- Check server logs for error messages

### Production Recommendations

For production, consider using a professional email service:

1. **SendGrid** - 100 emails/day free
2. **Mailgun** - 5,000 emails/month free
3. **AWS SES** - Very cheap, pay-as-you-go
4. **Brevo (Sendinblue)** - 300 emails/day free

These services provide:
- Better deliverability
- Email analytics
- Template management
- Higher sending limits
- Professional sender reputation

### Current Status

✅ Email system is active and working
✅ Order confirmations are being sent
✅ Professional HTML templates
✅ Non-blocking (orders succeed even if email fails)

Last updated: February 15, 2026
