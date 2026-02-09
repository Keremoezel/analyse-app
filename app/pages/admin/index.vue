<script setup lang="ts">
interface ResultRow {
  id: number
  email: string
  dScore: number
  iScore: number
  sScore: number
  gScore: number
  slug: string
  createdAt: string
  contactedAt?: string | null
}

interface Meta {
    total: number
    page: number
    limit: number
    totalPages: number
}

interface ResultsResponse {
    data: ResultRow[]
    meta: Meta
}

interface Stats {
    totalTests: number
    conversionRate: number
    dailyStats: Array<{ date: string, count: number }>
}

definePageMeta({
    middleware: 'admin-auth'
})

// Pagination State
const page = ref(1)
const limit = ref(20)

// Stats & Results
const { data: resultsData, refresh: refreshResults } = await useFetch<ResultsResponse>('/api/admin/results', {
    query: { page, limit },
    default: () => ({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } })
})

const { data: stats, refresh: refreshStats } = await useFetch<Stats>('/api/admin/stats')

const results = computed(() => resultsData.value?.data || [])
const meta = computed(() => resultsData.value?.meta || { total: 0, page: 1, limit: 20, totalPages: 0 })

async function refreshAll() {
    const promises = []
    if (refreshResults) promises.push(refreshResults())
    if (refreshStats) promises.push(refreshStats())
    await Promise.all(promises)
}

function prevPage() {
    if (page.value > 1) page.value--
}

function nextPage() {
    if (page.value < meta.value.totalPages) page.value++
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {}) // Optional
  const cookie = useCookie('admin_token')
  cookie.value = null
  await navigateTo('/admin/login')
}

// Helpers
async function deleteResult(id: number) {
  if (!confirm('Möchten Sie dieses Ergebnis wirklich löschen?')) return

  try {
    await $fetch(`/api/admin/results/${id}`, {
      method: 'DELETE',
    })
    refreshAll()
  } catch (e) {
    alert('Fehler beim Löschen')
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('de-DE')
}

function getDayName(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric' })
}

// Fill missing days in stats for better chart (30 days)
const filledDailyStats = computed(() => {
    return stats.value?.dailyStats || []
})
// Chart Logic
const chartPoints = computed(() => {
    const data = filledDailyStats.value
    if (data.length === 0) return []
    
    const maxVal = Math.max(...data.map(d => d.count), 5) // Min scale of 5
    const width = 1000
    const height = 200
    const padding = 10
    
    return data.map((d, i) => {
        const x = data.length > 1 ? (i / (data.length - 1)) * width : width / 2
        // Invert Y because SVG 0 is top
        const y = height - ((d.count / maxVal) * (height - padding))
        return { x, y, count: d.count, date: d.date }
    })
})

const chartLinePath = computed(() => {
    const points = chartPoints.value
    if (points.length === 0) return ''
    
    return points.map((p, i) => 
        (i === 0 ? 'M' : 'L') + `${p.x},${p.y}`
    ).join(' ')
})

const chartAreaPath = computed(() => {
    const points = chartPoints.value
    if (points.length === 0) return ''
    
    const line = chartLinePath.value
    const lastPoint = points[points.length - 1]
    const lastX = lastPoint ? lastPoint.x : 0
    
    return `${line} L${lastX},200 L0,200 Z`
})

</script>

<template>
  <div class="admin-container">
    <!-- Dashboard (Protected by Middleware & Cookie) -->
    <div class="dashboard">
      <header class="admin-header">
        <h1>Admin Dashboard</h1>
        <div class="header-actions">
          <button @click="refreshAll()" class="action-btn" title="Aktualisieren">🔄</button>
          <button @click="logout" class="action-btn logout">Abmelden</button>
        </div>
      </header>

      <!-- Analytics Section -->
      <div v-if="stats" class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Tests (30 Tage)</div>
          <div class="stat-value">{{ stats.totalTests }}</div>
          <div class="stat-trend" :class="{ up: stats.totalTests > 0 }">
            {{ stats.totalTests > 0 ? '📈 Aktiv' : 'Keine Daten' }}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Kontakt-Rate</div>
          <div class="stat-value">{{ stats.conversionRate }}%</div>
          <div class="stat-sub">der Nutzer fragen an</div>
        </div>

        <div class="stat-card chart-card">
          <div class="stat-label">Verlauf (30 Tage)</div>
          <div class="chart-container">
            <svg class="trend-chart" viewBox="0 0 1000 200" preserveAspectRatio="none">
              <!-- Grid Lines -->
              <line x1="0" y1="50" x2="1000" y2="50" stroke="#f0f0f0" stroke-width="1" />
              <line x1="0" y1="100" x2="1000" y2="100" stroke="#f0f0f0" stroke-width="1" />
              <line x1="0" y1="150" x2="1000" y2="150" stroke="#f0f0f0" stroke-width="1" />
              
              <!-- Gradient Definition -->
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.2" />
                  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
                </linearGradient>
              </defs>
              
              <!-- Area Path -->
              <path :d="chartAreaPath" fill="url(#chartGradient)" />
              
              <!-- Line Path -->
              <path :d="chartLinePath" fill="none" stroke="#2563eb" stroke-width="3" vector-effect="non-scaling-stroke" />
              
              <!-- Data Points (only show on hover via CSS or always for important ones?) -->
              <!-- Data Points -->
               <circle 
                v-for="(point, i) in chartPoints" 
                :key="i"
                :cx="point.x" 
                :cy="point.y" 
                r="4" 
                class="chart-point"
                :data-date="getDayName(point.date)"
                :data-count="point.count"
              />
            </svg>
            
            <!-- Simple Tooltip/Legend below -->
            <div class="chart-labels">
                <span>{{ getDayName(filledDailyStats[0]?.date || '') }}</span>
                <span>{{ getDayName(filledDailyStats[filledDailyStats.length - 1]?.date || '') }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="results && results.length > 0" class="card">
        <div class="card-header">
            <h2>Neueste Ergebnisse</h2>
            <div class="pagination-info" v-if="meta.total > 0">
                Seite {{ meta.page }} von {{ meta.totalPages }} ({{ meta.total }} Einträge)
            </div>
        </div>
        <div class="table-responsive">
          <table class="results-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>E-Mail</th>
                <th class="score-col type-d">D</th>
                <th class="score-col type-i">I</th>
                <th class="score-col type-s">S</th>
                <th class="score-col type-g">G</th>
                <th>Datum</th>
                <th>Kontakt</th>
                <th>Aktion</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in results" :key="row.id">
                <td>#{{ row.id }}</td>
                <td class="email-cell">{{ row.email }}</td>
                <td class="score-col"><span class="badge d">{{ row.dScore }}</span></td>
                <td class="score-col"><span class="badge i">{{ row.iScore }}</span></td>
                <td class="score-col"><span class="badge s">{{ row.sScore }}</span></td>
                <td class="score-col"><span class="badge g">{{ row.gScore }}</span></td>
                <td class="date-cell">{{ formatDate(row.createdAt) }}</td>
                <td class="status-cell">
                    <span v-if="row.contactedAt" class="status-badge success" title="Hat Kontaktformular gesendet">Ja</span>
                    <span v-else class="status-badge neutral">-</span>
                </td>
                <td class="actions-cell">
                  <NuxtLink :to="`/result/${row.slug}`" class="view-btn">
                    Ansehen
                  </NuxtLink>
                  <button @click="deleteResult(row.id)" class="delete-btn" title="Löschen">
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination Controls -->
        <div class="pagination-controls" v-if="meta.totalPages > 1">
            <button @click="prevPage" :disabled="page <= 1" class="page-btn">← Zurück</button>
            <span class="page-numbers">
                <button 
                    v-for="p in meta.totalPages" 
                    :key="p" 
                    @click="page = p"
                    class="page-number"
                    :class="{ active: p === page }"
                    v-show="Math.abs(p - page) <= 2 || p === 1 || p === meta.totalPages"
                >
                    {{ (Math.abs(p - page) > 2 && p !== 1 && p !== meta.totalPages) ? '...' : p }}
                </button>
            </span>
            <button @click="nextPage" :disabled="page >= meta.totalPages" class="page-btn">Weiter →</button>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <span class="empty-icon">📭</span>
        <h3>Keine Ergebnisse</h3>
        <p>Es wurden noch keine Tests durchgeführt.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 80vh;
}

/* Stats Styles */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.2;
}

.stat-trend {
  margin-top: auto;
  font-size: 0.9rem;
  padding-top: 0.5rem;
  color: #666;
}

.stat-trend.up {
  color: #16a34a;
  font-weight: 600;
}

.stat-sub {
  color: #999;
  font-size: 0.9rem;
}

/* Chart Styles */
.chart-card {
  min-width: 300px;
  /* Ensure chart container takes remaining space nicely */
  flex-grow: 2; 
}

.chart-container {
    padding-top: 1rem;
    position: relative;
    height: 120px;
}

.trend-chart {
    width: 100%;
    height: 100%;
    overflow: visible;
}

.chart-point {
    fill: white;
    stroke: #2563eb;
    stroke-width: 2;
    opacity: 0;
    transition: opacity 0.2s, r 0.2s;
    cursor: pointer;
}

.chart-container:hover .chart-point {
    opacity: 1;
}

.chart-point:hover {
    r: 6;
    fill: #2563eb;
}

/* Tooltip (simple CSS based) */
.chart-point:hover::after {
    content: attr(data-count) " Tests";
    position: absolute;
    top: 0;
    left: 0;
}

.chart-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #94a3b8;
    margin-top: 0.5rem;
}

/* Dashboard Styles */
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
}

.logout {
  color: #dc3545;
  border-color: #dc3545;
  background: white;
}

.logout:hover {
  background: #dc3545;
  color: white;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  overflow: hidden;
}

.card-header {
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
}

.card-header h2 {
    font-size: 1.25rem;
    margin: 0;
    color: #1a1a2e;
}

.table-responsive {
  overflow-x: auto;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
}

.results-table th,
.results-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.results-table th {
  background: #f8f9fa;
  font-weight: 600;
  font-size: 0.9rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.score-col {
  width: 60px;
  text-align: center;
}

.badge {
  display: inline-block;
  width: 32px;
  height: 32px;
  line-height: 32px;
  border-radius: 50%;
  text-align: center;
  font-size: 0.9rem;
  font-weight: bold;
}

.badge.d { background: #fef2f2; color: #dc3545; }
.badge.i { background: #fffbeb; color: #d97706; }
.badge.s { background: #f0fdf4; color: #16a34a; }
.badge.g { background: #eff6ff; color: #2563eb; }

.email-cell {
  font-weight: 500;
  color: #333;
}

.date-cell {
  color: #666;
  font-size: 0.9rem;
}

.status-cell {
    width: 100px;
    text-align: center;
}

.status-badge {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
}

.status-badge.success {
    background: #dcfce7;
    color: #166534;
}

.status-badge.neutral {
    color: #999;
}

.view-btn {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  background: #edf2f7;
  color: #4a5568;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.view-btn:hover {
  background: #e2e8f0;
  color: #2d3748;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.delete-btn {
  padding: 0.4rem 0.6rem;
  background: #fff5f5;
  color: #c53030;
  border: 1px solid #fed7d7;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #fed7d7;
  border-color: #feb2b2;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

/* Pagination Styles */
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.pagination-info {
    font-size: 0.9rem;
    color: #666;
}

.pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1.5rem;
    gap: 1rem;
    border-top: 1px solid #eee;
}

.page-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #e2e8f0;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    color: #4a5568;
    transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
    background: #f7fafc;
    border-color: #cbd5e0;
}

.page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-numbers {
    display: flex;
    gap: 0.25rem;
}

.page-number {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    font-size: 0.9rem;
    color: #666;
}

.page-number:hover {
    background: #f7fafc;
}

.page-number.active {
    background: #ebf8ff;
    color: #3182ce;
    font-weight: 600;
}
</style>
