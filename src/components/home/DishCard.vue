<template>
  <div class="dish-card" @click="handleClick">
    <div class="dish-top">
      <div class="dish-image">
        <img :src="dish.image" :alt="dish.name" @error="handleImageError" />
        <div class="dish-overlay">
          <div v-if="dish.difficulty" class="dish-difficulty">{{ dish.difficulty }}</div>
        </div>
      </div>
      <div class="dish-region">{{ regionLine }}</div>
    </div>
    <div class="dish-info">
      <h3 class="dish-name">{{ dish.name }}</h3>
      <p class="dish-description">{{ cardDescription }}</p>
      <div class="dish-flavor-row">
        <span class="flavor-label">口味描述</span>
        <span class="flavor-value">{{ flavorShort }}</span>
      </div>
      <div class="dish-meta">
        <span v-if="dish.city" class="meta-city">
          <i class="el-icon-location"></i>
          {{ dish.city }}
        </span>
        <span v-if="dish.cookingTime != null" class="cooking-time">
          <i class="el-icon-time"></i>
          {{ dish.cookingTime }}分钟
        </span>
        <span class="ingredients-count">
          <i class="el-icon-food"></i>
          {{ dish.ingredients?.length ?? 0 }}种食材
        </span>
      </div>
      <div v-if="dish.ingredients?.length" class="dish-tags">
        <el-tag
          v-for="ingredient in dish.ingredients.slice(0, 3)"
          :key="ingredient"
          size="small"
          type="info"
        >
          {{ ingredient }}
        </el-tag>
        <el-tag v-if="dish.ingredients.length > 3" size="small" type="info">
          +{{ dish.ingredients.length - 3 }}
        </el-tag>
      </div>
    </div>
    <div class="dish-actions">
      <el-button
        type="primary"
        size="small"
        @click.stop="collectDish"
        :disabled="isCollected"
      >
        <i class="el-icon-star-off"></i>
        {{ isCollected ? '已收藏' : '收藏' }}
      </el-button>
      <el-button type="link" size="small" @click.stop="viewDetail">
        详情
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()

const props = defineProps({
  dish: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['select'])

const dataStore = useDataStore()
const userStore = useUserStore()

const cardDescription = computed(() => {
  const d = props.dish
  return d.description || d.cultural_meaning || ''
})

const flavorShort = computed(() => {
  const f = String(props.dish.flavor || '').trim()
  if (!f) return '地方风味'
  return f.length > 14 ? `${f.slice(0, 14)}…` : f
})

const regionLine = computed(() => {
  const d = props.dish
  const p = dataStore.provinces.find((x) => x.id === d.provinceId)
  const provName = p?.name || d.province || ''
  if (d.city && provName) {
    return `${d.city} · ${provName}`
  }
  if (d.region) {
    return `所属区域 · ${d.region}`
  }
  if (p) {
    return `所属区域 · ${p.name}（${p.region}）`
  }
  return '所属区域 · 中国'
})

const isCollected = computed(() => {
  return (
    userStore.isLoggedIn &&
    userStore.userInfo.collectedFoods.includes(props.dish.id)
  )
})

const handleClick = () => {
  dataStore.selectDish(props.dish)
  emit('select', props.dish)
}

const collectDish = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  const success = userStore.collectFood(props.dish.id)
  if (success) {
    ElMessage.success('收藏成功！')
  } else {
    ElMessage.info('已经收藏过了')
  }
}

const viewDetail = () => {
  router.push({ name: 'dish-detail', params: { id: String(props.dish.id) } })
}

const handleImageError = (event) => {
  const img = event.target
  img.onerror = null
  img.src = '/images/dishes/default.jpg'
}
</script>

<style scoped>
.dish-card {
  /* 与底部导航栏一致：透明底 + 细边框 */
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.10);
  border-radius: 12px;
  box-shadow: none;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.dish-top {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.dish-image {
  position: relative;
  height: clamp(140px, 22vh, 220px);
  min-height: 140px;
  overflow: hidden;
  flex-shrink: 0;
  background: transparent;
}

.dish-region {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: rgba(26, 24, 22, 0.82);
  text-align: center;
  background: transparent;
  border-top: 1px solid rgba(0, 0, 0, 0.10);
  border-bottom: 1px solid rgba(0, 0, 0, 0.10);
}

.dish-flavor-row {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  padding: 8px 10px;
  border: 1px solid rgba(0, 0, 0, 0.10);
  border-radius: 8px;
  background: transparent;
}

.flavor-label {
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.62);
}

.flavor-value {
  min-width: 0;
  font-size: 12px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.78);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dish-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

.dish-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.dish-difficulty {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  max-width: 12em;
  text-align: right;
  line-height: 1.3;
}

.dish-difficulty {
  background: #e6a23c;
}

.dish-info {
  padding: 16px;
}

.dish-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.dish-description {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dish-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #999;
}

.dish-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dish-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dish-actions {
  padding: 12px 16px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.10);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dish-actions :deep(.el-button) {
  transition: box-shadow 0.3s ease;
}

.dish-actions :deep(.el-button:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
