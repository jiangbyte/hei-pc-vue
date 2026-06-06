<template>
  <div>
    <!-- Hero -->
    <section
      class="bg-gradient-to-r from-[#1677ff] via-[#0958d9] to-[#0a3d8f] py-20 px-6 text-center text-white"
    >
      <h1 class="text-5xl font-bold mb-3">Hei PC</h1>
      <p class="text-lg opacity-85">了解 Hei PC 前端解决方案</p>
    </section>

    <!-- Intro -->
    <section class="py-16 px-6 max-w-1000px mx-auto">
      <h2 class="text-center text-3xl font-semibold mb-8 text-gray-800">项目简介</h2>
      <p class="text-center text-base leading-relaxed text-gray-600 max-w-700px mx-auto">
        Hei PC 是 HEI 快速开发框架的 Vue3 前台（C 端）解决方案，
        与 Hei Gin 等后端框架配套使用。项目采用 Vue 3 + Vite + TypeScript + Ant Design Vue 构建，
        页面默认对游客开放，支持按需接入 C 端用户认证体系。
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'PcAbout' })
</script>
