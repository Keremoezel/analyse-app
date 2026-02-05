<script setup lang="ts">
// Simple landing page - just start the test
</script>

<template>
  <div class="container">
    <div class="hero">
      <h1>Power4-people Kurzanalyse</h1>
      <p class="subtitle">
        Entdecken Sie Ihren Persönlichkeitstyp in nur 3 Minuten
      </p>
      
      <div class="start-card">
        <h2>Bereit zu starten?</h2>
        <p>Beantworten Sie 10 kurze Fragen und erfahren Sie, welcher Persönlichkeitstyp Sie sind.</p>
        
        <NuxtLink to="/test" class="start-btn">
          Test starten →
        </NuxtLink>
        
        <p class="note">Kostenlos • 3 Minuten • Sofortige Ergebnisse</p>
      </div>
      
      <div class="info-section">
        <h3>Welche Persönlichkeitstypen gibt es?</h3>
        <p class="info-text">
          Es gibt unzählige Variationen. In der Kurzanalyse beschränken wir uns auf die 4 Hauptfarben, die Ihnen helfen
        </p>
        <div class="types-grid">
          <div class="type-card type-g">
            <span class="type-letter">Blau</span>
            <span class="type-name">Gewissenhaft</span>
            <span class="type-desc">Analytisch & Genau</span>
          </div>
          <div class="type-card type-d">
            <span class="type-letter">Rot</span>
            <span class="type-name">Dominant</span>
            <span class="type-desc">Ergebnisorientiert & Direkt</span>
          </div>
          <div class="type-card type-s">
            <span class="type-letter">Grün</span>
            <span class="type-name">Stetig</span>
            <span class="type-desc">Geduldig & Zuverlässig</span>
          </div>
          <div class="type-card type-i">
            <span class="type-letter">Gelb</span>
            <span class="type-name">Initiativ</span>
            <span class="type-desc">Enthusiastisch & Optimistisch</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.hero {
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.start-card {
  background: linear-gradient(135deg, #4a90d9 0%, #357abd 100%);
  border-radius: 16px;
  padding: 2.5rem;
  margin-bottom: 3rem;
  color: white;
  box-shadow: 0 10px 30px rgba(74, 144, 217, 0.3);
}

.start-card h2 {
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.start-card p {
  opacity: 0.9;
  margin-bottom: 1.5rem;
}

.start-btn {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: white;
  color: #4a90d9;
  text-decoration: none;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.note {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-top: 1rem;
  margin-bottom: 0;
}

.info-section {
  margin-top: 2rem;
}

.info-section h3 {
  margin-bottom: 0.5rem;
  color: #1a1a2e;
}

.info-text {
  color: #666;
  margin-bottom: 1.5rem;
}

.types-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.type-card {
  padding: 1.25rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  transition: transform 0.2s;
}

.type-card:hover {
  transform: translateY(-3px);
}

.type-letter {
  font-size: 2rem;
  font-weight: bold;
  color: white;
}

.type-name {
  font-size: 1rem;
  font-weight: 600;
  color: white;
}

.type-desc {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.85);
  text-align: center;
}

.type-d { background: linear-gradient(135deg, #dc3545, #c82333); }
.type-i { background: linear-gradient(135deg, #facc15, #eab308); }
.type-s { background: linear-gradient(135deg, #22c55e, #16a34a); }
.type-g { background: linear-gradient(135deg, #3b82f6, #2563eb); }


@media (max-width: 500px) {
  h1 {
    font-size: 1.8rem;
  }
  
  .types-grid {
    grid-template-columns: 1fr;
  }
}
</style>
