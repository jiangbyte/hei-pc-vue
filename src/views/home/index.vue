<template>
  <div>
    <!-- Hero section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">欢迎来到 Hei PC</h1>
        <p class="hero-desc">
          一个面向公众的现代化服务平台，为您提供高效、安全、便捷的在线服务体验
        </p>
        <div class="hero-actions">
          <a-button type="primary" size="large" class="hero-btn" @click="router.push('/about')">
            了解更多
          </a-button>
          <a-button size="large" ghost class="hero-btn" @click="router.push('/notices')">
            查看公告
          </a-button>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="section">
      <h2 class="section-title">核心优势</h2>
      <p class="section-desc">我们致力于为您提供最优质的服务</p>
      <div class="features-grid">
        <a-card v-for="item in features" :key="item.title" :bordered="false" class="feature-card">
          <template #title>
            <div class="feature-card-title">
              <component :is="item.icon" class="feature-icon" />
              <span>{{ item.title }}</span>
            </div>
          </template>
          <p class="feature-desc">{{ item.desc }}</p>
        </a-card>
      </div>
    </section>

    <!-- Latest notices -->
    <section class="section section-alt">
      <h2 class="section-title">最新公告</h2>
      <p class="section-desc">了解平台最新动态和通知</p>
      <div class="notices-wrapper">
        <a-spin :spinning="loading">
          <a-empty v-if="!loading && notices.length === 0" description="暂无公告" />
          <a-list v-else :data-source="notices" :pagination="false" item-layout="horizontal">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <router-link :to="`/notices/${item.id}`" class="notice-title">
                      {{ item.title }}
                    </router-link>
                  </template>
                  <template #description>
                    <span class="notice-meta">{{ item.create_time }}</span>
                    <a-tag v-if="item.level" :color="noticeLevelColor(item.level)" class="ml-2">
                      {{ item.level }}
                    </a-tag>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
          <div v-if="notices.length" class="notices-more">
            <router-link to="/notices">查看全部公告 →</router-link>
          </div>
        </a-spin>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ThunderboltOutlined,
  SafetyOutlined,
  AppstoreOutlined,
  SmileOutlined,
  TeamOutlined,
  RocketOutlined,
} from '@ant-design/icons-vue'
import { fetchNoticeLatest } from '@/api/notice'

defineOptions({ name: 'PcHome' })

const router = useRouter()

const features = [
  {
    title: '高效便捷',
    desc: '快速响应的服务体验，满足您的各种需求。系统性能优越，操作流畅。',
    icon: ThunderboltOutlined,
  },
  {
    title: '安全可靠',
    desc: '数据加密传输，严格保护您的隐私安全。采用先进的安全防护机制。',
    icon: SafetyOutlined,
  },
  {
    title: '丰富功能',
    desc: '提供多种业务功能，一站式服务平台。持续迭代更新，满足不断变化的需求。',
    icon: AppstoreOutlined,
  },
  {
    title: '用户至上',
    desc: '以用户体验为核心，持续优化产品。专业的客服团队为您排忧解难。',
    icon: SmileOutlined,
  },
  {
    title: '专业团队',
    desc: '资深的研发与运营团队，保障平台稳定运行。多年的行业经验积累。',
    icon: TeamOutlined,
  },
  {
    title: '持续创新',
    desc: '拥抱前沿技术，不断推陈出新。引领行业标准，打造卓越服务平台。',
    icon: RocketOutlined,
  },
]

const loading = ref(false)
const notices = ref<any[]>([])

function noticeLevelColor(level: string) {
  const map: Record<string, string> = { 紧急: 'red', 重要: 'orange', 普通: 'blue' }
  return map[level] || 'default'
}

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await fetchNoticeLatest({ size: 5 })
    if (data?.records) {
      notices.value = data.records
    } else if (Array.isArray(data)) {
      notices.value = data
    }
  } catch {
    // silently fail
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #1677ff 0%, #0958d9 50%, #0a3d8f 100%);
  padding: 80px 24px;
  text-align: center;
  color: #fff;
}
.hero-content {
  max-width: 800px;
  margin: 0 auto;
}
.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.2;
}
.hero-desc {
  font-size: 18px;
  opacity: 0.85;
  margin-bottom: 32px;
  line-height: 1.6;
}
.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}
.hero-btn {
  height: 48px;
  padding: 0 32px;
  font-size: 16px;
  border-radius: 8px;
}

.section {
  padding: 64px 24px;
  max-width: 1200px;
  margin: 0 auto;
}
.section-alt {
  max-width: none;
  background: #fafafa;
}
.section-title {
  text-align: center;
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1a1a1a;
}
.section-desc {
  text-align: center;
  color: #666;
  margin-bottom: 48px;
  font-size: 16px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.feature-card {
  border-radius: 12px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}
.feature-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.feature-icon {
  font-size: 20px;
  color: var(--primary-color, #1677ff);
}
.feature-desc {
  color: #666;
  line-height: 1.6;
  min-height: 48px;
}

.notices-wrapper {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.notice-title {
  color: #1a1a1a;
  font-weight: 500;
  text-decoration: none;
}
.notice-title:hover {
  color: var(--primary-color, #1677ff);
}
.notice-meta {
  font-size: 13px;
  color: #999;
}
.notices-more {
  text-align: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
.notices-more a {
  color: var(--primary-color, #1677ff);
  text-decoration: none;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }
  .hero-desc {
    font-size: 16px;
  }
  .features-grid {
    grid-template-columns: 1fr;
  }
  .section {
    padding: 40px 16px;
  }
}
</style>
