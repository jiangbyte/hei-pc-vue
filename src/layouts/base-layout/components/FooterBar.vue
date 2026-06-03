<template>
  <div class="layout-footer">Hei PC &copy;{{ year }} All rights reserved.</div>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>
