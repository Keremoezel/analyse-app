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
}

// Auth state
const isAuthenticated = ref(false)
const password = ref('')
const loginError = ref('')

// Check auth on mount
onMounted(() => {
  if (localStorage.getItem('admin_auth') === 'true') {
    isAuthenticated.value = true
    refresh()
  }
})

// Fetch results only when authenticated
const { data: results, refresh } = await useFetch<ResultRow[]>('/api/admin/results', {
  immediate: false,
})

async function login() {
  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: { password: password.value }
    })
    
    // Login successful
    isAuthenticated.value = true
    loginError.value = ''
    localStorage.setItem('admin_auth', 'true')
    refresh()
  } catch (e) {
    loginError.value = 'Falsches Passwort'
    password.value = ''
  }
}

function logout() {
  isAuthenticated.value = false
  localStorage.removeItem('admin_auth')
  password.value = ''
}

// ... imports
async function deleteResult(id: number) {
  if (!confirm('Möchten Sie dieses Ergebnis wirklich löschen?')) return

  try {
    await $fetch(`/api/admin/results/${id}`, {
      method: 'DELETE',
    })
    // Refresh list
    refresh()
  } catch (e) {
    alert('Fehler beim Löschen')
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('de-DE')
}
</script>

<template>
  <div class="admin-container">
    <!-- Login Screen -->
    <div v-if="!isAuthenticated" class="login-screen">
      <!-- ... login content ... -->
      <div class="login-card">
        <div class="login-header">
          <span class="lock-icon">🔒</span>
          <h1>Admin Login</h1>
          <p>Bitte melden Sie sich an</p>
        </div>
        
        <form @submit.prevent="login" class="login-form">
          <input 
            v-model="password" 
            type="password" 
            placeholder="Passwort"
            required
            autofocus
          >
          <p v-if="loginError" class="error">{{ loginError }}</p>
          <button type="submit" class="login-btn">Anmelden</button>
        </form>
      </div>
    </div>

    <!-- Dashboard -->
    <div v-else class="dashboard">
      <header class="admin-header">
        <h1>Admin Dashboard</h1>
        <div class="header-actions">
          <button @click="refresh()" class="action-btn" title="Aktualisieren">🔄</button>
          <button @click="logout" class="action-btn logout">Abmelden</button>
        </div>
      </header>
      
      <div v-if="results && results.length > 0" class="card">
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

/* Login Styles */
.login-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.login-card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  text-align: center;
}

.lock-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.login-header h1 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #1a1a2e;
}

.login-header p {
  color: #666;
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-form input {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.login-btn {
  padding: 0.75rem;
  background: #4a90d9;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.login-btn:hover {
  background: #357abd;
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

.error {
  color: #dc3545;
  margin-bottom: 1rem;
}
</style>
