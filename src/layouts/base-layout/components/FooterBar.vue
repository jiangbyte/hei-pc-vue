<template>
  <div class="text-center py-4 px-6 text-gray-400 text-xs bg-white border-t border-gray-100">
    Hei PC &copy;{{ year }} All rights reserved.
  </div>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>
