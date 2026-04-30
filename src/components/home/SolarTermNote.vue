<template>
  <div class="solar-term-note">
    <header class="note-header">
      <span class="note-badge">今日节气食笺</span>
      <router-link to="/solar-term" class="note-more">二十四节气 →</router-link>
    </header>

    <div v-if="currentSolarTerm" class="note-body">
      <div class="note-main">
        <div class="term-row">
          <div>
            <h3 class="term-title">{{ currentSolarTerm.name }}</h3>
            <p class="term-date">{{ currentSolarTerm.date }}</p>
          </div>
        </div>
        <p class="term-desc">{{ currentSolarTerm.description }}</p>
        <div class="health-tip">
          <span class="tip-label">养生建议：</span>
          <span>{{ currentSolarTerm.healthTip }}</span>
        </div>
      </div>

      <div class="note-side">
        <h4 class="side-title">时令推荐</h4>
        <div v-if="recommendedFoods.length" class="food-list">
          <button
            v-for="food in recommendedFoods"
            :key="food.id"
            type="button"
            class="food-tag"
            @click="goDish(food.id)"
          >
            {{ food.name }}
          </button>
        </div>
        <p v-else class="no-food">暂无推荐，敬请期待</p>

        <div v-if="nextSolarTermInfo?.term" class="countdown">
          距 <strong>{{ nextSolarTermInfo.term.name }}</strong>
          <span class="countdown-num">{{ countdownText }}</span>
        </div>
      </div>
    </div>

    <div v-else class="note-loading">
      <p>正在载入节气与食笺…</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'

const router = useRouter()
const dataStore = useDataStore()

const currentSolarTerm = computed(() => {
  return (
    dataStore.currentSolarTerm ||
    (dataStore.solarTerms?.length ? dataStore.solarTerms[0] : null)
  )
})

const normalizeName = (v) => String(v || '').trim()

const recommendedFoods = computed(() => {
  const term = currentSolarTerm.value
  if (!term?.name) return []

  const termName = normalizeName(term.name)
  const byCategory = dataStore.dishes.filter((d) => normalizeName(d.category) === termName)
  if (byCategory.length) return byCategory

  return dataStore.dishes.filter(
    (d) =>
      (term.northFoods || []).some((f) => normalizeName(f.name) === normalizeName(d.name)) ||
      (term.southFoods || []).some((f) => normalizeName(f.name) === normalizeName(d.name))
  )
})

const countdownText = ref('')

const parseDateFromTerm = (term) => {
  if (!term?.date) return null
  const startStr = term.date.split('-')[0].trim()
  const parts = startStr.split('/')
  if (parts.length !== 2) return null
  const month = Number(parts[0])
  const day = Number(parts[1])
  if (Number.isNaN(month) || Number.isNaN(day)) return null
  return { month, day }
}

const nextSolarTermInfo = computed(() => {
  const terms = dataStore.solarTerms || []
  if (!terms.length) return null

  const now = new Date()
  const candidates = terms
    .map((term) => {
      const d = parseDateFromTerm(term)
      if (!d) return null
      let target = new Date(now.getFullYear(), d.month - 1, d.day, 0, 0, 0)
      if (target <= now) {
        target = new Date(now.getFullYear() + 1, d.month - 1, d.day, 0, 0, 0)
      }
      return { term, target }
    })
    .filter(Boolean)
    .sort((a, b) => a.target - b.target)

  return candidates[0] || null
})

const updateCountdown = () => {
  const info = nextSolarTermInfo.value
  if (!info?.target) {
    countdownText.value = '—'
    return
  }
  const now = new Date()
  const diff = info.target - now
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  countdownText.value = `${days}天${hours}时${minutes}分${seconds}秒`
}

const goDish = (foodId) => {
  if (foodId == null) return
  router.push({ name: 'dish-detail', params: { id: String(foodId) } })
}

let timer = null
onMounted(() => {
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style scoped>
.solar-term-note {
  /* 与底部导航栏一致：透明底 + 必要框线 */
  background: transparent;
  border-radius: 18px;
  box-shadow: none;
  border: 2px solid rgba(0, 0, 0, 0.72);
  overflow: hidden;
  backdrop-filter: none;
}

.note-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: transparent;
  color: rgba(26, 24, 22, 0.88);
  border-bottom: 2px solid rgba(0, 0, 0, 0.72);
}

.note-badge {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.note-more {
  font-size: 13px;
  color: rgba(26, 24, 22, 0.72);
  text-decoration: none;
  font-weight: 800;
}

.note-more:hover {
  text-decoration: underline;
}

.note-body {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(220px, 0.85fr);
  gap: clamp(16px, 3vw, 28px);
  padding: clamp(18px, 2.5vw, 26px);
}

.note-main {
  min-width: 0;
}

.term-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.term-title {
  margin: 0 0 4px;
  font-size: 1.35rem;
  color: #2a6ebb;
}

.term-date {
  margin: 0;
  font-size: 14px;
  color: rgba(26, 24, 22, 0.72);
}

.term-desc {
  margin: 0 0 12px;
  color: rgba(26, 24, 22, 0.76);
  line-height: 1.65;
  font-size: 14px;
}

.health-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  background: transparent;
  border: 2px solid rgba(0, 0, 0, 0.60);
  border-radius: 10px;
  font-size: 13px;
  color: #2c2c2c;
}

.tip-label {
  font-weight: 700;
  color: #8b4513;
  white-space: nowrap;
}

.note-side {
  border-left: 2px solid rgba(0, 0, 0, 0.72);
  padding-left: clamp(16px, 2.5vw, 24px);
  min-width: 0;
}

.side-title {
  margin: 0 0 10px;
  font-size: 14px;
  color: #8b4513;
}

.food-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.food-tag {
  font-size: 13px;
  padding: 6px 12px;
  background: transparent;
  color: rgba(26, 24, 22, 0.78);
  border: 2px solid rgba(0, 0, 0, 0.55);
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.food-tag:hover {
  background: rgba(255, 255, 255, 0.18);
  color: rgba(26, 24, 22, 0.95);
}

.no-food {
  font-size: 13px;
  color: #999;
  margin-bottom: 12px;
}

.countdown {
  font-size: 13px;
  color: rgba(26, 24, 22, 0.78);
  padding: 10px 12px;
  background: transparent;
  border-radius: 8px;
  border: 2px solid rgba(0, 0, 0, 0.60);
}

.countdown-num {
  display: block;
  margin-top: 6px;
  font-weight: 700;
  color: #2a6ebb;
  font-variant-numeric: tabular-nums;
}

.note-loading {
  padding: 32px 20px;
  text-align: center;
  color: #888;
}

@media (max-width: 900px) {
  .note-body {
    grid-template-columns: 1fr;
  }

  .note-side {
    border-left: none;
    padding-left: 0;
    border-top: 2px solid rgba(0, 0, 0, 0.72);
    padding-top: 16px;
  }
}
</style>
