<template>
  <div :class="['term-detail', seasonClass]">
    <div class="term-header">
      <div class="term-title">
        <h2>{{ term.name }}</h2>
        <p class="term-english">{{ term.englishName }}</p>
      </div>
      <div class="term-date">
        <i class="el-icon-date"></i>
        {{ term.date }}
      </div>
    </div>

    <div class="term-main">
      <!-- 左栏：节气美食实践 -->
      <div class="left-panel">
        <div class="section-card">
          <h3>南北节气美食对照</h3>
          <div class="region-grid">
            <div class="region-block">
              <h4>北方代表</h4>
              <div v-for="food in term.northFoods || []" :key="food.id || food.name" class="food-card" @click="openDishDetail(food)">
                <div>
                  <strong>{{ food.name }}</strong>
                  <p>{{ food.description }}</p>
                </div>
              </div>
            </div>
            <div class="region-block">
              <h4>南方代表</h4>
              <div v-for="food in term.southFoods || []" :key="food.id || food.name" class="food-card" @click="openDishDetail(food)">
                <div>
                  <strong>{{ food.name }}</strong>
                  <p>{{ food.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="section-card">
          <h3>养生饮食建议</h3>
          <p>{{ term.healthTip }}</p>
        </div>
      </div>

      <!-- 右栏：节气文化知识 -->
      <div class="right-panel">
        <div class="section-card">
          <h3>节气文化</h3>
          <ul>
            <li><strong>哲学意涵：</strong> {{ term.philosophy || '暂无内容' }}</li>
            <li><strong>农事活动：</strong> {{ term.farming }}</li>
            <li><strong>诗词意象：</strong> {{ term.poetry || '暂无内容' }}</li>
            <li><strong>现代传承：</strong> {{ term.modern || '暂无内容' }}</li>
          </ul>
        </div>

        <div class="section-card">
          <h3>非遗小贴士</h3>
          <el-collapse v-model:active-name="activeNonheritage">
            <el-collapse-item :title="term.heritageTitle || '节气非遗'" name="1">
              <div>{{ term.heritageTip || '暂无非遗小贴士内容。' }}</div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </div>

    <div class="term-actions">
      <el-button type="success" @click="toggleFavorite">
        {{ isFavorited ? '取消收藏' : '收藏节气' }}
      </el-button>
      <el-button type="success" @click="shareTerm">分享节气</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'

const props = defineProps({
  term: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['search', 'view-dishes'])

const dataStore = useDataStore()
const router = useRouter()
const activeNonheritage = ref(['1'])

const seasonClass = computed(() => {
  const name = props.term.name
  if (['立春', '雨水', '惊蛰', '春分', '清明', '谷雨'].includes(name)) return 'spring'
  if (['立夏', '小满', '芒种', '夏至', '小暑', '大暑'].includes(name)) return 'summer'
  if (['立秋', '处暑', '白露', '秋分', '寒露', '霜降'].includes(name)) return 'autumn'
  return 'winter'
})

const openDishDetail = (food) => {
  const target = dataStore.dishes.find(
    (d) => d.name === food.name || String(d.id) === String(food.id)
  )
  if (target) {
    dataStore.selectDish(target)
    router.push('/map')
  } else {
    alert(`暂无 ${food.name} 的详细页面，请先补充菜品数据`) 
  }
}

const shareTerm = async () => {
  const t = props.term
  const text = `我在知味集阅读「${t?.name || '二十四节气'}」：${t?.englishName || ''}`.trim()
  const url = window.location.href
  const payload = `${text}\n${url}`

  try {
    if (navigator.share) {
      await navigator.share({ title: t?.name || '二十四节气', text, url })
      return
    }
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(payload)
      return
    }
  } catch {
    // ignore
  }

  // 兜底：避免完全无反馈
  window.prompt('复制以下内容分享：', payload)
}

const isFavorited = computed(() => dataStore.isSolarTermFavorite(props.term))

const toggleFavorite = () => {
  dataStore.toggleFavoriteSolarTerm(props.term)
}

const viewRelatedDishes = () => {
  const byCategory = dataStore.dishes.filter(
    (d) => String(d.category || '').trim() === String(props.term.name || '').trim()
  )
  const related = byCategory.length
    ? byCategory
    : dataStore.dishes.filter(
      (d) =>
        (props.term.northFoods || []).some((f) => f.name === d.name) ||
          (props.term.southFoods || []).some((f) => f.name === d.name)
    )
  emit('view-dishes', related)
}
</script>

<style scoped>
.term-detail {
  border-radius: 12px;
  color: #333;
}

.term-detail.spring { background: linear-gradient(120deg, #e9f8f4 0%, #f4fff8 100%); }
.term-detail.summer { background: linear-gradient(120deg, #fff8e9 0%, #fff3df 100%); }
.term-detail.autumn { background: linear-gradient(120deg, #fef3e4 0%, #fff4eb 100%); }
.term-detail.winter { background: linear-gradient(120deg, #edf3fc 0%, #f3f6ff 100%); }

.term-main {
  display: flex;
  gap: 20px;
}

.left-panel,
.right-panel {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 10px;
  padding: 16px;
}

.left-panel {
  flex: 2;
}

.right-panel {
  flex: 1;
}

.section-card {
  margin-bottom: 16px;
  background: white;
  border-radius: 10px;
  padding: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section-card h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #305c82;
}

.region-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.region-block h4 {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #4f6f92;
}

.food-card {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  padding: 8px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
}

.food-card strong {
  font-size: 14px;
}

.food-card p {
  margin: 2px 0 0 0;
  color: #666;
  font-size: 12px;
}

:deep(.el-collapse-item__content) {
  font-size: 14px;
  color: #444;
}

.term-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.term-title h2 {
  margin: 0 0 4px 0;
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.term-english {
  margin: 0;
  font-size: 16px;
  color: #999;
  font-style: italic;
}

.term-date {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  background: #f5f7fa;
  padding: 8px 12px;
  border-radius: 6px;
}

.term-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}
</style>
