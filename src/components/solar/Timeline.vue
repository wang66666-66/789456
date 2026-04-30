<template>
  <div class="solar-timeline">
    <div class="timeline-header">
      <h3>二十四节气时间线</h3>
      <div class="timeline-controls">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button label="grid">网格视图</el-radio-button>
          <el-radio-button label="list">列表视图</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 横向时间轴 -->
    <div v-if="viewMode === 'grid'" class="timeline-scroll">
      <div v-if="solarTerms.length === 0" class="no-data">
        <p>正在加载节气数据...</p>
      </div>
      <div class="timeline-items">
        <div
          v-for="term in solarTerms"
          :key="term.id"
          class="term-node"
          :class="{ active: isCurrentTerm(term), past: isPastTerm(term) }"
          @click="selectTerm(term)"
        >
          <div class="node-name">{{ term.name }}</div>
          <div class="node-date">{{ term.date }}</div>
          <div v-if="isCurrentTerm(term)" class="current-indicator">
            当前
          </div>
        </div>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-else class="timeline-list">
      <div v-if="solarTerms.length === 0" class="no-data">
        <p>正在加载节气数据...</p>
      </div>
      <div class="timeline-container">
        <div
          v-for="(term, index) in solarTerms"
          :key="term.id"
          class="timeline-item"
          :class="{ active: isCurrentTerm(term), past: isPastTerm(term) }"
          @click="selectTerm(term)"
        >
          <div class="timeline-marker">
            <div class="marker-dot" :class="{ current: isCurrentTerm(term) }"></div>
            <div v-if="index < solarTerms.length - 1" class="timeline-line"></div>
          </div>
          <div class="timeline-content">
            <div class="term-header">
              <h4>{{ term.name }}</h4>
              <span class="term-date">{{ term.date }}</span>
            </div>
            <p class="term-description">{{ term.description }}</p>
            <div class="term-foods">
              <span>饮食：</span>
              <el-tag
                v-for="food in term.foods.slice(0, 2)"
                :key="food"
                size="mini"
                type="success"
              >
                {{ food }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDataStore } from '@/stores/data'

const props = defineProps({
  selectedTerm: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['select'])

const dataStore = useDataStore()
const viewMode = ref('grid')

// 节气数据
const solarTerms = computed(() => dataStore.solarTerms)

const activeTermId = computed(() => {
  return props.selectedTerm?.id || dataStore.currentSolarTerm?.id || (solarTerms.value[0] && solarTerms.value[0].id)
})

// 判断是否是当前节气
const isCurrentTerm = (term) => {
  return activeTermId.value === term.id
}

// 判断是否是过去的节气
const isPastTerm = (term) => {
  if (!dataStore.currentSolarTerm) return false
  return term.id < dataStore.currentSolarTerm.id
}

// 选择节气
const selectTerm = (term) => {
  dataStore.selectSolarTerm(term)
  emit('select', term)
}

onMounted(() => {
  // 滚动到当前/选中节气
  setTimeout(() => {
    const currentElement = document.querySelector('.term-node.active') || document.querySelector('.timeline-item.active')
    if (currentElement) {
      currentElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, 400)
})

watch([solarTerms, activeTermId], () => {
  // Re-center after data is ready or selection changed
  setTimeout(() => {
    const currentElement = document.querySelector('.term-node.active') || document.querySelector('.timeline-item.active')
    if (currentElement) {
      currentElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, 150)
})
</script>

<style scoped>
.solar-timeline {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.timeline-header h3 {
  margin: 0;
  color: #333;
}

.timeline-controls {
  display: flex;
  gap: 12px;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
}

.timeline-scroll {
  overflow-x: auto;
  padding: 10px 0;
  border-radius: 12px;
  background: linear-gradient(120deg, #f7f6f2 0%, #d1e7f6 100%);
  margin-bottom: 20px;
}

.timeline-items {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: max-content;
  padding: 10px;
}

.term-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 130px;
  min-height: 90px;
  position: relative;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 10px;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.25s ease, background-color 0.25s ease;
}

.term-node:hover {
  border-color: #67c23a;
}

.term-node.active {
  border-color: #f56c6c;
  background: #fff5f5;
  box-shadow: 0 0 14px rgba(245, 108, 108, 0.3);
  padding-top: 26px;
}

.term-node.past {
  opacity: 0.7;
}

.node-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.node-date {
  font-size: 12px;
  color: #888;
}

.current-indicator {
  position: absolute;
  top: 6px;
  right: 8px;
  background: #fff5f5;
  color: #d66a6a;
  border: 1px solid #f4d5d5;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  line-height: 1.2;
  font-weight: 700;
}

/* 列表视图 */
.timeline-list {
  max-height: 600px;
  overflow-y: auto;
}

.timeline-container {
  position: relative;
}

.timeline-item {
  display: flex;
  margin-bottom: 24px;
  position: relative;
}

.timeline-marker {
  position: relative;
  width: 20px;
  margin-right: 16px;
}

.marker-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e4e7ed;
  margin: 0 auto;
}

.marker-dot.current {
  background: #67c23a;
  box-shadow: 0 0 0 4px rgba(103, 194, 58, 0.2);
}

.timeline-line {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: calc(100% + 24px);
  background: #e4e7ed;
}

.timeline-content {
  flex: 1;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.timeline-content:hover {
  background: #f0f9ff;
  border: 1px solid #67c23a;
}

.timeline-item.active .timeline-content {
  background: #f0f9ff;
  border: 1px solid #67c23a;
}

.term-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.term-header h4 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.term-date {
  font-size: 14px;
  color: #999;
}

.term-description {
  margin: 8px 0;
  color: #666;
  line-height: 1.5;
}

.term-foods {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.term-foods span {
  color: #999;
}
</style>