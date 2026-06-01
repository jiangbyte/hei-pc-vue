<template>
  <div class="about-page">
    <!-- Hero -->
    <section class="about-hero">
      <h1 class="about-hero-title">关于我们</h1>
      <p class="about-hero-desc">了解 Hei PC 平台的故事与愿景</p>
    </section>

    <!-- Intro -->
    <section class="section">
      <div class="section-content">
        <h2 class="section-title">平台简介</h2>
        <p class="section-text">
          Hei PC 是一个面向公众的现代化服务平台，致力于为用户提供高效、便捷、安全的在线服务体验。
          我们采用先进的技术架构，确保服务的稳定性和安全性，持续为用户创造价值。
        </p>
      </div>
    </section>

    <!-- Values -->
    <section class="section section-alt">
      <h2 class="section-title">核心价值观</h2>
      <div class="values-grid">
        <a-card v-for="v in values" :key="v.title" :bordered="false" class="value-card">
          <template #title>
            <div class="flex items-center gap-2">
              <component :is="v.icon" class="value-icon" />
              <span>{{ v.title }}</span>
            </div>
          </template>
          <p>{{ v.desc }}</p>
        </a-card>
      </div>
    </section>

    <!-- Contact -->
    <section class="section">
      <h2 class="section-title">联系我们</h2>
      <div class="contact-grid">
        <a-card v-for="c in contacts" :key="c.label" :bordered="false" class="contact-card">
          <template #title>
            <div class="flex items-center gap-2">
              <component :is="c.icon" class="contact-icon" />
              <span>{{ c.label }}</span>
            </div>
          </template>
          <p class="contact-value">{{ c.value }}</p>
        </a-card>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  SafetyOutlined,
  HeartOutlined,
  BulbOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'PcAbout' })

const values = [
  { title: '用户至上', desc: '始终把用户体验放在首位，不断优化产品和服务。', icon: HeartOutlined },
  { title: '安全可信', desc: '严格保护用户数据安全，建立可靠的服务体系。', icon: SafetyOutlined },
  { title: '创新驱动', desc: '持续技术创新，引领行业服务标准。', icon: BulbOutlined },
]

const contacts = [
  { label: '邮箱', value: 'support@hei-pc.com', icon: MailOutlined },
  { label: '电话', value: '400-000-0000', icon: PhoneOutlined },
  { label: '地址', value: '北京市朝阳区xx路xx号', icon: EnvironmentOutlined },
  { label: '工作时间', value: '周一至周五 9:00 - 18:00', icon: ClockCircleOutlined },
]
</script>

<style scoped>
.about-hero {
  background: linear-gradient(135deg, #1677ff 0%, #0958d9 50%, #0a3d8f 100%);
  padding: 80px 24px;
  text-align: center;
  color: #fff;
}
.about-hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 12px;
}
.about-hero-desc {
  font-size: 18px;
  opacity: 0.85;
}

.section {
  padding: 64px 24px;
  max-width: 1000px;
  margin: 0 auto;
}
.section-alt {
  max-width: none;
  background: #fafafa;
}
.section-title {
  text-align: center;
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 32px;
}
.section-text {
  text-align: center;
  font-size: 16px;
  line-height: 1.8;
  color: #555;
  max-width: 700px;
  margin: 0 auto;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
}
.value-card {
  border-radius: 12px;
  text-align: center;
}
.value-icon {
  font-size: 20px;
  color: var(--primary-color, #1677ff);
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-width: 700px;
  margin: 0 auto;
}
.contact-card {
  border-radius: 12px;
}
.contact-icon {
  color: var(--primary-color, #1677ff);
}
.contact-value {
  color: #666;
}

@media (max-width: 768px) {
  .about-hero-title {
    font-size: 32px;
  }
  .values-grid {
    grid-template-columns: 1fr;
  }
  .contact-grid {
    grid-template-columns: 1fr;
  }
}
</style>
