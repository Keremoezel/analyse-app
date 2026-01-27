<script setup lang="ts">
useSeoMeta({
  title: 'DISG Persönlichkeitstest',
  description: 'Entdecken Sie Ihren DISG Persönlichkeitstyp',
})
</script>

<template>
  <div class="app-wrapper">
    <!-- Navigation Bar -->
    <nav class="topbar">
      <NuxtLink to="/" class="logo">
        <span class="logo-icon">🎯</span>
        <span class="logo-text">DISG Test</span>
      </NuxtLink>
      
      <div class="nav-links">
        <NuxtLink to="/" class="nav-link">Home</NuxtLink>
        <NuxtLink to="/admin" class="nav-link admin-link">
          🔒 Admin
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
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #1a1a2e;
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  font-weight: 700;
  font-size: 1.25rem;
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
}

.admin-link:hover {
  background: #e8f4fd;
  border-color: #4a90d9;
}
</style>
