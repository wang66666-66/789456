<template>
  <div class="dish-detail-page">
    <div v-if="dish" class="detail-inner">
      <button type="button" class="back-btn" @click="goBack">← 返回</button>

      <div class="detail-media">
        <img
          :src="dish.image || '/images/default-dish.jpg'"
          :alt="dish.name"
          class="hero-img"
          @error="onImgError"
        />
        <div class="region-band">
          <span class="label">所属地</span>
          <span class="value">{{ regionLine }}</span>
        </div>
      </div>

      <h1 class="title">{{ dish.name }}</h1>
      <p v-if="leadText" class="lead">{{ leadText }}</p>

      <div class="meta-grid">
        <div class="meta-item">
          <span class="k">地级市</span>
          <span class="v">{{ dish.city || '—' }}</span>
        </div>
        <div class="meta-item">
          <span class="k">口味特点</span>
          <span class="v flavor-text">{{ dish.flavor }}</span>
        </div>
        <div class="meta-item">
          <span class="k">菜系</span>
          <span class="v">{{ cuisineLabel }}</span>
        </div>
        <div v-if="intangibleLine" class="meta-item meta-span-2">
          <span class="k">非遗 / 认定</span>
          <span class="v">{{ intangibleLine }}</span>
        </div>
        <div v-if="dish.difficulty" class="meta-item">
          <span class="k">难度</span>
          <span class="v">{{ dish.difficulty }}</span>
        </div>
        <div v-if="dish.cookingTime != null" class="meta-item">
          <span class="k">用时</span>
          <span class="v">{{ dish.cookingTime }} 分钟</span>
        </div>
      </div>

      <section v-if="dish.ingredients?.length" class="block">
        <h2>主要食材</h2>
        <div class="tags">
          <span v-for="ing in dish.ingredients" :key="ing" class="tag">{{ ing }}</span>
        </div>
      </section>

      <section v-if="historyList.length" class="block">
        <h2>历史沿革</h2>
        <ul class="history-list">
          <li v-for="(h, idx) in historyList" :key="idx">
            <span class="period">{{ h.period }}</span>
            <p class="record">{{ h.record }}</p>
          </li>
        </ul>
      </section>

      <section v-if="poemText" class="block poem-block">
        <h2>诗文摘录</h2>
        <blockquote class="poem-quote">{{ poemText }}</blockquote>
        <p v-if="poemSource" class="poem-source">{{ poemSource }}</p>
      </section>

      <section v-if="dish.technique" class="block">
        <h2>制作工艺</h2>
        <p class="prose">{{ dish.technique }}</p>
      </section>

      <section v-if="intangibleDetail" class="block">
        <h2>非遗与传承</h2>
        <p class="prose">{{ intangibleDetail }}</p>
      </section>

      <div class="actions">
        <button type="button" class="btn primary" @click="collect">
          {{ collected ? '已收藏' : '收藏' }}
        </button>
        <button type="button" class="btn ghost" @click="share">分享</button>
      </div>
    </div>

    <div v-else class="not-found">
      <p>未找到该美食</p>
      <router-link to="/" class="link-home">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const dataStore = useDataStore()
const userStore = useUserStore()

const dishId = computed(() => String(route.params.id ?? ''))

const dish = computed(
  () => dataStore.dishes.find((d) => String(d.id) === dishId.value) || null
)

const province = computed(() => {
  if (!dish.value) return null
  return dataStore.provinces.find((p) => p.id === dish.value.provinceId) || null
})

const regionLine = computed(() => {
  if (!dish.value) return ''
  const p = province.value
  const prov = p?.name || dish.value.province || ''
  if (dish.value.city && prov) {
    return `${dish.value.city} · ${prov}`
  }
  if (dish.value.region) return dish.value.region
  return p ? `${p.name} · ${p.region}` : ''
})

const leadText = computed(() => {
  if (!dish.value) return ''
  return dish.value.cultural_meaning || dish.value.description || ''
})

const cuisineLabel = computed(
  () => province.value?.cuisine || dish.value?.region || '地方菜'
)

const historyList = computed(() => {
  const h = dish.value?.history
  if (!h) return []
  if (Array.isArray(h)) return h
  return [{ period: '沿革', record: String(h) }]
})

const poemText = computed(() => {
  const p = dish.value?.poem
  if (!p || typeof p !== 'object') return ''
  return p.content || ''
})

const poemSource = computed(() => {
  const p = dish.value?.poem
  if (!p || typeof p !== 'object') return ''
  const parts = [p.dynasty, p.author, p.source].filter(Boolean)
  return parts.join(' · ')
})

const intangibleLine = computed(() => {
  const i = dish.value?.intangible
  if (!i || typeof i !== 'object') return ''
  return i.level || ''
})

const intangibleDetail = computed(() => {
  const i = dish.value?.intangible
  if (!i || typeof i !== 'object') return ''
  const bits = []
  if (i.level) bits.push(`认定级别：${i.level}`)
  if (i.year) bits.push(`认定年份：${i.year}`)
  if (i.inheritor) bits.push(`传承：${i.inheritor}`)
  if (i.category) bits.push(`类别：${i.category}`)
  return bits.length ? bits.join('；') : ''
})

const collected = computed(() => {
  if (!userStore.isLoggedIn || !dish.value) return false
  return userStore.userInfo.collectedFoods.includes(dish.value.id)
})

const syncTitle = () => {
  document.title = dish.value ? `知味集 | ${dish.value.name}` : '知味集 | 美食详情'
}

watch(
  () => dish.value?.name,
  () => syncTitle(),
  { immediate: true }
)

onMounted(() => {
  dataStore.loadInitialData()
})

const goBack = () => {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

const onImgError = (e) => {
  const img = e.target
  img.onerror = null
  img.src = '/images/default-dish.jpg'
}

const collect = () => {
  if (!dish.value) return
  if (!userStore.isLoggedIn) {
    alert('请先登录后再收藏')
    return
  }
  const { ok, collected } = userStore.toggleCollectFood(dish.value.id)
  if (!ok) return
}

const share = () => {
  if (!dish.value) return
  const r = dish.value.city || province.value?.shortName || ''
  const text = `我在知味集发现了「${dish.value.name}」，来自${r || '中华'}的${cuisineLabel.value}。`
  const url = window.location.href
  if (navigator.share) {
    navigator.share({ title: dish.value.name, text, url })
  } else {
    navigator.clipboard.writeText(`${text} ${url}`)
    alert('链接与文案已复制')
  }
}
</script>

<style scoped>
.dish-detail-page {
  width: 100%;
  max-width: min(720px, 100%);
  margin: 0 auto;
}

.detail-inner {
  padding-bottom: 32px;
}

.back-btn {
  margin-bottom: 16px;
  padding: 8px 0;
  border: none;
  background: none;
  color: #2a6ebb;
  font-size: 15px;
  cursor: pointer;
}

.back-btn:hover {
  text-decoration: underline;
}

.detail-media {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  background: transparent;
}

.hero-img {
  display: block;
  width: 100%;
  height: clamp(200px, 36vh, 320px);
  object-fit: contain;
  object-position: center;
}

.region-band {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f5f1e8, #e8f0f8);
}

.region-band .label {
  font-size: 12px;
  font-weight: 700;
  color: #8b4513;
}

.region-band .value {
  font-size: 15px;
  font-weight: 600;
  color: #2c2c2c;
}

.title {
  font-size: clamp(1.5rem, 4vw, 2rem);
  color: #2c2c2c;
  margin: 0 0 12px;
}

.lead {
  color: #555;
  line-height: 1.75;
  margin: 0 0 20px;
  font-size: 15px;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.meta-item {
  padding: 12px 14px;
  background: #f9f9f9;
  border-radius: 10px;
}

.meta-item.meta-span-2 {
  grid-column: 1 / -1;
}

.meta-item .k {
  display: block;
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}

.meta-item .v {
  font-size: 15px;
  font-weight: 600;
  color: #2c2c2c;
}

.meta-item .v.flavor-text {
  font-weight: 500;
  font-size: 14px;
  line-height: 1.5;
}

.block {
  margin-bottom: 22px;
}

.block h2 {
  font-size: 16px;
  color: #c23b22;
  margin: 0 0 10px;
}

.history-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.history-list li {
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid #eee;
}

.history-list li:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.history-list .period {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  color: #8b4513;
  margin-bottom: 6px;
}

.history-list .record {
  margin: 0;
  color: #555;
  line-height: 1.75;
  font-size: 14px;
}

.poem-block .poem-quote {
  margin: 0;
  padding: 14px 16px;
  background: #faf7f0;
  border-left: 4px solid #c23b22;
  font-size: 15px;
  line-height: 1.8;
  color: #3a3026;
}

.poem-source {
  margin: 8px 0 0;
  font-size: 13px;
  color: #888;
}

.prose {
  margin: 0;
  color: #555;
  line-height: 1.75;
  font-size: 14px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  font-size: 13px;
  padding: 4px 10px;
  background: #f0f7ff;
  color: #2a6ebb;
  border-radius: 999px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 28px;
}

.btn {
  flex: 1;
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn.primary {
  background: transparent;
  color: rgba(26, 24, 22, 0.9);
  border: 2px solid rgba(0, 0, 0, 0.72);
}

.btn.ghost {
  background: transparent;
  color: rgba(26, 24, 22, 0.9);
  border: 2px solid rgba(0, 0, 0, 0.72);
}

.btn:hover {
  background: rgba(255, 255, 255, 0.18);
}

.not-found {
  text-align: center;
  padding: 48px 20px;
  color: #888;
}

.link-home {
  display: inline-block;
  margin-top: 16px;
  color: #2a6ebb;
}
</style>
