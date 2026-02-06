import { generatePdf } from '../.././utils/pdf-generator'

export default defineEventHandler(async (event) => {
    const sampleData = {
        name: 'Max Mustermann',
        email: 'max@mustermann.de',
        phone: '+49 123 456789',
        availability: 'Wochentags 14-16 Uhr',
        message: 'Ich interessiere mich sehr für die detaillierte Analyse meines DISG-Profils. \n\nKönnen Sie mir bitte weitere Informationen zu den Coaching-Paketen geben? \n\nHerzliche Grüße, \nMax',
        timestamp: new Date().toLocaleString('de-DE'),
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Arial', sans-serif; color: #333; line-height: 1.6; padding: 40px; }
        .header { border-bottom: 2px solid #4a90d9; padding-bottom: 20px; margin-bottom: 30px; }
        h1 { color: #1a1a2e; margin: 0; font-size: 24px; }
        .section { margin-bottom: 25px; }
        .section-title { font-weight: bold; color: #4a90d9; font-size: 18px; margin-bottom: 10px; border-bottom: 1px solid #eee; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 8px 0; vertical-align: top; }
        .label { font-weight: bold; width: 150px; }
        .message-box { background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee; white-space: pre-wrap; }
        .footer { margin-top: 50px; font-size: 12px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Kopie Ihrer Kontaktanfrage</h1>
        <p>Power4-people Kurzanalyse</p>
    </div>

    <div class="section">
        <div class="section-title">Kontaktdaten</div>
        <table>
            <tr>
                <td class="label">Name:</td>
                <td>${sampleData.name}</td>
            </tr>
            <tr>
                <td class="label">E-Mail:</td>
                <td>${sampleData.email}</td>
            </tr>
            <tr>
                <td class="label">Telefon:</td>
                <td>${sampleData.phone}</td>
            </tr>
            <tr>
                <td class="label">Erreichbarkeit:</td>
                <td>${sampleData.availability}</td>
            </tr>
            <tr>
                <td class="label">Datum:</td>
                <td>${sampleData.timestamp}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Ihre Nachricht</div>
        <div class="message-box">${sampleData.message}</div>
    </div>

    <div class="footer">
        © ${new Date().getFullYear()} Power4-people Team | DISG Persönlichkeitsanalyse
    </div>
</body>
</html>
    `.trim()

    const pdfBuffer = await generatePdf(html)

    appendHeader(event, 'Content-Type', 'application/pdf')
    appendHeader(event, 'Content-Disposition', 'inline; filename="Kontaktanfrage-Vorschau.pdf"')

    return pdfBuffer
})
