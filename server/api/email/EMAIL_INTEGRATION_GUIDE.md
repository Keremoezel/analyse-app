# Email Service Integration Guide

This guide explains how to integrate email functionality into your DISG Persönlichkeitstest application. The skeleton API endpoints are already created - you just need to add your email service credentials and uncomment the integration code.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Choosing an Email Service](#choosing-an-email-service)
3. [Step-by-Step Integration](#step-by-step-integration)
4. [Option 1: Resend (Recommended)](#option-1-resend-recommended)
5. [Option 2: SendGrid](#option-2-sendgrid)
6. [Option 3: Nodemailer (SMTP)](#option-3-nodemailer-smtp)
7. [Testing Your Integration](#testing-your-integration)
8. [Troubleshooting](#troubleshooting)

---

## Overview

Your application has two email APIs ready for integration:

### 1. Test Results Email (`/api/email/send-results`)
- **Purpose**: Send DISG test results to users after they complete the test
- **From**: Noreply email (e.g., `noreply@yourdomain.com`)
- **To**: User's email
- **File**: `server/api/email/send-results.post.ts`
- **Triggered by**: Test submission

### 2. Contact Form Email (`/api/email/send-contact`)
- **Purpose**: Send contact form submissions to admin
- **From**: Support email (e.g., `support@yourdomain.com`)
- **To**: Admin email
- **Reply-To**: User's email (allows admin to reply directly)
- **File**: `server/api/email/send-contact.post.ts`
- **Triggered by**: Contact form submission on results page

---

## Choosing an Email Service

Here are the recommended email services:

| Service | Best For | Pricing | Pros | Cons |
|---------|----------|---------|------|------|
| **Resend** | Modern apps, Vercel users | Free tier: 100/day | Modern API, great DX, built-in templates | Newer service |
| **SendGrid** | High volume | Free tier: 100/day | Reliable, widely used | More complex API |
| **Nodemailer** | Any SMTP provider | Varies by provider | Works with any SMTP | Requires SMTP setup |
| **Postmark** | Transactional emails | Free trial, then paid | Fast delivery, great analytics | No free tier |

**Recommendation**: Use **Resend** for the easiest setup, especially if deployed on Vercel.

---

## Step-by-Step Integration

### Step 1: Get Your API Credentials

#### For Resend:
1. Go to [resend.com](https://resend.com) and sign up
2. Verify your domain (or use their test domain initially)
3. Go to **API Keys** → **Create API Key**
4. Copy the API key (starts with `re_...`)

#### For SendGrid:
1. Go to [sendgrid.com](https://sendgrid.com) and sign up
2. Complete sender verification
3. Go to **Settings** → **API Keys** → **Create API Key**
4. Copy the API key (starts with `SG.`)

---

### Step 2: Add Environment Variables

Open your `.env` file and add these variables:

```env
# Email Configuration
EMAIL_FROM_NOREPLY=noreply@yourdomain.com
EMAIL_FROM_SUPPORT=support@yourdomain.com
EMAIL_API_KEY=your-api-key-here
EMAIL_ADMIN_RECIPIENT=admin@yourdomain.com
```

**Replace with your values:**
- `EMAIL_FROM_NOREPLY`: Email address for test results (must be verified in your email service)
- `EMAIL_FROM_SUPPORT`: Email address for contact forms (must be verified)
- `EMAIL_API_KEY`: Your email service API key from Step 1
- `EMAIL_ADMIN_RECIPIENT`: Where contact form submissions should be sent

**⚠️ IMPORTANT**: Add `.env` to your `.gitignore` to keep credentials secure!

---

### Step 3: Update Nuxt Configuration

Open `nuxt.config.ts` and add email config to `runtimeConfig`:

```typescript
export default defineNuxtConfig({
  // ... existing config

  runtimeConfig: {
    // Server-side only (kept secret)
    adminPassword: '',
    emailFromNoreply: process.env.EMAIL_FROM_NOREPLY,
    emailFromSupport: process.env.EMAIL_FROM_SUPPORT,
    emailApiKey: process.env.EMAIL_API_KEY,
    emailAdminRecipient: process.env.EMAIL_ADMIN_RECIPIENT,

    // Public (exposed to client)
    public: {
      // client side keys
    }
  },
})
```

---

## Option 1: Resend (Recommended)

### Install Resend

```bash
pnpm add resend
```

### Update `server/api/email/send-results.post.ts`

Find the **TODO section** (around line 52) and replace it with:

```typescript
// Import at top of file
import { Resend } from 'resend'

// ... in the handler function

// Initialize Resend
const resend = new Resend(useRuntimeConfig().emailApiKey)

// Send email
await resend.emails.send({
    from: emailData.from,
    to: emailData.to,
    subject: emailData.subject,
    html: generateResultEmailHTML(emailData),
})

console.log('✅ Results email sent successfully to:', emailData.to)
```

### Update `server/api/email/send-contact.post.ts`

Find the **TODO section** (around line 38) and replace it with:

```typescript
// Import at top of file
import { Resend } from 'resend'

// ... in the handler function

// Initialize Resend
const resend = new Resend(config.emailApiKey)

// Send email to admin
await resend.emails.send({
    from: adminEmailData.from,
    to: adminEmailData.to,
    replyTo: adminEmailData.replyTo,
    subject: adminEmailData.subject,
    html: generateContactEmailHTML(adminEmailData),
})

// OPTIONAL: Send confirmation to user
await resend.emails.send({
    from: adminEmailData.from,
    to: body.email,
    subject: 'Vielen Dank für Ihre Nachricht',
    html: generateConfirmationEmailHTML(body.name),
})

console.log('✅ Contact form email sent successfully')
```

### Remove Development Logging

After adding Resend integration, **remove or comment out** these lines:

```typescript
// Remove these console.log statements:
console.log('📧 [DEVELOPMENT] Would send results email:', ...)
console.log('📧 [DEVELOPMENT] Would send contact form email:', ...)

// And update the return statement:
return {
    success: true,
    message: 'Email sent successfully',
}
```

---

## Option 2: SendGrid

### Install SendGrid

```bash
pnpm add @sendgrid/mail
```

### Update `server/api/email/send-results.post.ts`

```typescript
// Import at top of file
import sgMail from '@sendgrid/mail'

// ... in the handler function

// Initialize SendGrid
sgMail.setApiKey(useRuntimeConfig().emailApiKey)

// Send email
await sgMail.send({
    from: emailData.from,
    to: emailData.to,
    subject: emailData.subject,
    html: generateResultEmailHTML(emailData),
})

console.log('✅ Results email sent successfully to:', emailData.to)
```

### Update `server/api/email/send-contact.post.ts`

```typescript
// Import at top of file
import sgMail from '@sendgrid/mail'

// ... in the handler function

// Initialize SendGrid
sgMail.setApiKey(config.emailApiKey)

// Send email to admin
await sgMail.send({
    from: adminEmailData.from,
    to: adminEmailData.to,
    replyTo: adminEmailData.replyTo,
    subject: adminEmailData.subject,
    html: generateContactEmailHTML(adminEmailData),
})

// OPTIONAL: Send confirmation to user
await sgMail.send({
    from: adminEmailData.from,
    to: body.email,
    subject: 'Vielen Dank für Ihre Nachricht',
    html: generateConfirmationEmailHTML(body.name),
})

console.log('✅ Contact form email sent successfully')
```

---

## Option 3: Nodemailer (SMTP)

### Install Nodemailer

```bash
pnpm add nodemailer
pnpm add -D @types/nodemailer
```

### Update `server/api/email/send-results.post.ts`

```typescript
// Import at top of file
import nodemailer from 'nodemailer'

// ... in the handler function

// Create transporter (SMTP configuration)
const transporter = nodemailer.createTransporter({
    host: 'smtp.youremailprovider.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: useRuntimeConfig().emailFromNoreply,
        pass: useRuntimeConfig().emailApiKey, // or use separate SMTP password
    },
})

// Send email
await transporter.sendMail({
    from: emailData.from,
    to: emailData.to,
    subject: emailData.subject,
    html: generateResultEmailHTML(emailData),
})

console.log('✅ Results email sent successfully to:', emailData.to)
```

**Note**: For SMTP, you'll need to add `SMTP_HOST`, `SMTP_PORT`, etc. to your environment variables.

---

## Testing Your Integration

### 1. Development Testing

After integration, restart your dev server:

```bash
# Stop current server (Ctrl+C)
pnpm run dev
```

### 2. Test Results Email

1. Go to `http://localhost:3000`
2. Complete the DISG test
3. Enter your email address
4. Submit the test
5. Check your inbox for the results email
6. Check terminal for success/error logs

### 3. Test Contact Form Email

1. Navigate to any result page
2. Click "So eine Auswertung möchte ich auch haben"
3. Fill out the contact form
4. Submit
5. Check admin email inbox
6. (Optional) Check user email for confirmation

### 4. Check Logs

Look for these logs in your terminal:

```
✅ Results email sent successfully to: user@example.com
✅ Contact form email sent successfully
```

If you see errors, see [Troubleshooting](#troubleshooting).

---

## Troubleshooting

### Error: "Authentication failed"

**Problem**: Invalid API key or credentials

**Solution**:
- Double-check your API key in `.env`
- Ensure no extra spaces in the key
- Verify the key is still valid in your email service dashboard
- Restart dev server after changing `.env`

### Error: "Sender not verified"

**Problem**: Email address not verified in email service

**Solution**:
- For Resend/SendGrid: Verify your domain or email address in their dashboard
- Use the test domain provided by your email service for development
- Check sender verification status

### Error: "Module not found"

**Problem**: Email package not installed

**Solution**:
```bash
# For Resend
pnpm add resend

# For SendGrid
pnpm add @sendgrid/mail

# For Nodemailer
pnpm add nodemailer @types/nodemailer
```

### Emails not arriving

**Checklist**:
- ✅ Check spam/junk folder
- ✅ Verify recipient email is correct
- ✅ Check email service dashboard for delivery status
- ✅ Look for errors in terminal logs
- ✅ Ensure sender email is verified
- ✅ Check email service rate limits

### Development vs Production

**Development** (current state):
- Emails are logged to console but not sent
- `development: true` in API response

**After Integration**:
- Emails are actually sent
- Remove `development: true` from responses
- Test in development first, then production

---

## Next Steps

After successful integration:

1. **Test thoroughly** in development
2. **Deploy to production** (Vercel/Cloudflare)
3. **Add environment variables** to your hosting platform
4. **Test in production** with real email addresses
5. **Monitor email delivery** via your service dashboard
6. **Optional**: Add email templates using your service's template feature
7. **Optional**: Track email opens/clicks with your service analytics

---

## Support

If you need help:
- **Resend**: [docs.resend.com](https://resend.com/docs)
- **SendGrid**: [docs.sendgrid.com](https://docs.sendgrid.com)
- **Nodemailer**: [nodemailer.com/about/](https://nodemailer.com/about/)

---

**Last Updated**: February 2026  
**Created for**: DISG Persönlichkeitstest Application

EMAIL_ADMIN_RECIPIENT=your-real-email@example.com  # ← Change this!
EMAIL_FROM_NOREPLY=noreply@your-actual-domain.com
EMAIL_FROM_SUPPORT=support@your-actual-domain.com