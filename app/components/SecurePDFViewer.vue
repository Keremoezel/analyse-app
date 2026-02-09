<script setup lang="ts">
import VuePdfEmbed from 'vue-pdf-embed'

// Props
const props = defineProps<{
  show: boolean
  pdfUrl: string
  title?: string
}>()

// Emits
const emit = defineEmits<{
  (e: 'close'): void
}>()

// State
const isLoading = ref(true)
const pageCount = ref(0)
const pdfContainerRef = ref<HTMLElement | null>(null)
const pdfWidth = ref<number | undefined>(undefined)

function onDocumentLoaded(document: any) {
  isLoading.value = false
  if (document && document.numPages) {
    pageCount.value = document.numPages
    console.log('PDF Loaded, pages:', document.numPages)
  }
  // Calculate optimal width and scroll to top after PDF loads
  nextTick(() => {
    calculateOptimalWidth()
    scrollToTop()
  })
}

function onLoadFailed(error: any) {
  isLoading.value = false
  console.error('PDF Load Error:', error)
}

function scrollToTop() {
  nextTick(() => {
    const container = pdfContainerRef.value
    if (container) {
      container.scrollTop = 0
      container.scrollTo({ top: 0, behavior: 'smooth' })
    }
  })
}

function calculateOptimalWidth() {
  const container = pdfContainerRef.value
  if (!container) return

  const containerWidth = container.clientWidth
  const isMobile = window.innerWidth <= 768
  
  // Calculate optimal PDF width with minimal padding
  // Less padding on desktop for wider PDF
  const padding = isMobile ? 12 : 10
  const optimalWidth = containerWidth - padding
  
  // A4 aspect ratio is 1:1.414 (width:height)
  // Make sure the page fits by calculating based on available height as well
  const containerHeight = container.clientHeight
  const maxHeightBasedWidth = (containerHeight - 15) / 1.414 // A4 ratio
  
  // Use the smaller of the two to ensure full page visibility
  // Add 8% more size on desktop, 5% on mobile for better readability
  const sizeIncrease = isMobile ? 1.05 : 1.08
  const finalWidth = Math.min(optimalWidth, maxHeightBasedWidth) * sizeIncrease
  
  // Set the PDF width (vue-pdf-embed will render at this width natively)
  pdfWidth.value = Math.max(finalWidth, 300) // minimum 300px
  
  console.log('Calculated PDF width:', pdfWidth.value, 'container:', containerWidth, 'x', containerHeight)
}

// Watch for modal opening and recalculate
watch(() => props.show, (newValue) => {
  if (newValue) {
    isLoading.value = true
    // Small delay to ensure DOM is ready
    nextTick(() => {
      setTimeout(() => {
        calculateOptimalWidth()
        scrollToTop()
      }, 100)
    })
  }
})

// Recalculate on window resize
onMounted(() => {
  window.addEventListener('resize', calculateOptimalWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', calculateOptimalWidth)
})
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="emit('close')">
    <div class="modal-content pdf-modal" @click.stop>
      <button class="modal-close" @click="emit('close')" aria-label="Schließen">✕</button>
      
      <div class="modal-header">
        <h3>{{ title || 'Dokumentenansicht' }}</h3>
        <div class="pdf-notice">
          <span class="notice-icon">⚠️</span>
          <span class="notice-text">
            <strong>Wichtiger Hinweis:</strong>
            <span class="notice-detail">Dies ist nur ein Auszug. Die vollständige persönliche Auswertung umfasst ca. <strong>67 Seiten</strong>.</span>
          </span>
        </div>
      </div>
      
      <div ref="pdfContainerRef" class="pdf-container" @contextmenu.prevent>
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Lade Dokument...</p>
        </div>

        <div class="pdf-wrapper">
          <!-- Transparent overlay to prevent dragging/saving -->
          <div class="security-overlay"></div>
          
          <ClientOnly>
            <VuePdfEmbed 
              :source="pdfUrl"
              :width="pdfWidth"
              :scale="2"
              class="pdf-document"
              :text-layer="false"
              :annotation-layer="false"
              @loaded="onDocumentLoaded"
              @loading-failed="onLoadFailed"
            />
          </ClientOnly>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  padding: 20px;
}

.modal-content.pdf-modal {
  background: white;
  padding: 0;
  border-radius: 12px;
  width: 95%;
  max-width: 1000px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  overflow: hidden;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #ddd;
  font-size: 1.2rem;
  cursor: pointer;
  color: #333;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 9999;
  font-weight: bold;
}

.modal-close:hover {
  background: #f44336;
  color: white;
  border-color: #f44336;
  transform: rotate(90deg);
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  background: #f8fafc;
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0 0 12px 0;
  font-size: 1.25rem;
  color: #1a1a2e;
  padding-right: 40px;
}

.pdf-notice {
  background-color: #fff3cd;
  color: #856404;
  padding: 12px 15px;
  border-radius: 6px;
  font-size: 0.95rem;
  border: 1px solid #ffeeba;
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.notice-icon {
  flex-shrink: 0;
  font-size: 1.2rem;
}

.notice-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notice-detail {
  display: inline;
}

.pdf-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: #525659;
  position: relative;
  padding: 15px 5px;
  display: flex;
  justify-content: center;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
}

.pdf-wrapper {
  position: relative;
  width: fit-content;
  max-width: 100%;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
}

.security-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 50;
  background: transparent;
  cursor: default;
}

.pdf-document {
  background: white;
  display: block;
}

.loading-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  gap: 15px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Scrollbar styling */
.pdf-container::-webkit-scrollbar {
  width: 10px;
}

.pdf-container::-webkit-scrollbar-track {
  background: #2c2c2c;
}

.pdf-container::-webkit-scrollbar-thumb {
  background: #666;
  border-radius: 5px;
}

.pdf-container::-webkit-scrollbar-thumb:hover {
  background: #888;
}

/* ============================================ */
/* MOBILE RESPONSIVE DESIGN */
/* ============================================ */

/* Tablets (landscape) */
@media (max-width: 1024px) {
  .modal-content.pdf-modal {
    width: 98%;
    max-width: none;
    height: 95vh;
  }
  
  .modal-header {
    padding: 15px 20px;
  }
  
  .modal-header h3 {
    font-size: 1.1rem;
    margin-bottom: 10px;
  }
  
  .pdf-notice {
    padding: 10px 12px;
    font-size: 0.9rem;
    gap: 8px;
  }
  
  .pdf-container {
    padding: 15px 8px;
  }
}

/* Tablets (portrait) and large phones */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0;
  }
  
  .modal-content.pdf-modal {
    width: 100%;
    height: 100vh;
    border-radius: 0;
    max-height: 100vh;
  }
  
  .modal-close {
    top: 10px;
    right: 10px;
    width: 32px;
    height: 32px;
    font-size: 1.1rem;
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }
  
  .modal-header {
    padding: 50px 15px 12px 15px; /* Added top padding to avoid close button overlap */
  }
  
  .modal-header h3 {
    font-size: 1rem;
    padding-right: 0; /* Removed since we have top padding now */
    margin-bottom: 8px;
  }
  
  .pdf-notice {
    padding: 10px;
    font-size: 0.85rem;
    flex-direction: column;
    gap: 6px;
    text-align: left;
  }
  
  .notice-icon {
    font-size: 1.1rem;
  }
  
  .notice-text {
    gap: 2px;
  }
  
  .notice-detail {
    display: block;
    margin-top: 2px;
  }
  
  .pdf-container {
    padding: 12px 5px;
  }
  
  .pdf-wrapper {
    box-shadow: 0 0 15px rgba(0,0,0,0.4);
  }
}

/* Mobile phones */
@media (max-width: 480px) {
  .modal-close {
    top: 8px;
    right: 8px;
    width: 30px;
    height: 30px;
    font-size: 1rem;
  }
  
  .modal-header {
    padding: 45px 12px 10px 12px; /* Added top padding to avoid close button overlap */
  }
  
  .modal-header h3 {
    font-size: 0.95rem;
    padding-right: 0;
    margin-bottom: 8px;
  }
  
  .pdf-notice {
    padding: 8px;
    font-size: 0.8rem;
  }
  
  .notice-icon {
    font-size: 1rem;
  }
  
  .pdf-container {
    padding: 10px 3px;
  }
  
  .loading-state {
    gap: 10px;
  }
  
  .loading-state p {
    font-size: 0.9rem;
  }
  
  .spinner {
    width: 35px;
    height: 35px;
    border-width: 3px;
  }
}

/* Very small phones */
@media (max-width: 360px) {
  .modal-header h3 {
    font-size: 0.9rem;
  }
  
  .pdf-notice {
    font-size: 0.75rem;
    padding: 7px;
  }
  
  .pdf-container {
    padding: 8px 2px;
  }
}

/* Landscape orientation on mobile */
@media (max-height: 500px) and (orientation: landscape) {
  .modal-content.pdf-modal {
    height: 100vh;
  }
  
  .modal-header {
    padding: 6px 12px;
  }
  
  .modal-header h3 {
    font-size: 0.85rem;
    margin-bottom: 4px;
  }
  
  .pdf-notice {
    font-size: 0.7rem;
    padding: 5px 8px;
    gap: 4px;
  }
  
  .notice-icon {
    font-size: 0.9rem;
  }
  
  .pdf-container {
    padding: 8px 5px;
  }
  
  .modal-close {
    top: 6px;
    right: 6px;
    width: 28px;
    height: 28px;
    font-size: 0.95rem;
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .modal-close {
    /* Larger touch target */
    min-width: 44px;
    min-height: 44px;
  }
  
  .pdf-container {
    /* Better touch scrolling */
    overscroll-behavior: contain;
  }
}
</style>