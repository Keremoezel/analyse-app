<script setup lang="ts">
interface Adjective {
  word: string
  type: 'D' | 'I' | 'S' | 'G'
}

interface QuestionRow {
  id: number
  adjectives: Adjective[]
}

// Get questions from API
const { data: questions } = await useFetch<QuestionRow[]>('/api/test/questions')

// State
const answers = ref<Record<string, number>>({})
const currentRowIndex = ref(0)
const timeLeft = ref(180) // 3 minutes in seconds
const isSubmitting = ref(false)
const error = ref('')
const showEmailForm = ref(false) // Show email form after completing test
const showVerificationForm = ref(false) // Show verification code form
const email = ref('')
const verificationCode = ref('')
const showInstructions = ref(true) // Show instructions first
const testStarted = ref(false) // Track if test has started

// Current question row
const currentRow = computed(() => questions.value?.[currentRowIndex.value])
const totalRows = computed(() => questions.value?.length || 10)
const progress = computed(() => ((currentRowIndex.value + 1) / totalRows.value) * 100)

// Timer
let timer: ReturnType<typeof setInterval> | null = null

// Start the test (called after reading instructions)
function startTest() {
  showInstructions.value = false
  testStarted.value = true
  
  // Start timer only when test begins
  timer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0 && timer) {
      clearInterval(timer)
      // Auto-show email form if time runs out
      if (allComplete.value) {
        showEmailForm.value = true
      }
    }
  }, 1000)
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// Format time display
const timeDisplay = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// Check if current row is complete (all 4 unique scores assigned)
const isCurrentRowComplete = computed(() => {
  if (!currentRow.value) return false
  const rowScores = currentRow.value.adjectives.map(adj => answers.value[adj.word]).filter(Boolean)
  if (rowScores.length !== 4) return false
  const unique = new Set(rowScores)
  return unique.size === 4 && [1, 2, 3, 4].every(s => unique.has(s))
})

// Check if all rows are complete
const allComplete = computed(() => {
  if (!questions.value) return false
  return questions.value.every(row => {
    const rowScores = row.adjectives.map(adj => answers.value[adj.word]).filter(Boolean)
    if (rowScores.length !== 4) return false
    const unique = new Set(rowScores)
    return unique.size === 4 && [1, 2, 3, 4].every(s => unique.has(s))
  })
})

// Get available scores for a word in current row
function getAvailableScores(currentWord: string): number[] {
  if (!currentRow.value) return [1, 2, 3, 4]
  const usedScores = currentRow.value.adjectives
    .filter(adj => adj.word !== currentWord)
    .map(adj => answers.value[adj.word])
    .filter(Boolean)
  return [1, 2, 3, 4].filter(s => !usedScores.includes(s))
}

// Navigation
function nextRow() {
  if (isCurrentRowComplete.value && currentRowIndex.value < totalRows.value - 1) {
    currentRowIndex.value++
    error.value = ''
  }
}

function prevRow() {
  if (currentRowIndex.value > 0) {
    currentRowIndex.value--
    error.value = ''
  }
}

// Complete test - show email form
function completeTest() {
  if (!allComplete.value) {
    error.value = 'Bitte füllen Sie alle Zeilen vollständig aus'
    return
  }
  showEmailForm.value = true
}

// Submit email and request code
async function submitTest() {
  if (isSubmitting.value) return
  
  // Validate email
  if (!email.value || !email.value.includes('@')) {
    error.value = 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
    return
  }
  
  isSubmitting.value = true
  error.value = ''
  
  try {
    await $fetch('/api/auth/send-code', {
      method: 'POST',
      body: { email: email.value },
    })
    
    showEmailForm.value = false
    showVerificationForm.value = true
  } catch (e: any) {
    error.value = e.data?.message || 'Code konnte nicht gesendet werden'
  } finally {
    isSubmitting.value = false
  }
}

// Final verification and submission
async function verifyAndSubmit() {
  if (isSubmitting.value) return
  
  if (!verificationCode.value || verificationCode.value.length !== 6) {
    error.value = 'Bitte geben Sie den 6-stelligen Code ein'
    return
  }

  if (!allComplete.value) {
    error.value = 'Bitte füllen Sie alle Zeilen vollständig aus'
    return
  }
  
  isSubmitting.value = true
  error.value = ''
  
  try {
    const answerArray = Object.entries(answers.value).map(([word, score]) => ({
      word,
      score,
    }))
    
    const result = await $fetch('/api/test/submit', {
      method: 'POST',
      body: {
        email: email.value,
        answers: answerArray,
        code: verificationCode.value
      },
    })
    
    // Navigate to result page
    await navigateTo(`/result/${result.resultId}`)
  } catch (e: any) {
    error.value = e.data?.message || 'Verifizierung fehlgeschlagen'
    isSubmitting.value = false
  }
}

async function resendCode() {
  error.value = ''
  try {
    await $fetch('/api/auth/send-code', {
      method: 'POST',
      body: { email: email.value },
    })
    // Optional: show a small toast or success message
  } catch (e: any) {
    error.value = 'Fehler beim Erneuten Senden'
  }
}

// Go back to test from email form
function backToTest() {
  showEmailForm.value = false
  showVerificationForm.value = false
  error.value = ''
}
</script>

<template>
  <div class="test-container">
    <!-- Instructions Screen -->
    <div v-if="showInstructions" class="instructions-screen">
      <div class="instructions-card">
        <div class="instructions-header">
          <span class="instructions-icon">📋</span>
          <h1>Anleitung zum Test</h1>
        </div>
        
        <div class="instructions-content">
          <h2>So funktioniert die Kurzanalyse</h2>
          
          <div class="instruction-item">
            <span class="step-number">1</span>
            <div class="step-content">
              <strong>10 Fragen mit je 4 Begriffen</strong>
              <p>Sie sehen pro Frage vier Adjektive, die Persönlichkeitseigenschaften beschreiben.</p>
            </div>
          </div>
          
          <div class="instruction-item">
            <span class="step-number">2</span>
            <div class="step-content">
              <strong>Punkte von 1 bis 4 vergeben</strong>
              <p>Bewerten Sie, wie gut jeder Begriff zu Ihnen passt:</p>
              <ul class="score-explanation">
                <li><span class="score-badge">4</span> Punkte = Passt am besten zu mir</li>
                <li><span class="score-badge">3</span> Punkte = Passt gut zu mir</li>
                <li><span class="score-badge">2</span> Punkte = Passt weniger zu mir</li>
                <li><span class="score-badge">1</span> Punkte = Passt am wenigsten zu mir</li>
              </ul>
            </div>
          </div>
          
          <div class="instruction-item">
            <span class="step-number">3</span>
            <div class="step-content">
              <strong>Jede Punktzahl kann nur einmal bei einer Frage vergeben werden</strong>
              <p>Verteilen Sie alle vier Punkte (1, 2, 3, 4) auf die vier Begriffe – keine Doppelvergabe!</p>
            </div>
          </div>
          
          <div class="instruction-item">
            <span class="step-number">4</span>
            <div class="step-content">
              <strong>Spontan antworten</strong>
              <p>Es gibt keine richtigen oder falschen Antworten. Vertrauen Sie Ihrem Bauchgefühl!</p>
            </div>
          </div>
          
          <div class="email-warning">
            <span class="email-icon">📧</span>
            <div>
              <strong>E-Mail-Adresse erforderlich</strong>
              <p>Nach Abschluss der Analyse bekommen Sie Sie Ihre Auswertung in wenigen Minuten per E-Mail.</p>
            </div>
          </div>

          <div class="time-notice">
            <span class="time-icon">⏱️</span>
            <div>
              <strong>Sie haben 3 Minuten Zeit</strong>
              <p>Die Zeit startet, sobald Sie auf "Test starten" klicken.</p>
            </div>
          </div>
        </div>
        
        <button @click="startTest" class="start-test-btn">
          Verstanden, Test starten →
        </button>
      </div>
    </div>

    <!-- Email Form (shown after completing test) -->
    <div v-else-if="showEmailForm" class="email-overlay">
      <div class="email-card">
        <div class="email-header">
          <span class="check-icon">✅</span>
          <h2>Test abgeschlossen!</h2>
          <p>Geben Sie Ihre E-Mail-Adresse ein, um Ihr persönliche Analyse zu erhalten.</p>
        </div>
        
        <form @submit.prevent="submitTest" class="email-form">
          <input 
            v-model="email" 
            type="email" 
            placeholder="ihre.email@beispiel.de"
            required
            autofocus
          >
          <p v-if="error" class="error">{{ error }}</p>
          
          <div class="email-actions">
            <button type="button" @click="backToTest" class="back-btn">
              ← Zurück
            </button>
            <button type="submit" :disabled="isSubmitting" class="submit-btn">
              {{ isSubmitting ? 'Wird gesendet...' : 'Ergebnis anzeigen →' }}
            </button>
          </div>
        </form>
        
        <p class="privacy-note">
          🔒 Ihre Daten werden vertraulich behandelt.
        </p>
      </div>
    </div>

    <!-- Verification Form (shown after email submission) -->
    <div v-else-if="showVerificationForm" class="email-overlay">
      <div class="email-card">
        <div class="email-header">
          <span class="code-icon">🔑</span>
          <h2>E-Mail bestätigen</h2>
          <p>Wir haben einen 6-stelligen Code an <strong>{{ email }}</strong> gesendet.</p>
        </div>
        
        <form @submit.prevent="verifyAndSubmit" class="email-form">
          <input 
            v-model="verificationCode" 
            type="text" 
            placeholder="123456"
            maxlength="6"
            pattern="[0-9]*"
            inputmode="numeric"
            required
            autofocus
            class="code-input"
          >
          <p v-if="error" class="error">{{ error }}</p>
          
          <div class="email-actions">
            <button type="button" @click="backToTest" class="back-btn">
              ← Abbrechen
            </button>
            <button type="submit" :disabled="isSubmitting" class="submit-btn v-btn">
              {{ isSubmitting ? 'Wird geprüft...' : 'Code bestätigen ✓' }}
            </button>
          </div>
        </form>
        
        <div class="resend-section">
          <p>Keinen Code erhalten?</p>
          <button @click="resendCode" class="resend-btn" :disabled="isSubmitting">
            Code erneut senden
          </button>
        </div>
      </div>
    </div>

    <!-- Test Content -->
    <div v-else>
      <header class="test-header">
        <h1>DISG Persönlichkeitstest</h1>
        <div class="timer" :class="{ warning: timeLeft < 60 }">
          ⏱️ {{ timeDisplay }}
        </div>
      </header>
      
      <!-- Progress bar -->
      <div class="progress-section">
        <div class="progress-info">
          <span>Frage {{ currentRowIndex + 1 }} von {{ totalRows }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
      </div>
      
      <p class="quick-reminder">
        Vergeben Sie die Punkte 1-4 (4 = passt am besten, 1 = passt am wenigsten).
      </p>
      
      <!-- Current question -->
      <div v-if="currentRow" class="question-card">
        <div class="question-number">Frage {{ currentRow.id }}</div>
        
        <div class="adjectives-grid">
          <div v-for="adj in currentRow.adjectives" :key="adj.word" class="adjective-card">
            <span class="word">{{ adj.word }}</span>
            <div class="score-buttons">
              <button 
                v-for="score in [4, 3, 2, 1]" 
                :key="score"
                @click="answers[adj.word] = score"
                :class="{ 
                  active: answers[adj.word] === score,
                  disabled: !getAvailableScores(adj.word).includes(score) && answers[adj.word] !== score
                }"
                :disabled="!getAvailableScores(adj.word).includes(score) && answers[adj.word] !== score"
              >
                {{ score }}
              </button>
            </div>
            <div class="score-labels">
              <span class="label-best">← Passt am besten</span>
              <span class="label-worst">Passt am wenigsten →</span>
            </div>
          </div>
        </div>
        
        <div class="row-status" :class="{ complete: isCurrentRowComplete }">
          <span v-if="isCurrentRowComplete">✓ Zeile vollständig</span>
          <span v-else>Bitte alle 4 Begriffe bewerten</span>
        </div>
      </div>
      
      <!-- Navigation -->
      <div class="navigation">
        <button 
          @click="prevRow" 
          :disabled="currentRowIndex === 0"
          class="nav-btn prev-btn"
        >
          ← Zurück
        </button>
        
        <div class="dots">
          <span 
            v-for="i in totalRows" 
            :key="i" 
            class="dot"
            :class="{ 
              active: i - 1 === currentRowIndex,
              completed: questions && i <= currentRowIndex
            }"
            @click="currentRowIndex = i - 1"
          ></span>
        </div>
        
        <button 
          v-if="currentRowIndex < totalRows - 1"
          @click="nextRow" 
          :disabled="!isCurrentRowComplete"
          class="nav-btn next-btn"
        >
          Weiter →
        </button>
        
        <button 
          v-else
          @click="completeTest" 
          :disabled="!allComplete"
          class="nav-btn submit-btn"
        >
          Test abschließen ✓
        </button>
      </div>
      
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.test-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 1rem;
  min-height: 100vh;
}

/* Instructions Screen */
.instructions-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.instructions-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 550px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0,0,0,0.12);
}

.instructions-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.instructions-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.5rem;
}

.instructions-header h1 {
  font-size: 1.6rem;
  color: #1a1a2e;
}

.instructions-content h2 {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 1.25rem;
}

.instruction-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
  align-items: flex-start;
}

.step-number {
  width: 32px;
  height: 32px;
  background: #4a90d9;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content strong {
  display: block;
  color: #1a1a2e;
  margin-bottom: 0.25rem;
}

.step-content p {
  color: #666;
  margin: 0;
  font-size: 0.95rem;
}

.score-explanation {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
}

.score-explanation li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  color: #666;
}

.score-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #e8f4fd;
  color: #4a90d9;
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.85rem;
}

.email-warning {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #d1ecf1, #bee5eb);
  border-radius: 10px;
  margin-top: 1.5rem;
  align-items: center;
  border: 1px solid #b6d4db;
}

.email-icon {
  font-size: 2rem;
}

.email-warning strong {
  display: block;
  color: #0c5460;
}

.email-warning p {
  margin: 0;
  color: #0c5460;
  font-size: 0.9rem;
}

.time-notice {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fff3cd, #ffeeba);
  border-radius: 10px;
  margin-top: 1rem;
  align-items: center;
}

.time-icon {
  font-size: 2rem;
}

.time-notice strong {
  display: block;
  color: #856404;
}

.time-notice p {
  margin: 0;
  color: #856404;
  font-size: 0.9rem;
}

.start-test-btn {
  width: 100%;
  padding: 1rem;
  margin-top: 1.5rem;
  background: linear-gradient(135deg, #4a90d9, #357abd);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.start-test-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 144, 217, 0.35);
}

/* Email Overlay */
.email-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
}

.email-card {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 450px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  text-align: center;
}

.email-header {
  margin-bottom: 2rem;
}

.check-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.email-header h2 {
  font-size: 1.5rem;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
}

.email-header p {
  color: #666;
}

.email-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.email-form input {
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  text-align: center;
  transition: border-color 0.2s;
}

.email-form input:focus {
  outline: none;
  border-color: #4a90d9;
}

.email-actions {
  display: flex;
  gap: 0.75rem;
}

.back-btn {
  flex: 1;
  padding: 0.75rem;
  background: #f0f0f0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #e0e0e0;
}

.email-actions .submit-btn {
  flex: 2;
  padding: 0.75rem;
  background: linear-gradient(135deg, #28a745, #20963d);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.email-actions .submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.email-actions .submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.privacy-note {
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: #888;
}

/* Test Header */
.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.test-header h1 {
  font-size: 1.3rem;
}

.timer {
  font-size: 1.3rem;
  font-weight: bold;
  padding: 0.5rem 1rem;
  background: #e8f4fd;
  border-radius: 8px;
  color: #007bff;
}

.timer.warning {
  background: #fff3cd;
  color: #dc3545;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.progress-section {
  margin-bottom: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a90d9, #28a745);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.quick-reminder {
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.85rem;
  text-align: center;
}

.question-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.question-number {
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: #4a90d9;
  margin-bottom: 1.5rem;
}

.adjectives-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.adjective-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.word {
  display: block;
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
  color: #1a1a2e;
}

.score-buttons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.score-buttons button {
  width: 50px;
  height: 50px;
  border: 2px solid #ddd;
  border-radius: 50%;
  background: white;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.score-buttons button:hover:not(:disabled) {
  border-color: #4a90d9;
  background: #e8f4fd;
}

.score-buttons button.active {
  background: #4a90d9;
  border-color: #4a90d9;
  color: white;
}

.score-buttons button.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.score-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: #999;
}

.row-status {
  text-align: center;
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 1rem;
  background: #fff3cd;
  color: #856404;
  font-size: 0.9rem;
}

.row-status.complete {
  background: #d4edda;
  color: #155724;
}

.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.nav-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.prev-btn {
  background: #f0f0f0;
  color: #333;
}

.prev-btn:hover:not(:disabled) {
  background: #e0e0e0;
}

.next-btn {
  background: #4a90d9;
  color: white;
}

.next-btn:hover:not(:disabled) {
  background: #357abd;
}

.navigation .submit-btn {
  background: #28a745;
  color: white;
}

.navigation .submit-btn:hover:not(:disabled) {
  background: #218838;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dots {
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e0e0e0;
  cursor: pointer;
  transition: all 0.2s;
}

.dot.active {
  background: #4a90d9;
  transform: scale(1.2);
}

.dot.completed {
  background: #28a745;
}

.error {
  color: #dc3545;
  text-align: center;
  margin-top: 1rem;
}

@media (max-width: 500px) {
  .score-buttons button {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .dots {
    display: none;
  }
  
  .email-card,
  .instructions-card {
    padding: 1.5rem;
  }
  
  .instruction-item {
    flex-direction: column;
    gap: 0.5rem;
  }
}
.code-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.code-input {
  letter-spacing: 4px;
  font-weight: bold;
  font-size: 1.5rem !important;
}

.resend-section {
  margin-top: 2rem;
  font-size: 0.9rem;
  color: #666;
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
}

.resend-btn {
  background: none;
  border: none;
  color: #4a90d9;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem;
  transition: opacity 0.2s;
}

.resend-btn:hover {
  text-decoration: underline;
}

.resend-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
