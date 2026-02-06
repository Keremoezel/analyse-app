<script setup lang="ts">
// Simple landing page - just start the test
</script>

<template>
  <div class="container">
    <div class="hero">
      <div class="header-container">
        <h1>power4-people Kurzanalyse</h1>
        <p class="subtitle">
          Entdecken Sie Ihren Persönlichkeitstyp in nur 3 Minuten
        </p>
      </div>
      
      <div class="info-section">
        <h3>Welche Persönlichkeitstypen gibt es?</h3>
        <div class="types-grid">
          <UCard class="type-card type-g" :ui="{ root: 'bg-transparent ring-0 shadow-none', body: '!p-0' }">
            <div class="card-inner">
              <div class="image-bg">
                <img src="/images/characters/char-blue.png" alt="Blau" class="type-image">
              </div>
              <div class="type-content">
                <h4 class="type-title">Blau</h4>
              </div>
            </div>
            <div class="card-shine"></div>
          </UCard>
          
          <UCard class="type-card type-d" :ui="{ root: 'bg-transparent ring-0 shadow-none', body: '!p-0' }">
            <div class="card-inner">
              <div class="image-bg">
                <img src="/images/characters/char-red-active.png" alt="Rot" class="type-image">
              </div>
              <div class="type-content">
                <h4 class="type-title">Rot</h4>
              </div>
            </div>
            <div class="card-shine"></div>
          </UCard>
          
          <UCard class="type-card type-s" :ui="{ root: 'bg-transparent ring-0 shadow-none', body: '!p-0' }">
            <div class="card-inner">
              <div class="image-bg">
                <img src="/images/characters/char-green-active.png" alt="Grün" class="type-image">
              </div>
              <div class="type-content">
                <h4 class="type-title">Grün</h4>
              </div>
            </div>
            <div class="card-shine"></div>
          </UCard>
          
          <UCard class="type-card type-i" :ui="{ root: 'bg-transparent ring-0 shadow-none', body: '!p-0' }">
            <div class="card-inner">
              <div class="image-bg">
                <img srcset="/images/characters/char-yellow-active.png 1x" alt="Gelb" class="type-image">
              </div>
              <div class="type-content">
                <h4 class="type-title">Gelb</h4>
              </div>
            </div>
            <div class="card-shine"></div>
          </UCard>
        </div>
      </div>
      
      <div class="start-card">
        <h2>Bereit zu starten?</h2>
        <p>Beantworten Sie 10 kurze Fragen und erfahren Sie, welcher Persönlichkeitstyp Sie sind.</p>
        
        <NuxtLink to="/test" class="start-btn">
          Analyse starten →
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

.header-container {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 20px;
  padding: 2rem 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.1);
  position: relative;
  overflow: hidden;
}

.header-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b);
  border-radius: 20px 20px 0 0;
}

h1 {
  font-size: 2rem;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #475569;
  font-size: 1.05rem;
  margin-bottom: 0;
  line-height: 1.5;
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
  gap: 0.5rem;
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
  background: transparent;
  border-radius: 12px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 100%;
  height: 150px;
  transition: all 0.3s;
  overflow: hidden;
}

.type-card:hover .image-bg {
  transform: scale(1.05);
}

.type-image {
  width: 60%;
  height: 100%;
  object-position: center;
  transition: transform 0.3s;
  mix-blend-mode: darken;
  filter: contrast(1.1);
   image-rendering: auto;
  image-rendering: smooth;
  image-rendering: high-quality;
  image-rendering: -webkit-optimize-contrast;
}

.type-card:hover .type-image {
  transform: scale(1.05);
}

.type-content {
  text-align: center;
  width: 100%;
}

.type-title {
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-transform: capitalize;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
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
  
  .header-container {
    padding: 1.5rem 1.25rem;
    margin-bottom: 1.5rem;
  }
  
  .subtitle {
    font-size: 0.95rem;
  }
  
  .types-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.85rem;
  }
  
  .card-inner {
    min-height: 160px;
  }
  
  .image-bg {
    height: 100px;
  }
}

@media (max-width: 500px) {
  .types-grid {
    grid-template-columns: 1fr;
    max-width: 300px;
  }
  
  .card-inner {
    min-height: 180px;
  }
  
  .image-bg {
    height: 130px;
  }
}
</style>