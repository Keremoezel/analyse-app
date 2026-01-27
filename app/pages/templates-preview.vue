<script setup lang="ts">
// Sample data for preview
const sampleData = {
  name: 'Max Mustermann',
  email: 'max.mustermann@example.com',
  date: new Date().toLocaleDateString('de-DE', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }),
  scores: {
    D: 28,
    I: 22,
    S: 18,
    G: 32
  },
  primaryType: {
    name: 'Gewissenhaft',
    icon: '📊',
    description: 'Sie sind eine analytische und detailorientierte Persönlichkeit, die Wert auf Genauigkeit und Qualität legt. Sie arbeiten systematisch und bevorzugen klare Strukturen und Prozesse.'
  },
  traits: [
    'Analytisch',
    'Präzise',
    'Systematisch',
    'Qualitätsbewusst',
    'Objektiv',
    'Zuverlässig'
  ],
  strengths: [
    'Hohe Qualitätsstandards',
    'Analytisches Denken',
    'Detailgenauigkeit',
    'Systematische Arbeitsweise'
  ],
  challenges: [
    'Perfektionismus',
    'Entscheidungszögerung',
    'Kritische Haltung',
    'Schwierigkeiten mit Veränderungen'
  ],
  resultUrl: 'https://analyseapp.vercel.app/result/abc-123-def'
}

// Load email template
const emailHtml = ref('')
const pdfHtml = ref('')

onMounted(async () => {
  try {
    // In a real implementation, these would be loaded from the server
    // For now, we'll just show the structure
    emailHtml.value = 'Email template loaded'
    pdfHtml.value = 'PDF template loaded'
  } catch (e) {
    console.error('Failed to load templates', e)
  }
})

function replaceTemplate(template: string, data: any): string {
  return template
    .replace(/{{NAME}}/g, data.name)
    .replace(/{{D_SCORE}}/g, data.scores.D.toString())
    .replace(/{{I_SCORE}}/g, data.scores.I.toString())
    .replace(/{{S_SCORE}}/g, data.scores.S.toString())
    .replace(/{{G_SCORE}}/g, data.scores.G.toString())
    .replace(/{{PRIMARY_TYPE_NAME}}/g, data.primaryType.name)
    .replace(/{{PRIMARY_TYPE_ICON}}/g, data.primaryType.icon)
    .replace(/{{PRIMARY_TYPE_DESCRIPTION}}/g, data.primaryType.description)
    .replace(/{{DATE}}/g, data.date)
    .replace(/{{RESULT_URL}}/g, data.resultUrl)
}
</script>

<template>
  <div class="preview-container">
    <header class="preview-header">
      <h1>📧 Email & PDF Template Preview</h1>
      <p>Vorschau der professionellen DISG-Analyse Templates</p>
    </header>

    <div class="preview-content">
      <!-- Sample Data Display -->
      <section class="sample-data">
        <h2>📊 Beispieldaten</h2>
        <div class="data-grid">
          <div class="data-item">
            <strong>Name:</strong> {{ sampleData.name }}
          </div>
          <div class="data-item">
            <strong>Email:</strong> {{ sampleData.email }}
          </div>
          <div class="data-item">
            <strong>Haupttyp:</strong> {{ sampleData.primaryType.icon }} {{ sampleData.primaryType.name }}
          </div>
          <div class="data-item">
            <strong>D-Score:</strong> {{ sampleData.scores.D }}
          </div>
          <div class="data-item">
            <strong>I-Score:</strong> {{ sampleData.scores.I }}
          </div>
          <div class="data-item">
            <strong>S-Score:</strong> {{ sampleData.scores.S }}
          </div>
          <div class="data-item">
            <strong>G-Score:</strong> {{ sampleData.scores.G }}
          </div>
        </div>
      </section>

      <!-- Template Info -->
      <section class="template-info">
        <h2>📝 Template Informationen</h2>
        <div class="info-cards">
          <div class="info-card">
            <h3>📧 Email Template</h3>
            <p><strong>Datei:</strong> <code>server/templates/email-template.html</code></p>
            <p><strong>Zweck:</strong> Benachrichtigung nach Testabschluss</p>
            <p><strong>Features:</strong></p>
            <ul>
              <li>Responsive Design</li>
              <li>Score-Übersicht</li>
              <li>Link zu Online-Ergebnissen</li>
              <li>PDF-Anhang Hinweis</li>
            </ul>
            <a href="/server/templates/email-template.html" target="_blank" class="preview-btn">
              Template öffnen →
            </a>
          </div>

          <div class="info-card">
            <h3>📄 PDF Template</h3>
            <p><strong>Datei:</strong> <code>server/templates/pdf-template.html</code></p>
            <p><strong>Zweck:</strong> Detaillierte Persönlichkeitsanalyse (4 Seiten)</p>
            <p><strong>Inhalt:</strong></p>
            <ul>
              <li>Deckblatt</li>
              <li>Score-Übersicht & Haupttyp</li>
              <li>Detaillierte Analyse</li>
              <li>Kommunikation & Karriere</li>
              <li>Grafische Auswertung</li>
            </ul>
            <a href="/server/templates/pdf-template.html" target="_blank" class="preview-btn">
              Template öffnen →
            </a>
          </div>
        </div>
      </section>

      <!-- Implementation Status -->
      <section class="implementation-status">
        <h2>🚀 Implementierungsstatus</h2>
        <div class="status-list">
          <div class="status-item done">
            <span class="status-icon">✅</span>
            <div>
              <strong>Email Template erstellt</strong>
              <p>Professionelles HTML-Template mit Platzhaltern</p>
            </div>
          </div>
          <div class="status-item done">
            <span class="status-icon">✅</span>
            <div>
              <strong>PDF Template erstellt</strong>
              <p>4-seitiges detailliertes Analyse-Dokument</p>
            </div>
          </div>
          <div class="status-item done">
            <span class="status-icon">✅</span>
            <div>
              <strong>Dokumentation</strong>
              <p>README mit Implementierungsanleitung</p>
            </div>
          </div>
          <div class="status-item pending">
            <span class="status-icon">⏳</span>
            <div>
              <strong>PDF-Generierung</strong>
              <p>Puppeteer oder ähnliche Library installieren</p>
            </div>
          </div>
          <div class="status-item pending">
            <span class="status-icon">⏳</span>
            <div>
              <strong>Email-Service</strong>
              <p>SMTP konfigurieren (Nodemailer, Resend, etc.)</p>
            </div>
          </div>
          <div class="status-item pending">
            <span class="status-icon">⏳</span>
            <div>
              <strong>Integration</strong>
              <p>In submit.post.ts einbinden</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Next Steps -->
      <section class="next-steps">
        <h2>📋 Nächste Schritte</h2>
        <div class="steps-content">
          <h3>Wenn Sie Email-Versand aktivieren möchten:</h3>
          <ol>
            <li>
              <strong>Email-Service wählen:</strong>
              <ul>
                <li>Resend (empfohlen, einfach)</li>
                <li>SendGrid (professionell)</li>
                <li>Nodemailer mit SMTP</li>
              </ul>
            </li>
            <li>
              <strong>PDF-Generator installieren:</strong>
              <code>npm install puppeteer</code>
            </li>
            <li>
              <strong>Umgebungsvariablen setzen:</strong>
              <ul>
                <li><code>SMTP_HOST</code></li>
                <li><code>SMTP_USER</code></li>
                <li><code>SMTP_PASS</code></li>
              </ul>
            </li>
            <li>
              <strong>Code implementieren</strong> (siehe README.md)
            </li>
          </ol>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.preview-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background: #f8f9fa;
}

.preview-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
}

.preview-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.preview-header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

section h2 {
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.5rem;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.data-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #667eea;
}

.data-item strong {
  color: #666;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 0.25rem;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.info-card {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px solid #e9ecef;
}

.info-card h3 {
  color: #667eea;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.info-card p {
  margin-bottom: 0.75rem;
  color: #666;
}

.info-card code {
  background: #e9ecef;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #764ba2;
}

.info-card ul {
  margin: 0.5rem 0 1rem 1.5rem;
  color: #666;
}

.info-card li {
  margin-bottom: 0.25rem;
}

.preview-btn {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}

.preview-btn:hover {
  background: #764ba2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  align-items: flex-start;
}

.status-item.done {
  background: #f0fdf4;
  border-left: 4px solid #28a745;
}

.status-item.pending {
  background: #fffbeb;
  border-left: 4px solid #fd7e14;
}

.status-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.status-item strong {
  color: #333;
  display: block;
  margin-bottom: 0.25rem;
}

.status-item p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.steps-content h3 {
  color: #667eea;
  margin-bottom: 1rem;
}

.steps-content ol {
  margin-left: 1.5rem;
}

.steps-content li {
  margin-bottom: 1rem;
  color: #333;
}

.steps-content ul {
  margin: 0.5rem 0 0 1.5rem;
}

.steps-content ul li {
  margin-bottom: 0.5rem;
  color: #666;
}

.steps-content code {
  background: #e9ecef;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #764ba2;
}
</style>
