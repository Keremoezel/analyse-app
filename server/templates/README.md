# Email & PDF Templates - Documentation

## Overview
This directory contains templates for sending professional DISG personality analysis reports to users via email.

## Files

### 1. `email-template.html`
Professional HTML email template that will be sent to users after completing the test.

**Features:**
- Responsive design for all email clients
- Summary of DISG scores
- Primary personality type highlight
- Link to online results
- PDF attachment notice

**Placeholders:**
- `{{NAME}}` - User's name (extracted from email)
- `{{D_SCORE}}`, `{{I_SCORE}}`, `{{S_SCORE}}`, `{{G_SCORE}}` - Individual scores
- `{{PRIMARY_TYPE_NAME}}` - Main personality type (e.g., "Dominant")
- `{{PRIMARY_TYPE_ICON}}` - Emoji icon for the type
- `{{RESULT_URL}}` - Link to online results page

### 2. `pdf-template.html`
Multi-page PDF report template (4 pages) with detailed personality analysis.

**Pages:**
1. **Cover Page** - Professional title page with user name and date
2. **Overview & Scores** - Score breakdown and primary type
3. **Detailed Analysis** - Characteristics, strengths, and development areas
4. **Communication & Career** - Tips and recommendations
5. **Visual Chart** - Graphical representation and summary

**Placeholders:**
- All email placeholders plus:
- `{{DATE}}` - Report generation date
- `{{PRIMARY_TYPE_DESCRIPTION}}` - Detailed type description
- `{{TRAITS}}` - Array of characteristic traits
- `{{STRENGTHS}}` - Array of strengths
- `{{CHALLENGES}}` - Array of development areas
- `{{COMMUNICATION_STYLE}}`, `{{COMMUNICATION_FOCUS}}`, `{{COMMUNICATION_AVOID}}` - Communication tips
- `{{INTERACTION_TIPS}}` - Tips for interacting with other types
- `{{CAREER_AREA_1/2/3}}` - Suitable career areas
- `{{WORK_ENVIRONMENT}}` - Ideal work environment description
- `{{KEY_STRENGTH}}` - Main strength summary

## Implementation Steps (TODO)

### Phase 1: PDF Generation
1. Install PDF generation library:
   ```bash
   npm install puppeteer
   # or
   npm install @react-pdf/renderer
   # or
   npm install pdfkit
   ```

2. Create PDF generator service:
   - Load template
   - Replace placeholders with actual data
   - Generate PDF buffer
   - Return PDF for attachment

### Phase 2: Email Service
1. Install email service:
   ```bash
   npm install nodemailer
   # or use Resend, SendGrid, etc.
   ```

2. Configure email credentials (add to `.env`):
   ```
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your-email@example.com
   SMTP_PASS=your-password
   ```

3. Create email sender service:
   - Load email template
   - Replace placeholders
   - Attach generated PDF
   - Send email

### Phase 3: Integration
1. Update `server/api/test/submit.post.ts`:
   - After saving result to database
   - Generate PDF report
   - Send email with PDF attachment
   - Return success response

2. Add background job (optional):
   - Use queue system (Bull, BullMQ)
   - Send emails asynchronously
   - Retry failed sends

## Example Usage (Future)

```typescript
// server/utils/pdf-generator.ts
import puppeteer from 'puppeteer'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function generateDISGReport(data: {
  name: string
  scores: { D: number, I: number, S: number, G: number }
  primaryType: string
  // ... other data
}): Promise<Buffer> {
  const template = readFileSync(
    join(process.cwd(), 'server/templates/pdf-template.html'),
    'utf-8'
  )
  
  // Replace placeholders
  let html = template
    .replace(/{{NAME}}/g, data.name)
    .replace(/{{D_SCORE}}/g, data.scores.D.toString())
    // ... replace all placeholders
  
  // Generate PDF
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setContent(html)
  const pdf = await page.pdf({ format: 'A4' })
  await browser.close()
  
  return pdf
}

// server/utils/email-sender.ts
import nodemailer from 'nodemailer'

export async function sendDISGReport(
  email: string,
  pdfBuffer: Buffer,
  data: any
) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  
  const emailTemplate = readFileSync(
    join(process.cwd(), 'server/templates/email-template.html'),
    'utf-8'
  )
  
  // Replace placeholders in email
  const html = emailTemplate
    .replace(/{{NAME}}/g, data.name)
    // ... replace all
  
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Ihre DISG Persönlichkeitsanalyse',
    html,
    attachments: [
      {
        filename: `DISG-Analyse-${data.name}.pdf`,
        content: pdfBuffer,
      },
    ],
  })
}
```

## Testing Templates

You can preview the templates by opening them directly in a browser:
- Email: `server/templates/email-template.html`
- PDF: `server/templates/pdf-template.html`

Replace placeholders manually with sample data to see how they look.

## Notes

- Templates use inline CSS for maximum email client compatibility
- PDF template uses print-optimized CSS with page breaks
- All colors and styling match the main application design
- Templates are fully responsive and professional
- Ready for production use once email/PDF services are configured
