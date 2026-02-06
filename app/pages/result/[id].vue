<script setup lang="ts">
const route = useRoute()
const resultId = route.params.id

interface ResultData {
  id: number
  email: string
  scores: {
    D: number
    I: number
    S: number
    G: number
  }
  createdAt: string
}

const contactMethods = ['Anruf', 'Email']
const selectedMethod = ref('Email') // Default to Email

const { data: result, error } = await useFetch<ResultData>(`/api/results/${resultId}`)

// DISG type descriptions
const typeDescriptions = {
  D: {
    name: 'Rot',
    color: '#dc3545',
    bgColor: '#fef2f2',
    icon: '🔥',
    image: '/reedpeople.png',
    traits: ['Ergebnisorientiert', 'Entscheidungsfreudig', 'Wettbewerbsorientiert', 'Direkt', 'Zielstrebig'],
    description: 'Sie sind eine durchsetzungsstarke Persönlichkeit, die Herausforderungen liebt und schnelle Entscheidungen trifft.',
    strengths: ['Führungsstärke', 'Entschlossenheit', 'Problemlösung'],
    challenges: ['Ungeduld', 'Risikobereitschaft', 'Dominanz'],
  },
  I: {
    name: 'Gelb',
    color: '#facc15',
    bgColor: '#fefce8',
    icon: '⭐',
    image: '/yellowpeople.png',
    traits: ['Enthusiastisch', 'Optimistisch', 'Kontaktfreudig', 'Überzeugend', 'Kreativ'],
    description: 'Sie sind eine inspirierende Persönlichkeit, die Menschen begeistert und gerne im Mittelpunkt steht.',
    strengths: ['Kommunikation', 'Motivation', 'Networking'],
    challenges: ['Detailarbeit', 'Zeitmanagement', 'Fokus'],
  },
  S: {
    name: 'Grün',
    color: '#22c55e',
    bgColor: '#f0fdf4',
    icon: '🌿',
    image: '/greenpeople.png',
    traits: ['Geduldig', 'Zuverlässig', 'Teamfähig', 'Unterstützend', 'Loyal'],
    description: 'Sie sind eine harmonische Persönlichkeit, die Stabilität schätzt und anderen hilft.',
    strengths: ['Teamarbeit', 'Zuhören', 'Beständigkeit'],
    challenges: ['Veränderungen', 'Konfrontation', 'Tempo'],
  },
  G: {
    name: 'Blau',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    icon: '🎯',
    image: '/bluepeople.png',
    traits: ['Analytisch', 'Genau', 'Strukturiert', 'Qualitätsbewusst', 'Planend'],
    description: 'Sie sind eine präzise Persönlichkeit, die Qualität und Genauigkeit über alles stellt.',
    strengths: ['Analyse', 'Planung', 'Qualitätssicherung'],
    challenges: ['Perfektionismus', 'Überanalyse', 'Kritik'],
  },
}

// Find dominant type
const dominantType = computed(() => {
  if (!result.value) return 'D'
  const scores = result.value.scores
  const max = Math.max(scores.D, scores.I, scores.S, scores.G)
  if (scores.D === max) return 'D'
  if (scores.I === max) return 'I'
  if (scores.S === max) return 'S'
  return 'G'
})

// Calculate position for the quadrant diagram (normalized to 0-100)
const quadrantPosition = computed(() => {
  if (!result.value) return { x: 50, y: 50 }
  const { D, I, S, G } = result.value.scores
  
  // X axis: Introvertiert (Blau+Grün) vs Extrovertiert (Rot+Gelb)
  // Left = Introvertiert, Right = Extrovertiert
  const introvert = G + S
  const extrovert = D + I
  const x = (extrovert / (introvert + extrovert)) * 100
  
  // Y axis: Kopfmensch (Blau+Rot) vs Bauchmensch (Grün+Gelb)
  // Top = Kopfmensch, Bottom = Bauchmensch
  const kopfmensch = G + D
  const bauchmensch = S + I
  const y = 100 - (kopfmensch / (kopfmensch + bauchmensch)) * 100
  
  return { x, y }
})

// Get secondary type
const secondaryType = computed(() => {
  if (!result.value) return null
  const scores = result.value.scores
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  return sorted[1]?.[0] as keyof typeof typeDescriptions ?? null
})

// Contact form modal
const showContactModal = ref(false)
const contactForm = ref({
  name: '',
  email: '',
  phone: '',
  availability: '',
  message: '',
  privacyAccepted: false,
  sendCopy: false
})
const isSubmittingContact = ref(false)
const contactError = ref('')
const contactSuccess = ref(false)

function openContactModal() {
  showContactModal.value = true
  contactSuccess.value = false
  contactError.value = ''
}

function closeContactModal() {
  showContactModal.value = false
  contactForm.value = { 
    name: '', 
    email: '', 
    phone: '', 
    availability: '', 
    message: '',
    privacyAccepted: false,
    sendCopy: false
  }
  contactError.value = ''
  contactSuccess.value = false
}

async function submitContactForm() {
  if (isSubmittingContact.value) return
  
  // Basic validation
  if (!contactForm.value.name || !contactForm.value.email) {
    contactError.value = 'Bitte füllen Sie alle Pflichtfelder aus'
    return
  }
  
  if (!contactForm.value.email.includes('@')) {
    contactError.value = 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
    return
  }

  if (!contactForm.value.privacyAccepted) {
    contactError.value = 'Bitte akzeptieren Sie die Datenschutzerklärung'
    return
  }
  
  isSubmittingContact.value = true
  
  try {
    // Call contact email API
    await $fetch('/api/email/send-contact', {
      method: 'POST',
      body: {
        name: contactForm.value.name,
        email: contactForm.value.email,
        phone: contactForm.value.phone,
        availability: selectedMethod.value === 'Anruf' ? contactForm.value.availability : undefined,
        message: contactForm.value.message,
        sendCopy: contactForm.value.sendCopy
      },
    })
    
    contactSuccess.value = true
    setTimeout(() => {
      closeContactModal()
    }, 2000)
  } catch (e: any) {
    contactError.value = e.data?.message || 'Ein Fehler ist aufgetreten'
  } finally {
    isSubmittingContact.value = false
  }
}

function printPage() {
  if (import.meta.client) {
    window.print()
  }
}
</script>

<template>
  <div class="result-page">
    <div v-if="error" class="error-container">
      <h2>❌ Fehler</h2>
      <p>Das Ergebnis konnte nicht geladen werden.</p>
      <NuxtLink to="/" class="back-link">Zurück zur Startseite</NuxtLink>
    </div>
    
    <div v-else-if="result" class="result-content">
      <!-- Header -->
      <header class="result-header">
        <div class="header-badge" :style="{ background: typeDescriptions[dominantType].color }">
          {{ typeDescriptions[dominantType].icon }}
        </div>
        <h1>Ihr Analyse-Profil</h1>
        <p class="subtitle">Persönlichkeitsanalyse für {{ result.email }}</p>
      </header>

      <!-- Main Result Card with watermark -->
      <div class="main-result" :style="{ borderColor: typeDescriptions[dominantType].color, background: typeDescriptions[dominantType].bgColor }">
        <div class="watermark-bg" :style="{ backgroundImage: `url(${typeDescriptions[dominantType].image})` }"></div>
        
        <div class="result-type">
          <span class="type-letter" :style="{ background: typeDescriptions[dominantType].color }">
            {{ dominantType }}
          </span>
          <div class="type-details">
            <h2>{{ typeDescriptions[dominantType].name }}</h2>
            <p>{{ typeDescriptions[dominantType].description }}</p>
          </div>
        </div>
        <div class="traits-list">
          <span 
            v-for="trait in typeDescriptions[dominantType].traits" 
            :key="trait" 
            class="trait-tag"
            :style="{ borderColor: typeDescriptions[dominantType].color, color: typeDescriptions[dominantType].color }"
          >
            {{ trait }}
          </span>
        </div>
      </div>

      <!-- DISG Quadrant Diagram with watermarks -->
      <div class="quadrant-section">
        <h3>Ihr Persönlichkeitsprofil</h3>
        <div class="quadrant-wrapper">
          <!-- Top label -->
          <div class="axis-label axis-top">Kopfmensch</div>
          
          <div class="quadrant-row">
            <!-- Left label -->
            <div class="axis-label axis-left">Introvertiert</div>
            
            <!-- Main quadrant grid -->
            <div class="quadrant-grid">
              <!-- Quadrant boxes with watermark backgrounds -->
              <div class="quadrant q-g">
                <div class="quadrant-watermark" style="background-image: url('/bluepeople.png')"></div>
                <span class="q-name">gewissenhaft</span>
              </div>
              <div class="quadrant q-d">
                <div class="quadrant-watermark" style="background-image: url('/reedpeople.png')"></div>
                <span class="q-name">dominant</span>
              </div>
              <div class="quadrant q-s">
                <div class="quadrant-watermark" style="background-image: url('/greenpeople.png')"></div>
                <span class="q-name">stetig</span>
              </div>
              <div class="quadrant q-i">
                <div class="quadrant-watermark" style="background-image: url('/yellowpeople.png')"></div>
                <span class="q-name">initiativ</span>
              </div>
              
              <!-- Position marker -->
              <div 
                class="position-marker"
                :style="{ 
                  left: `${quadrantPosition.x}%`, 
                  top: `${quadrantPosition.y}%`,
                  background: typeDescriptions[dominantType].color
                }"
              >
                <span class="marker-pulse"></span>
              </div>
            </div>
            
            <!-- Right label -->
            <div class="axis-label axis-right">Extrovertiert</div>
          </div>
          
          <!-- Bottom label -->
          <div class="axis-label axis-bottom">Bauchmensch</div>
        </div>
      </div>

      <!-- Score Bars -->
      <div class="scores-section">
        <h3>Ihre Stärkenprofil</h3>
        <div class="scores-grid">
          <div 
            v-for="(info, type) in typeDescriptions" 
            :key="type" 
            class="score-row"
            :class="{ dominant: type === dominantType }"
          >
            <div class="score-info">
              <span class="score-icon" :style="{ background: info.color }"></span>
              <span class="score-name">{{ info.name }}</span>
            </div>
            <div class="score-bar-wrap">
              <div class="score-bar-bg">
                <div 
                  class="score-bar-fill" 
                  :style="{ 
                    width: `${result.scores[type as keyof typeof result.scores]}%`,
                    background: `linear-gradient(90deg, ${info.color}, ${info.color}dd)`
                  }"
                ></div>
              </div>
              <span class="score-value">{{ result.scores[type as keyof typeof result.scores] }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Strengths & Challenges -->
      <div class="analysis-section">
        <div class="analysis-card strengths">
          <h4>💪 Ihre Stärken</h4>
          <ul>
            <li v-for="strength in typeDescriptions[dominantType].strengths" :key="strength">
              {{ strength }}
            </li>
          </ul>
        </div>
        <div class="analysis-card challenges">
          <h4>🎯 Entwicklungsbereiche</h4>
          <ul>
            <li v-for="challenge in typeDescriptions[dominantType].challenges" :key="challenge">
              {{ challenge }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Secondary Type with watermark -->
      <div v-if="secondaryType" class="secondary-section" :style="{ background: typeDescriptions[secondaryType].bgColor }">
        <div class="watermark-bg secondary-watermark" :style="{ backgroundImage: `url(${typeDescriptions[secondaryType].image})` }"></div>
        <h3>Ihre Sekundärfarbe: {{ typeDescriptions[secondaryType].name }}</h3>
        <p>{{ typeDescriptions[secondaryType].description }}</p>
      </div>

      <!-- Detailed Analysis CTA -->
      <div class="detailed-analysis-section">
        <h3>🎯 Möchten Sie mehr erfahren?</h3>
        <p class="analysis-description">
          Wenn Sie eine detaillierte Analyse interessiert, Sie Handlungsempfehlungen haben möchten, Ihnen Ihre Motivatoren wichtig sind und Sie Spaß an Informationen zu Ihrem IQ haben, dann schauen Sie sich doch mal beigefügte Musterauswertung an.
        </p>
        
        <div class="cta-buttons">
          <a href="#" class="cta-btn sample-btn" target="_blank">
            📄 Musterauswertung ansehen
          </a>
          <button @click="openContactModal" class="cta-btn contact-btn">
            ℹ️ Ich will weitere Informationen
          </button>
        </div>
      </div>

      <!-- Contact Form Modal -->
      <div v-if="showContactModal" class="modal-overlay" @click="closeContactModal">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="closeContactModal">✕</button>
          
          <div class="modal-header">
            <h3>📬 Kontaktformular</h3>
            <p>Füllen Sie das Formular aus und wir melden uns bei Ihnen!</p>
          </div>
          
          <form @submit.prevent="submitContactForm" class="contact-form">
            <div class="form-group">
              <label for="contact-name">Name *</label>
              <input 
                id="contact-name"
                v-model="contactForm.name" 
                type="text" 
                placeholder="Ihr vollständiger Name"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="contact-email">E-Mail *</label>
              <input 
                id="contact-email"
                v-model="contactForm.email" 
                type="email" 
                placeholder="ihre.email@beispiel.de"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="contact-phone">Telefon (optional)</label>
              <input 
                id="contact-phone"
                v-model="contactForm.phone" 
                type="tel" 
                placeholder="+49 123 456789"
              >
            </div>
            
             <div class="form-group"> 
                <label>Wie möchten sie kontaktiert werden? </label>
                <div class="radio-options">
                  <label class="radio-label">
                    <input 
                      type="radio" 
                      name="contactMethod" 
                      value="Email" 
                      v-model="selectedMethod"
                    >
                    Email
                  </label>
                  <label class="radio-label">
                    <input 
                      type="radio" 
                      name="contactMethod" 
                      value="Anruf" 
                      v-model="selectedMethod"
                    >
                    Anruf
                  </label>
                </div>
              </div>

            <div v-if="selectedMethod === 'Anruf'" class="form-group slide-down">
              <label for="contact-availability">Wann sind Sie am besten zu erreichen?</label>
              <input 
                id="contact-availability"
                v-model="contactForm.availability" 
                type="text" 
                placeholder="z.B. Wochentags 14-16 Uhr"
              >
            </div> 
            
            <div class="form-group">
              <label for="contact-message">Nachricht (optional)</label>
              <textarea 
                id="contact-message"
                v-model="contactForm.message" 
                rows="4"
                placeholder="Was interessiert Sie am meisten"
              ></textarea>
            </div>
            
            <p v-if="contactError" class="error-message">{{ contactError }}</p>
            <p v-if="contactSuccess" class="success-message">✓ Vielen Dank! Wir melden uns bald bei Ihnen.</p>
            
            <div class="form-group">
               <label class="privacy-label">
                  <input type="checkbox" v-model="contactForm.sendCopy">
                  <span>
                    Ich möchte eine Kopie meiner Anfrage als PDF per E-Mail erhalten.
                  </span>
               </label>
            </div>

            <div class="form-group">
               <label class="privacy-label">
                  <input type="checkbox" v-model="contactForm.privacyAccepted" required>
                  <span>
                    Ich habe die <NuxtLink to="/datenschutz" target="_blank" class="text-link">Datenschutzerklärung</NuxtLink> gelesen und akzeptiere sie.
                  </span>
               </label>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeContactModal" class="btn-cancel">Abbrechen</button>
              <button type="submit" :disabled="isSubmittingContact" class="btn-submit">
                {{ isSubmittingContact ? 'Wird gesendet...' : 'Absenden' }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
    
    <div v-else class="loading">
      <div class="spinner"></div>
      <p>Lade Ihr Ergebnis...</p>
    </div>
  </div>
</template>

<style scoped>
.result-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  padding: 2rem 1rem;
}

.result-content {
  max-width: 800px;
  margin: 0 auto;
}

/* Header */
.result-header {
  text-align: center;
  margin-bottom: 2rem;
}

.header-badge {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.result-header h1 {
  font-size: 2rem;
  color: #1a1a2e;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: #666;
  font-size: 1rem;
}

/* Main Result Card with watermark */
.main-result {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-left: 5px solid;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  position: relative;
  overflow: hidden;
}

.watermark-bg {
  position: absolute;
  top: 50%;
  right: -10%;
  width: 50%;
  height: 120%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.08;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 0;
}

.secondary-watermark {
  width: 40%;
  right: 5%;
  opacity: 0.1;
}

.result-type {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}

.type-letter {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  flex-shrink: 0;
}

.type-details {
  position: relative;
  z-index: 1;
}

.type-details h2 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
}

.type-details p {
  margin: 0;
  color: #555;
  line-height: 1.5;
}

.traits-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
}

.trait-tag {
  padding: 0.35rem 0.75rem;
  border: 2px solid;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  background: white;
}

/* Quadrant Diagram with watermarks */
.quadrant-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.quadrant-section h3 {
  text-align: center;
  margin-bottom: 1rem;
  color: #333;
}

.quadrant-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  max-width: 450px;
  margin: 0 auto;
}

.quadrant-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  width: 100%;
}

.axis-label {
  font-size: 0.75rem;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
}

.axis-top, .axis-bottom {
  padding: 0.5rem;
  width: 300px;
}

.axis-left, .axis-right {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  padding: 0.5rem;
  min-width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.axis-left {
  transform: rotate(180deg);
}

.quadrant-grid {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  width: 300px;
  height: 300px;
  border: 2px solid #333;
  flex-shrink: 0;
}

.quadrant {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  position: relative;
  overflow: hidden;
}

.quadrant-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 90%;
  height: 90%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.12;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 0;
}

.q-d { background: rgba(220, 53, 69, 0.15); }
.q-i { background: rgba(250, 204, 21, 0.15); }
.q-g { background: rgba(59, 130, 246, 0.15); }
.q-s { background: rgba(34, 197, 94, 0.15); }

.q-letter {
  font-size: 2.5rem;
  font-weight: bold;
  opacity: 0.4;
  position: relative;
  z-index: 1;
}

.q-d .q-letter { color: #dc3545; }
.q-i .q-letter { color: #facc15; }
.q-g .q-letter { color: #3b82f6; }
.q-s .q-letter { color: #22c55e; }

.q-name {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #666;
  position: relative;
  z-index: 1;
}

.cross-h, .cross-v, .diag-1, .diag-2 {
  position: absolute;
  background: #333;
  pointer-events: none;
}

.cross-h {
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  transform: translateY(-50%);
  z-index: 2;
}

.cross-v {
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
  z-index: 2;
}

.diag-1, .diag-2 {
  width: 1px;
  height: 141.4%;
  left: 50%;
  top: 50%;
  background: #ccc;
  z-index: 1;
}

.diag-1 { transform: translate(-50%, -50%) rotate(45deg); }
.diag-2 { transform: translate(-50%, -50%) rotate(-45deg); }


.position-marker {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  border: 3px solid white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.marker-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: inherit;
  animation: pulse-ring 2s infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

/* Scores Section */
.scores-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.scores-section h3 {
  margin-bottom: 1rem;
  color: #333;
}

.scores-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.score-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.score-row.dominant {
  background: #f8f9fa;
}

.score-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 140px;
}

.score-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

.score-name {
  font-weight: 500;
}

.score-bar-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.score-bar-bg {
  flex: 1;
  height: 12px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
}

.score-bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 1s ease;
}

.score-value {
  font-weight: bold;
  min-width: 30px;
  text-align: right;
}

.checksum {
  text-align: center;
  color: #888;
  font-size: 0.85rem;
  margin-top: 1rem;
}

/* Analysis Section */
.analysis-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.analysis-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.analysis-card h4 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
}

.analysis-card ul {
  margin: 0;
  padding-left: 1.25rem;
}

.analysis-card li {
  margin-bottom: 0.25rem;
  color: #555;
}

.strengths { border-top: 3px solid #22c55e; }
.challenges { border-top: 3px solid #f59e0b; }

/* Secondary Section with watermark */
.secondary-section {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  position: relative;
  overflow: hidden;
}

.secondary-section h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  position: relative;
  z-index: 1;
}

.secondary-section p {
  margin: 0;
  color: #666;
  position: relative;
  z-index: 1;
}

/* Detailed Analysis CTA Section */
.detailed-analysis-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 2px solid #dee2e6;
}

.detailed-analysis-section h3 {
  color: #1a1a2e;
  margin: 0 0 1rem;
  font-size: 1.4rem;
  text-align: center;
}

.analysis-description {
  color: #495057;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.cta-btn {
  flex: 1;
  min-width: 250px;
  max-width: 350px;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: inline-block;
}

.sample-btn {
  background: linear-gradient(135deg, #4a90d9 0%, #357abd 100%);
  color: white;
  border: 2px solid #357abd;
}

.sample-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(74, 144, 217, 0.3);
  background: linear-gradient(135deg, #357abd 0%, #2868a8 100%);
}

.contact-btn {
  background: linear-gradient(135deg, #28a745 0%, #20963d 100%);
  color: white;
  border: 2px solid #20963d;
}

.contact-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(40, 167, 69, 0.3);
  background: linear-gradient(135deg, #20963d 0%, #1e7e34 100%);
}

.cta-note {
  text-align: center;
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0;
  padding-top: 0.5rem;
  border-top: 1px solid #dee2e6;
}

.cta-note strong {
  color: #495057;
}

/* Contact Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #f0f0f0;
  color: #333;
}

.modal-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  color: #1a1a2e;
}

.modal-header p {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4a90d9;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.error-message {
  color: #dc3545;
  font-size: 0.9rem;
  margin: 0;
  padding: 0.5rem;
  background: #fef2f2;
  border-radius: 6px;
  text-align: center;
}

.success-message {
  color: #28a745;
  font-size: 0.9rem;
  margin: 0;
  padding: 0.5rem;
  background: #f0fdf4;
  border-radius: 6px;
  text-align: center;
  font-weight: 600;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: #f0f0f0;
  color: #333;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-submit {
  background: linear-gradient(135deg, #28a745 0%, #20963d 100%);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 500px) {
  .modal-content {
    padding: 1.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
}

/* Actions */
.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-weight: 500;
}

.action-btn.primary {
  background: #4a90d9;
  color: white;
}

.action-btn.primary:hover {
  background: #357abd;
}

.action-btn.secondary {
  background: #f0f0f0;
  color: #333;
}

.action-btn.secondary:hover {
  background: #e0e0e0;
}

/* Template Preview Section */
.template-preview-section {
  margin-top: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  border: 2px dashed #dee2e6;
}

.template-preview-section h3 {
  color: #495057;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.preview-desc {
  color: #6c757d;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.preview-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.preview-btn {
  flex: 1;
  min-width: 250px;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: white;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border: 2px solid transparent;
}

.preview-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}

.preview-btn.pdf {
  border-color: #dc3545;
}

.preview-btn.pdf:hover {
  border-color: #c82333;
  background: #fff5f5;
}

.preview-btn.contact-preview {
  border-color: #22c55e;
}

.preview-btn.contact-preview:hover {
  border-color: #1e7e34;
  background: #f0fdf4;
}

.preview-btn .btn-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.preview-btn .btn-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: left;
}

.preview-btn strong {
  color: #212529;
  font-size: 1rem;
}

.preview-btn small {
  color: #6c757d;
  font-size: 0.85rem;
}

/* Loading & Error */
.loading {
  text-align: center;
  padding: 4rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e0e0e0;
  border-top-color: #4a90d9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 16px;
  max-width: 400px;
  margin: 2rem auto;
}

.back-link {
  color: #4a90d9;
}

@media (max-width: 600px) {
  .analysis-section {
    grid-template-columns: 1fr;
  }
  
  .score-info {
    min-width: 100px;
  }
  
  .actions {
    flex-direction: column;
  }
  .watermark-bg {
    width: 60%;
    right: -15%;
  }
}

/* Radio Button Styles */
.radio-options {
  display: flex;
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  color: #333;
}

.radio-label input[type="radio"] {
  width: 1.2em;
  height: 1.2em;
  accent-color: #28a745;
  margin: 0;
  cursor: pointer;
}


.privacy-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: #555;
  cursor: pointer;
  line-height: 1.4;
}

.privacy-label input[type="checkbox"] {
  margin-top: 0.2rem;
  accent-color: #28a745;
  width: 1.1em;
  height: 1.1em;
}

.text-link {
  color: #4a90d9;
  text-decoration: underline;
  font-weight: 500;
}

.text-link:hover {
  text-decoration: none;
  color: #357abd;
}

@media print {
  .result-page {
    background: white;
  }
  
  .actions {
    display: none;
  }
  
  .watermark-bg {
    opacity: 0.05;
  }
}
/* Fix autofill styles */
input:-webkit-autofill,
input:-webkit-autofill:hover, 
input:-webkit-autofill:focus, 
textarea:-webkit-autofill,
textarea:-webkit-autofill:hover,
textarea:-webkit-autofill:focus {
  -webkit-text-fill-color: #333;
  -webkit-box-shadow: 0 0 0px 1000px white inset;
  transition: background-color 5000s ease-in-out 0s;
}

/* Custom checkbox styling */
input[type="checkbox"] {
  accent-color: #22c55e; /* Green accent */
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* Ensure label text is readable */
.privacy-label span {
  color: #333;
}
</style>