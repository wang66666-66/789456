<template>
  <div class="home-page">
    <div class="page-header">
      <h1>中华美食文化地图</h1>
      <p>探索中国各地的传统美食与文化故事</p>
    </div>
    
    <div class="map-layout-three">
      <aside class="browse-panel">
        <div class="browse-card">
          <div class="browse-header">
            <h2>省级行政区 · 菜系</h2>
            <p>34 省区市 · 点击与地图、右侧联动</p>
          </div>
          <div class="browse-body">
            <template v-for="region in regionKeys" :key="region">
              <div v-if="provincesByRegion[region]?.length" class="region-group">
                <h3 class="region-heading">{{ region }}</h3>
                <ul class="province-list">
                  <li
                    v-for="p in provincesByRegion[region]"
                    :key="p.id"
                    class="province-item"
                    :class="{ active: selectedProvince?.id === p.id }"
                    @click="pickProvince(p)"
                  >
                    <span class="province-name">{{ p.shortName }}</span>
                    <span class="province-cuisine">{{ p.cuisine }}</span>
                  </li>
                </ul>
              </div>
            </template>
          </div>
        </div>
      </aside>

      <section class="map-center" aria-label="美食地图">
        <div class="map-container">
          <ChinaMap />
        </div>
        <blockquote class="map-center-verse" lang="zh-CN">
          <p>一图展卷山河味，</p>
          <p>四时流转箸尖知。</p>
          <p>AI解语千年馔，</p>
          <p>烟火人间共此诗。</p>
        </blockquote>
      </section>

      <aside class="dishes-panel">
        <div v-if="selectedProvince" class="info-panel">
          <div class="panel-header">
            <h3>{{ selectedProvince.shortName }} · {{ selectedProvince.cuisine }}</h3>
            <p v-if="selectedCity">{{ selectedProvince.name }} · {{ selectedCity }} · 代表美食</p>
            <p v-else>{{ selectedProvince.name }} · 代表美食</p>
          </div>
          <div class="panel-content dishes-scroll">
            <div v-if="provinceDishes.length > 0" class="dish-grid">
              <DishCard
                v-for="dish in provinceDishes"
                :key="dish.id"
                :dish="dish"
                @select="dataStore.selectDish"
              />
            </div>
            <div v-else class="empty-dishes">
              <p v-if="selectedCity">该地级市暂未录入对应美食，请点击其它红点继续查看。</p>
              <p v-else>该省暂未录入代表美食，请稍后再试或浏览已收录省份（当前数据以湖北省为主）。</p>
            </div>
          </div>
        </div>

        <div v-else class="info-panel default-panel">
          <div class="panel-header">
            <h3>代表美食</h3>
            <p>请先在左侧或地图选择省份</p>
          </div>
          <div class="panel-content">
            <div class="welcome-content">
              <h4>尚未选择省份</h4>
              <p>左侧按大区浏览 34 个省级行政区及对应菜系，或在地图中点击省界。</p>
              <div class="cuisine-tags">
                <span class="cuisine-tag">川菜</span>
                <span class="cuisine-tag">粤菜</span>
                <span class="cuisine-tag">苏菜</span>
                <span class="cuisine-tag">鲁菜</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <section class="solar-note-section" aria-label="今日节气食笺">
      <SolarTermNote />
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDataStore } from '@/stores/data'
import ChinaMap from '@/components/home/ChinaMap.vue'
import DishCard from '@/components/home/DishCard.vue'
import SolarTermNote from '@/components/home/SolarTermNote.vue'

const dataStore = useDataStore()

const REGION_ORDER = ['华北', '东北', '华东', '华中', '华南', '西南', '西北', '港澳台']

const provincesByRegion = computed(() => {
  const m = {}
  for (const p of dataStore.provinces) {
    const r = p.region || '其他'
    if (!m[r]) m[r] = []
    m[r].push(p)
  }
  for (const k of Object.keys(m)) {
    m[k].sort((a, b) =>
      String(a.shortName || '').localeCompare(String(b.shortName || ''), 'zh-CN')
    )
  }
  return m
})

const regionKeys = computed(() => {
  const keys = Object.keys(provincesByRegion.value)
  const ordered = REGION_ORDER.filter((k) => keys.includes(k))
  const rest = keys.filter((k) => !REGION_ORDER.includes(k)).sort()
  return [...ordered, ...rest]
})

const provinceDishes = computed(() => {
  if (!dataStore.selectedProvince) return []
  const inProvince = dataStore.dishes.filter(
    (dish) => dish.provinceId === dataStore.selectedProvince.id
  )
  if (!dataStore.selectedCity) return inProvince
  return inProvince.filter((dish) => dish.city === dataStore.selectedCity)
})

const selectedProvince = computed(() => dataStore.selectedProvince)
const selectedCity = computed(() => dataStore.selectedCity)

const pickProvince = (province) => {
  dataStore.selectProvince(province)
}
</script>

<style scoped>
.home-page {
  width: 100%;
  min-width: 0;
}

.page-header {
  text-align: center;
  margin-bottom: clamp(16px, 3vw, 30px);
}

.page-header h1 {
  font-size: clamp(1.35rem, 4vw + 0.5rem, 2.25rem);
  background: linear-gradient(135deg, #2A6EBB, #8B4513);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
}

.page-header p {
  color: #666;
  font-size: clamp(14px, 1.8vw, 16px);
}

.solar-note-section {
  margin-top: clamp(12px, 2vh, 24px);
  padding-top: clamp(18px, 2.8vh, 32px);
  border-top: 1px solid rgba(42, 110, 187, 0.14);
}

.map-layout-three {
  width: 100%;
  min-width: 0;
  margin-bottom: 0;
  display: grid;
  grid-template-columns: minmax(148px, 0.58fr) minmax(0, 1.82fr) minmax(188px, 0.72fr);
  gap: clamp(8px, 1vw, 14px);
  align-items: stretch;
}

.browse-panel,
.dishes-panel {
  position: sticky;
  top: 78px;
  max-height: calc(100vh - 88px);
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(10px, 1.5vw, 16px);
  min-height: 0;
}

.browse-card {
  /* 与底部导航栏一致：透明底 + 必要框线 */
  background: transparent;
  border: 2px solid rgba(0, 0, 0, 0.72);
  border-radius: 18px;
  box-shadow: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
  max-height: 100%;
  backdrop-filter: none;
}

.browse-header {
  padding: 16px 14px;
  background: transparent;
  color: rgba(26, 24, 22, 0.9);
  border-bottom: 2px solid rgba(0, 0, 0, 0.72);
  flex-shrink: 0;
}

.browse-header h2 {
  margin: 0 0 4px;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.25;
}

.browse-header p {
  margin: 0;
  font-size: 12px;
  opacity: 1;
  line-height: 1.4;
  color: rgba(26, 24, 22, 0.72);
}

.browse-body {
  padding: 12px 10px 14px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.region-group:first-child .region-heading {
  margin-top: 0;
}

.region-heading {
  margin: 12px 6px 6px;
  font-size: 11px;
  font-weight: 700;
  color: #888;
  letter-spacing: 0.06em;
}

.province-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.province-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  border: 1px solid transparent;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.province-item:hover {
  background: rgba(255, 255, 255, 0.18);
}

.province-item.active {
  background: rgba(255, 255, 255, 0.24);
  border-color: rgba(0, 0, 0, 0.22);
}

.province-name {
  font-weight: 600;
  color: #2c2c2c;
}

.province-cuisine {
  font-size: 11px;
  color: #8b4513;
  flex-shrink: 0;
}

.map-center {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.map-container {
  width: 100%;
  max-width: min(980px, 100%);
  margin: 0 auto;
  /* 地图容器半透白：让水墨背景隐约透出 */
  /* 这里接近不透明：避免透出 body 的 map.jpg（只保留水墨装饰层） */
  background-color: rgba(255, 255, 245, 0.96);
  border-radius: clamp(12px, 2vw, 20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

/* 水墨山水装饰层：在地图后方，不遮挡地图内容 */
.map-container::before {
  content: '';
  position: absolute;
  inset: 0;
  /* contain：不裁剪图片（可能留白，但完整展示） */
  background: url('/images/mapbackground/mapbackground.jpg') center / contain no-repeat;
  /* 提升可见度，但不干扰地图文字/边界 */
  opacity: 0.16;
  filter: contrast(1.18) saturate(1.05) brightness(0.98);
  pointer-events: none;
  z-index: 0;
}

.map-container > * {
  position: relative;
  z-index: 1;
}

.map-center-verse {
  flex: 1;
  min-height: min(120px, 18vh);
  width: 100%;
  max-width: min(980px, 100%);
  margin: 0 auto;
  quotes: none;
  padding: clamp(14px, 2.2vh, 26px) clamp(16px, 3vw, 28px);
  display: grid;
  grid-template-columns: auto auto;
  grid-template-rows: auto auto;
  column-gap: clamp(4px, 0.65vw, 12px);
  row-gap: 0.4em;
  justify-content: center;
  align-content: center;
  justify-items: center;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.10);
  background: transparent;
  border-radius: 0 0 clamp(12px, 2vw, 18px) clamp(12px, 2vw, 18px);
  box-shadow: none;
}

.map-center-verse p {
  margin: 0;
  white-space: nowrap;
  font-family: 'KaiTi', 'STKaiti', 'Noto Serif SC', 'Songti SC', serif;
  font-size: clamp(16px, 1.15vw + 12px, 21px);
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: 0.08em;
  color: #3d3530;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
}

.dishes-panel .panel-content.dishes-scroll {
  flex: 1;
  min-height: 0;
  max-height: none;
  overflow-y: auto;
}

.info-panel {
  background-color: transparent;
  border: 2px solid rgba(0, 0, 0, 0.72);
  border-radius: 18px;
  box-shadow: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  backdrop-filter: none;
}

.panel-header {
  padding: 16px 14px;
  background: transparent;
  color: rgba(26, 24, 22, 0.9);
  border-bottom: 2px solid rgba(0, 0, 0, 0.72);
  flex-shrink: 0;
}

.panel-header h3 {
  font-size: 17px;
  font-weight: 700;
  margin: 0 0 4px;
  line-height: 1.25;
}

.panel-header p {
  margin: 0;
  font-size: 12px;
  opacity: 1;
  line-height: 1.4;
  color: rgba(26, 24, 22, 0.72);
}

.panel-content {
  padding: 12px 10px 14px;
  overflow-y: auto;
  min-height: 0;
}

.dishes-panel .info-panel > .panel-content {
  flex: 1;
  min-height: min(200px, 30vh);
}

.dishes-panel .default-panel .panel-content {
  text-align: center;
  padding: 28px 16px;
  min-height: min(220px, 32vh);
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.welcome-content h4 {
  margin-bottom: 15px;
  color: #2A6EBB;
}

.welcome-content p {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.dish-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
}

.empty-dishes {
  text-align: center;
  color: #555;
  font-size: 14px;
  border: 1px dashed #d0d0d0;
  border-radius: 12px;
  padding: 20px;
}


.cuisine-tags {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 10px;
}

.cuisine-tag {
  font-size: 12px;
  padding: 4px 10px;
  background-color: #f0f7ff;
  color: #2a6ebb;
  border-radius: 12px;
}

@media (max-width: 1280px) {
  .map-layout-three {
    grid-template-columns: 1fr;
  }

  .browse-panel,
  .dishes-panel {
    position: static;
    max-height: none;
  }

  .map-container {
    max-width: 100%;
  }

  .browse-card {
    max-height: none;
  }
}
</style>
