<template>
  <div class="solar-term-page">
    <div class="page-header">
      <h1>二十四节气美食</h1>
      <p>跟随自然的节奏，品味时令美食</p>
    </div>

    <!-- 节气时间轴 -->
    <div class="timeline-section">
      <Timeline
        :selected-term="selectedSolarTerm"
        @select="handleTermSelect"
      />
    </div>

    <div v-if="solarTerms.length === 0" class="no-data">
      <p>正在加载节气数据...</p>
    </div>

    <!-- 节气详情 -->
    <div v-if="selectedSolarTerm" class="detail-section">
      <TermDetail
        :key="selectedSolarTerm.id"
        :term="selectedSolarTerm"
        @search="handleFoodSearch"
        @view-dishes="handleViewDishes"
      />
    </div>

    <div v-if="selectedSolarTerm" class="related-section">
      <h3>{{ selectedSolarTerm?.name }} · 相关美食</h3>
      <div v-if="relatedDishes.length" class="related-grid">
        <article
          v-for="dish in relatedDishes"
          :key="dish.id"
          class="related-card"
          @click="openDish(dish)"
        >
          <h4 class="related-title">{{ dish.name }}</h4>
          <p class="related-meta">{{ dish.region || dish.city || '地方风味' }}</p>
        </article>
      </div>
      <p v-else class="related-empty">当前节气暂无匹配美食</p>
    </div>

    <!-- 默认提示 -->
    <div v-if="!selectedSolarTerm" class="empty-state">
      <h3>选择一个节气</h3>
      <p>点击上面的时间线选择您感兴趣的节气</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import Timeline from '@/components/solar/Timeline.vue'
import TermDetail from '@/components/solar/TermDetail.vue'

const dataStore = useDataStore()
const router = useRouter()
const relatedDishes = ref([])

// 计算属性
const solarTerms = computed(() => dataStore.solarTerms)
const selectedSolarTerm = computed(() => dataStore.selectedSolarTerm)
const normalizeName = (v) => String(v || '').trim()

const resolveRelatedDishes = (term) => {
  if (!term?.name) return []
  const termName = normalizeName(term.name)
  const byCategory = dataStore.dishes.filter((d) => normalizeName(d.category) === termName)
  if (byCategory.length) return byCategory
  return dataStore.dishes.filter(
    (d) =>
      (term.northFoods || []).some((f) => normalizeName(f.name) === normalizeName(d.name)) ||
      (term.southFoods || []).some((f) => normalizeName(f.name) === normalizeName(d.name))
  )
}

// 页面加载
onMounted(async () => {
  // 加载数据
  await dataStore.loadInitialData()

  // 如果有当前节气，自动选中
  if (dataStore.currentSolarTerm) {
    dataStore.selectSolarTerm(dataStore.currentSolarTerm)
  } else if (solarTerms.value.length > 0) {
    dataStore.selectSolarTerm(solarTerms.value[0])
  }
  relatedDishes.value = resolveRelatedDishes(dataStore.selectedSolarTerm)
})

// 处理节气选择
const handleTermSelect = (term) => {
  dataStore.selectSolarTerm(term)
  relatedDishes.value = resolveRelatedDishes(term)
}

// 处理美食搜索
const handleFoodSearch = (foodName) => {
  dataStore.search(foodName)
  // 可以跳转到搜索结果页面
}

// 处理查看相关美食
const handleViewDishes = (dishes) => {
  relatedDishes.value = Array.isArray(dishes) ? dishes : []
}

watch(
  () => selectedSolarTerm.value?.id,
  (term) => {
    relatedDishes.value = resolveRelatedDishes(selectedSolarTerm.value)
  }
)

const openDish = (dish) => {
  if (!dish?.id) return
  dataStore.selectDish(dish)
  router.push(`/dish/${dish.id}`)
}
</script>

<style scoped>
.solar-term-page {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: clamp(8px, 1.5vw, 16px) 0;
  box-sizing: border-box;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: clamp(1.25rem, 3.5vw + 0.5rem, 2rem);
}

.page-header p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.timeline-section {
  margin-bottom: 40px;
}

.detail-section {
  margin-bottom: 40px;
}

.related-section {
  margin-bottom: 36px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 18px;
}

.related-section h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #333;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.related-card {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 12px;
  background: #fafafa;
  cursor: pointer;
}

.related-card:hover {
  border-color: #67c23a;
  background: #f7fff2;
}

.related-title {
  margin: 0 0 6px 0;
  font-size: 15px;
  color: #2f2f2f;
}

.related-meta {
  margin: 0;
  font-size: 12px;
  color: #777;
}

.related-empty {
  margin: 0;
  color: #888;
  font-size: 14px;
}

.no-data {
  text-align: center;
  padding: 28px 16px;
  color: #999;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.empty-state h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.empty-state p {
  margin: 0;
  color: #666;
}
</style>