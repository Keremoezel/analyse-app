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
      
      <div class="info-section">
        <h3>Welche Persönlichkeitstypen gibt es?</h3>
        <p class="info-text">
          Es gibt unzählige Variationen. In der Kurzanalyse beschränken wir uns auf die 4 Hauptfarben, die Ihnen helfen
        </p>
        <div class="types-grid">
          <div class="type-card type-g">
            <div class="card-inner">
              <div class="image-bg">
                <img src="/peoplebluehomepag.png" alt="Blau" class="type-image">
              </div>
              <div class="type-content">
                <h4 class="type-title">Blau</h4>
                <p class="type-trait">Analytisch & Präzise</p>
              </div>
            </div>
            <div class="card-shine"></div>
          </div>
          
          <div class="type-card type-d">
            <div class="card-inner">
              <div class="image-bg">
                <img src="/peopleredhomepag.png" alt="Rot" class="type-image">
              </div>
              <div class="type-content">
                <h4 class="type-title">Rot</h4>
                <p class="type-trait">Dominant & Zielstrebig</p>
              </div>
            </div>
            <div class="card-shine"></div>
          </div>
          
          <div class="type-card type-s">
            <div class="card-inner">
              <div class="image-bg">
                <img src="/peoplegreenhomepag.png" alt="Grün" class="type-image">
              </div>
              <div class="type-content">
                <h4 class="type-title">Grün</h4>
                <p class="type-trait">Harmonisch & Geduldig</p>
              </div>
            </div>
            <div class="card-shine"></div>
          </div>
          
          <div class="type-card type-i">
            <div class="card-inner">
              <div class="image-bg">
                <img src="/peopleyellowhomepage.png" alt="Gelb" class="type-image">
              </div>
              <div class="type-content">
                <h4 class="type-title">Gelb</h4>
                <p class="type-trait">Enthusiastisch & Sozial</p>
              </div>
            </div>
            <div class="card-shine"></div>
          </div>
        </div>
      </div>
      
      <div class="start-card">
        <h2>Bereit zu starten?</h2>
        <p>Beantworten Sie 10 kurze Fragen und erfahren Sie, welcher Persönlichkeitstyp Sie sind.</p>
        
        <NuxtLink to="/test" class="start-btn">
          Test starten →
        </NuxtLink>
        
        <p class="note">Kostenlos • 3 Minuten • Sofortige Ergebnisse</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem 2rem;
}

.hero {
  text-align: center;
}

h1 {
  font-size: 2rem;
  color: #1a1a2e;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: #666;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.start-card {
  background: linear-gradient(135deg, #4a90d9 0%, #357abd 100%);
  border-radius: 16px;
  padding: 1.75rem;
  margin-bottom: 1rem;
  color: white;
  box-shadow: 0 10px 30px rgba(74, 144, 217, 0.3);
}

.start-card h2 {
  margin-bottom: 0.4rem;
  font-size: 1.3rem;
}

.start-card p {
  opacity: 0.9;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.start-btn {
  display: inline-block;
  padding: 0.85rem 2rem;
  background: white;
  color: #4a90d9;
  text-decoration: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.note {
  font-size: 0.8rem;
  opacity: 0.8;
  margin-top: 0.75rem;
  margin-bottom: 0;
}

.info-section {
  margin-top: 0;
}

.info-section h3 {
  margin-bottom: 0.25rem;
  color: #1a1a2e;
  font-size: 1.25rem;
}

.info-text {
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.types-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  max-width: 580px;
  margin: 0 auto 1.5rem;
}

.type-card {
  padding: 0;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  cursor: pointer;
}

.type-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.card-inner {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  min-height: 180px;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.card-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s;
  pointer-events: none;
}

.type-card:hover .card-shine {
  left: 100%;
}

.image-bg {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 140px;
  aspect-ratio: 0.8;
  transition: all 0.3s;
}

.type-card:hover .image-bg {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.type-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s;
}

.type-card:hover .type-image {
  transform: scale(1.05);
}

.type-content {
  text-align: center;
  width: 100%;
}

.type-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.25rem 0;
  text-transform: capitalize;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.type-trait {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.3px;
}

/* Color-specific gradients with more depth */
.type-d { 
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
}

.type-i { 
  background: linear-gradient(135deg, #fde047 0%, #facc15 50%, #eab308 100%);
}



.type-s { 
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%);
}

.type-g { 
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
}

@media (max-width: 768px) {
  h1 {
    font-size: 1.8rem;
  }
  
  .types-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.85rem;
  }
  
  .card-inner {
    min-height: 160px;
  }
}

@media (max-width: 500px) {
  .types-grid {
    grid-template-columns: 1fr;
    max-width: 300px;
  }
  
  .card-inner {
    min-height: 200px;
  }
  
  .image-bg {
    max-width: 160px;
  }
}
</style>