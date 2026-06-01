<template>
  <template v-for="item in items" :key="item.path || item.label">
    <ASubMenu v-if="item.children?.length" :key="item.label">
      <template #title>{{ item.label }}</template>
      <NavMenuItems :items="item.children" />
    </ASubMenu>
    <AMenuItem v-else :key="item.path">
      <router-link :to="item.path" class="no-underline">{{ item.label }}</router-link>
    </AMenuItem>
  </template>
</template>

<script setup lang="ts">
import type { NavItem } from '@/config/nav'

defineProps<{
  items: NavItem[]
}>()
</script>
