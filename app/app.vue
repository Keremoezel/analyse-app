<script setup lang="ts">
useSeoMeta({
  title: 'My NuxtHub App',
  description: 'My full-stack NuxtHub application',
})
</script>

<template>
  <NuxtPage />
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
  background-color: #fff;
}
</style>
