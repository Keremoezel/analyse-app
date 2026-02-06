<script setup lang="ts">
useSeoMeta({
  title: 'power4-people Kurzanalyse',
  description: 'Entdecken Sie Ihren DISG Persönlichkeitstyp',
})

const isMenuOpen = ref(false)
const route = useRoute()

// Close menu on route change
watch(() => route.path, () => {
  isMenuOpen.value = false
})
</script>

<template>
  <div class="app-wrapper">
    <!-- Navigation Bar -->
    <nav class="topbar">
      <NuxtLink to="/" class="logo">
        <Icon name="heroicons:chart-pie-solid" class="logo-icon" />
        <span class="logo-text">power4-people Kurzanalyse</span>
      </NuxtLink>
      
      <button class="menu-toggle" @click="isMenuOpen = !isMenuOpen" aria-label="Menü öffnen">
        <Icon :name="isMenuOpen ? 'heroicons:x-mark' : 'heroicons:bars-3'" size="24" />
      </button>

      <div class="nav-links" :class="{ 'is-open': isMenuOpen }">
        <NuxtLink to="/" class="nav-link">Home</NuxtLink>
        <NuxtLink to="/datenschutz" class="nav-link">Datenschutz</NuxtLink>
        <NuxtLink to="/impressum" class="nav-link">Impressum</NuxtLink>
        <NuxtLink to="/admin" class="nav-link admin-link">
          <Icon name="heroicons:lock-closed" size="16" />
          Admin
        </NuxtLink>
      </div>
    </nav>
    
    <!-- Main Content -->
    <NuxtPage />
  </div>
</template>

<style>
/* Global styles */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f7fa;
}

.app-wrapper {
  min-height: 100vh;
}

/* Topbar */
.topbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  width: 100%;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #1a1a2e;
  z-index: 1001; /* Ensure logo stays above mobile menu background if needed */
}

.logo-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.logo-text {
  font-weight: 700;
  font-size: 1.25rem;
  white-space: nowrap;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #333;
  z-index: 1002; /* Ensure toggle is clickable */
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  text-decoration: none;
  color: #666;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s;
  white-space: nowrap;
}

.nav-link:hover {
  background: #f0f0f0;
  color: #333;
}

.nav-link.router-link-active {
  color: #4a90d9;
}

.admin-link {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-link:hover {
  background: #e8f4fd;
  border-color: #4a90d9;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .topbar {
    padding: 0.75rem 1rem;
  }
  
  .logo-text {
    font-size: 1rem;
  }

  .menu-toggle {
    display: block;
  }

  .nav-links {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: white;
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
    gap: 0.5rem;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    transform: translateY(-150%);
    transition: transform 0.3s ease-in-out;
    visibility: hidden;
    z-index: 999;
  }

  .nav-links.is-open {
    transform: translateY(0);
    visibility: visible;
  }

  .nav-link {
    display: block;
    text-align: center;
    padding: 0.75rem;
    border-radius: 8px;
  }
  
  .admin-link {
    justify-content: center;
    margin-top: 0.5rem;
  }
}
</style>
