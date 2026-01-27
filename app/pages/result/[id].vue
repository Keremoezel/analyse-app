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

const { data: result, error } = await useFetch<ResultData>(`/api/results/${resultId}`)

// DISG type descriptions
const typeDescriptions = {
  D: {
    name: 'Dominant',
    color: '#dc3545',
    bgColor: '#fef2f2',
    icon: '🔥',
    traits: ['Ergebnisorientiert', 'Entscheidungsfreudig', 'Wettbewerbsorientiert', 'Direkt', 'Zielstrebig'],
    description: 'Sie sind eine durchsetzungsstarke Persönlichkeit, die Herausforderungen liebt und schnelle Entscheidungen trifft.',
    strengths: ['Führungsstärke', 'Entschlossenheit', 'Problemlösung'],
    challenges: ['Ungeduld', 'Risikobereitschaft', 'Dominanz'],
  },
  I: {
    name: 'Initiativ',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    icon: '⭐',
    traits: ['Enthusiastisch', 'Optimistisch', 'Kontaktfreudig', 'Überzeugend', 'Kreativ'],
    description: 'Sie sind eine inspirierende Persönlichkeit, die Menschen begeistert und gerne im Mittelpunkt steht.',
    strengths: ['Kommunikation', 'Motivation', 'Networking'],
    challenges: ['Detailarbeit', 'Zeitmanagement', 'Fokus'],
  },
  S: {
    name: 'Stetig',
    color: '#22c55e',
    bgColor: '#f0fdf4',
    icon: '🌿',
    traits: ['Geduldig', 'Zuverlässig', 'Teamfähig', 'Unterstützend', 'Loyal'],
    description: 'Sie sind eine harmonische Persönlichkeit, die Stabilität schätzt und anderen hilft.',
    strengths: ['Teamarbeit', 'Zuhören', 'Beständigkeit'],
    challenges: ['Veränderungen', 'Konfrontation', 'Tempo'],
  },
  G: {
    name: 'Gewissenhaft',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    icon: '🎯',
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
  
  // X axis: aufgabenorientiert (D+G) vs menschenorientiert (I+S)
  // Left = aufgabenorientiert, Right = menschenorientiert
  const taskOriented = D + G
  const peopleOriented = I + S
  const x = (peopleOriented / (taskOriented + peopleOriented)) * 100
  
  // Y axis: extrovertiert (D+I) vs introvertiert (S+G)
  // Top = extrovertiert, Bottom = introvertiert
  const extrovert = D + I
  const introvert = S + G
  const y = 100 - (extrovert / (extrovert + introvert)) * 100
  
  return { x, y }
})

// Get secondary type
const secondaryType = computed(() => {
  if (!result.value) return null
  const scores = result.value.scores
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  return sorted[1]?.[0] as keyof typeof typeDescriptions ?? null
})

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
        <h1>Ihr DISG-Profil</h1>
        <p class="subtitle">Persönlichkeitsanalyse für {{ result.email }}</p>
      </header>

      <!-- Main Result Card -->
      <div class="main-result" :style="{ borderColor: typeDescriptions[dominantType].color, background: typeDescriptions[dominantType].bgColor }">
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

      <!-- DISG Quadrant Diagram -->
      <div class="quadrant-section">
        <h3>Ihr Persönlichkeitsprofil</h3>
        <div class="quadrant-wrapper">
          <!-- Top label -->
          <div class="axis-label axis-top">extrovertiert</div>
          
          <div class="quadrant-row">
            <!-- Left label -->
            <div class="axis-label axis-left">aufgabenorientiert</div>
            
            <!-- Main quadrant grid -->
            <div class="quadrant-grid">
              <!-- Quadrant boxes - D top-left, I top-right, G bottom-left, S bottom-right -->
              <div class="quadrant q-d">
                <span class="q-letter">D</span>
                <span class="q-name">dominant</span>
              </div>
              <div class="quadrant q-i">
                <span class="q-letter">I</span>
                <span class="q-name">initiativ</span>
              </div>
              <div class="quadrant q-g">
                <span class="q-letter">G</span>
                <span class="q-name">gewissenhaft</span>
              </div>
              <div class="quadrant q-s">
                <span class="q-letter">S</span>
                <span class="q-name">stetig</span>
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
              
              <!-- Cross lines -->
              <div class="cross-h"></div>
              <div class="cross-v"></div>
              <div class="diag-1"></div>
              <div class="diag-2"></div>
            </div>
            
            <!-- Right label -->
            <div class="axis-label axis-right">menschenorientiert</div>
          </div>
          
          <!-- Bottom label -->
          <div class="axis-label axis-bottom">introvertiert</div>
        </div>
      </div>

      <!-- Score Bars -->
      <div class="scores-section">
        <h3>Ihre Punktverteilung</h3>
        <div class="scores-grid">
          <div 
            v-for="(info, type) in typeDescriptions" 
            :key="type" 
            class="score-row"
            :class="{ dominant: type === dominantType }"
          >
            <div class="score-info">
              <span class="score-icon" :style="{ background: info.color }">{{ type }}</span>
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
        <p class="checksum">Gesamtpunktzahl: {{ result.scores.D + result.scores.I + result.scores.S + result.scores.G }}</p>
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

      <!-- Secondary Type -->
      <div v-if="secondaryType" class="secondary-section">
        <h3>Ihr Sekundärtyp: {{ typeDescriptions[secondaryType].name }}</h3>
        <p>{{ typeDescriptions[secondaryType].description }}</p>
      </div>

      <!-- Actions -->
      <div class="actions">
        <NuxtLink to="/" class="action-btn primary">Neuen Test starten</NuxtLink>
        <button @click="printPage" class="action-btn secondary">📄 Drucken</button>
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

/* Main Result Card */
.main-result {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-left: 5px solid;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.result-type {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1rem;
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
}

.trait-tag {
  padding: 0.35rem 0.75rem;
  border: 2px solid;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  background: white;
}

/* Quadrant Diagram */
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
  gap: 0.5rem;
  max-width: 450px;
  margin: 0 auto;
}

.quadrant-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
}

.axis-left, .axis-right {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  padding: 0.5rem;
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
}

.q-d { background: rgba(220, 53, 69, 0.15); }
.q-i { background: rgba(245, 158, 11, 0.15); }
.q-g { background: rgba(59, 130, 246, 0.15); }
.q-s { background: rgba(34, 197, 94, 0.15); }

.q-letter {
  font-size: 2.5rem;
  font-weight: bold;
  opacity: 0.4;
}

.q-d .q-letter { color: #dc3545; }
.q-i .q-letter { color: #f59e0b; }
.q-g .q-letter { color: #3b82f6; }
.q-s .q-letter { color: #22c55e; }

.q-name {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #666;
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
}

.cross-v {
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
}

.diag-1, .diag-2 {
  width: 1px;
  height: 141.4%;
  left: 50%;
  top: 50%;
  background: #ccc;
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

/* Secondary Section */
.secondary-section {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.secondary-section h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
}

.secondary-section p {
  margin: 0;
  color: #666;
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
}

@media print {
  .result-page {
    background: white;
  }
  
  .actions {
    display: none;
  }
}
</style>
