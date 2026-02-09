<script setup lang="ts">
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()

async function handleLogin() {
  if (!email.value || !password.value) return
  
  loading.value = true
  error.value = ''

  try {
    await $fetch('/api/auth/admin-login', {
      method: 'POST',
      body: { 
        email: email.value,
        password: password.value 
      }
    })
    
    // Redirect on success
    window.location.href = '/admin'
  } catch (e: any) {
    error.value = 'Ungültige Anmeldedaten.'
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="icon-wrapper">
        <span class="lock-icon">🛡️</span>
      </div>
      
      <h1>Admin Login</h1>
      <p class="subtitle">E-Mail & Passwort erforderlich</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">E-Mail</label>
          <input 
            id="email"
            v-model="email"
            type="email" 
            placeholder="admin@example.com"
            required
            autofocus
            :disabled="loading"
          >
        </div>

        <div class="form-group">
          <label for="password">Passwort</label>
          <input 
            id="password"
            v-model="password"
            type="password" 
            placeholder="••••••••"
            required
            :disabled="loading"
          >
        </div>

        <div v-if="error" class="error-msg">
          {{ error }}
        </div>

        <button type="submit" :disabled="loading" class="submit-btn">
          <span v-if="loading">Wird geprüft...</span>
          <span v-else>Anmelden</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  padding: 1rem;
}

.login-card {
  background: white;
  width: 100%;
  max-width: 400px;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  text-align: center;
}

.icon-wrapper {
  background: #eff6ff;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.lock-icon {
  font-size: 2rem;
}

h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #64748b;
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
    text-align: left;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #475569;
}

input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  outline: none;
}

input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 0.875rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background: #2563eb;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-msg {
  color: #ef4444;
  font-size: 0.875rem;
  background: #fef2f2;
  padding: 0.75rem;
  border-radius: 8px;
}
</style>
