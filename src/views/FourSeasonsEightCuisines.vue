<template>
  <div class="page">
    <header class="page-header">
      <div class="title">四时八珍</div>
      <div class="subtitle">按四季品味时令，以八大菜系寻味中国。</div>
    </header>

    <section class="split">
      <!-- Left: Seasons -->
      <div class="panel">
        <div class="panel-title">四季美食</div>

        <div class="seasons">
          <button
            v-for="s in seasons"
            :key="s.name"
            type="button"
            class="season-card"
            :class="{ active: selectedSeasonName === s.name }"
            :style="{ background: seasonBg(s) }"
            @click="selectSeason(s.name)"
            :title="seasonTitle(s)"
          >
            <div class="season-top">
              <div class="season-name">{{ s.name }}</div>
            </div>

            <div class="season-foods">
              <button
                v-for="(f, idx) in seasonFoodNames(s).slice(0, 3)"
                :key="`${s.name}-${idx}`"
                type="button"
                class="pill pill-link"
                @click.stop="goDishByName(f)"
                :title="`查看「${f}」详情`"
              >
                {{ f }}
              </button>
            </div>

            <div class="season-tip">
              {{ s.healthTip || s.health_tip || '顺时而食，清淡为宜。' }}
            </div>

            <div class="season-more">
              <div class="more-row">
                <span class="more-k">月份</span>
                <span class="more-v">{{ s.months || '—' }}</span>
              </div>
              <div class="more-row">
                <span class="more-k">节气</span>
                <span class="more-v">{{ (s.solarTerms || []).join('、') || s.solar_term_range || '—' }}</span>
              </div>
              <div class="more-row">
                <span class="more-k">最佳菜系</span>
                <span class="more-v">{{ seasonBestCuisines(s).join('、') || '—' }}</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Right: Cuisines -->
      <div class="panel">
        <div class="panel-title">
          八大菜系
          <div v-if="recommendText" class="recommend">
            {{ recommendText }}
          </div>
        </div>

        <div class="cuisines">
          <button
            v-for="c in cuisines"
            :key="c.name"
            type="button"
            class="cuisine-card"
            :class="{ highlight: highlightedCuisineNamesSet.has(normalizeCuisineName(c.name)) }"
            :style="{ background: c.color || 'rgba(248, 242, 232, 0.95)' }"
            @click="onCuisineClick(c)"
            :title="cuisineTooltip(c)"
          >
            <div class="cuisine-head">
              <div class="cuisine-name">{{ c.name }}</div>
            </div>

            <div class="tags">
              <span v-for="(t, idx) in (c.flavors || []).slice(0, 3)" :key="`${c.name}-t-${idx}`" class="tag">
                {{ t }}
              </span>
            </div>

            <div class="dish">
              <span class="dish-k">代表菜</span>
              <button
                v-if="(c.representativeDishes || c.representative_dishes || [])[0]"
                type="button"
                class="dish-v dish-link"
                @click.stop="goDishByName((c.representativeDishes || c.representative_dishes || [])[0])"
                :title="`查看「${(c.representativeDishes || c.representative_dishes || [])[0]}」详情`"
              >
                {{ (c.representativeDishes || c.representative_dishes || [])[0] }}
              </button>
              <span v-else class="dish-v">—</span>
            </div>

            <div class="cuisine-more">
              <span class="more-k">更多代表菜</span>
              <span class="more-v">
                <template v-if="(c.representativeDishes || c.representative_dishes || []).length">
                  <button
                    v-for="(name, idx) in (c.representativeDishes || c.representative_dishes || []).slice(0, 4)"
                    :key="`${c.name}-more-${idx}`"
                    type="button"
                    class="more-pill"
                    @click.stop="goDishByName(name)"
                    :title="`查看「${name}」详情`"
                  >
                    {{ name }}
                  </button>
                </template>
                <template v-else>—</template>
              </span>
            </div>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import seasonsRaw from '@/data/seasons.json'
import cuisinesRaw from '@/data/cuisines.json'

const router = useRouter()
const dataStore = useDataStore()

const seasons = computed(() => Array.isArray(seasonsRaw) ? seasonsRaw : [])
const cuisines = computed(() => Array.isArray(cuisinesRaw) ? cuisinesRaw : [])

const selectedSeasonName = ref('春季')

const selectedSeason = computed(() => seasons.value.find((s) => s.name === selectedSeasonName.value) || seasons.value[0])

const highlightedCuisineNamesSet = computed(() => {
  const names = seasonBestCuisines(selectedSeason.value).map(normalizeCuisineName)
  return new Set(names.filter(Boolean))
})

const recommendText = computed(() => {
  const s = selectedSeason.value
  const names = seasonBestCuisines(s)
  if (!s?.name || names.length === 0) return ''
  return `${s.name}最适合：${names.join('、')}`
})

function selectSeason(name) {
  selectedSeasonName.value = name
}

onMounted(() => {
  dataStore.loadInitialData()
})

function seasonKey(s) {
  const n = s?.name || ''
  if (n.includes('春')) return '春'
  if (n.includes('夏')) return '夏'
  if (n.includes('秋')) return '秋'
  if (n.includes('冬')) return '冬'
  return String(n).slice(0, 1) || ''
}

function defaultSeasonColor(key) {
  const map = {
    春: 'rgba(106, 191, 125, 0.18)',
    夏: 'rgba(255, 176, 77, 0.18)',
    秋: 'rgba(225, 168, 95, 0.18)',
    冬: 'rgba(120, 155, 255, 0.18)'
  }
  return map[key] || 'rgba(248, 242, 232, 0.95)'
}

function seasonBg(s) {
  if (s?.color) return s.color
  return defaultSeasonColor(seasonKey(s))
}

function seasonBestCuisines(s) {
  const v = s?.bestCuisines || s?.best_cuisines || []
  return Array.isArray(v) ? v : []
}

function seasonFoodNames(s) {
  // 新结构：representativeFoods: [{name,...}]
  const rep = s?.representativeFoods
  if (Array.isArray(rep) && rep.length > 0) {
    return rep.map((x) => x?.name).filter(Boolean)
  }
  // 旧结构：foods: ["xx","yy"]
  const foods = s?.foods
  if (Array.isArray(foods) && foods.length > 0) return foods
  return []
}

function seasonTitle(s) {
  const parts = []
  if (s?.english) parts.push(s.english)
  if (s?.months) parts.push(s.months)
  const solar = Array.isArray(s?.solarTerms) ? s.solarTerms.join('、') : ''
  if (solar) parts.push(solar)
  return parts.filter(Boolean).join(' ｜ ') || s?.name || ''
}

function cuisineTooltip(c) {
  const more = (c?.representativeDishes || c?.representative_dishes || []).slice(0, 6).join('、')
  const seasonArr = c?.bestSeason || (c?.best_season ? [c.best_season] : [])
  const season = Array.isArray(seasonArr) ? seasonArr.join('、') : String(seasonArr || '')
  const seasonText = season ? `最佳季节：${season}` : ''
  const regionText = c?.region ? `地区：${c.region}` : ''
  return [more ? `代表菜：${more}` : '', seasonText, regionText].filter(Boolean).join(' ｜ ')
}

function onCuisineClick(c) {
  if (!c?.name) return
  router.push('/map')
}

function normalizeCuisineName(name) {
  if (!name) return ''
  // e.g. "川菜（凉菜）" -> "川菜"
  return String(name).replace(/（.*?）/g, '').trim()
}

function dishesByNameIndex() {
  const m = new Map()
  for (const d of dataStore.dishes || []) {
    const n = String(d?.name || '').trim()
    if (!n) continue
    if (!m.has(n)) m.set(n, [])
    m.get(n).push(d)
  }
  return m
}

const dishIndex = computed(() => dishesByNameIndex())

function goDishByName(name) {
  const key = String(name || '').trim()
  if (!key) return
  const list = dishIndex.value.get(key) || []
  const hit = list[0]
  if (!hit?.id) return
  dataStore.selectDish(hit)
  router.push(`/dish/${hit.id}`)
}
</script>

<style scoped>
.page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin: 8px 0 14px;
  padding: 14px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
}

.title {
  font-size: 22px;
  font-weight: 800;
  color: #2c2c2c;
  letter-spacing: 0.5px;
}

.subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: rgba(58, 48, 38, 0.7);
}

.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  align-items: stretch;
}

.panel {
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.06);
  padding: 14px;
  min-width: 0;
}

.panel-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  font-size: 16px;
  font-weight: 800;
  color: #2c2c2c;
  margin-bottom: 12px;
}

.recommend {
  font-size: 12px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.75);
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(248, 242, 232, 0.95);
  border: 1px solid rgba(194, 184, 168, 0.7);
}

.seasons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.season-card {
  height: 100%;
  text-align: left;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  padding: 12px;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  position: relative;
  overflow: hidden;
  min-height: 0;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}

.season-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.10);
}

.season-card.active {
  border-color: rgba(0, 0, 0, 0.75);
  border-width: 2px;
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.12);
}

.season-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.season-icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.season-name {
  font-size: 16px;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.78);
}

.season-foods {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.72);
}

.pill-link {
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

.pill-link:hover {
  background: rgba(255, 255, 255, 0.92);
  border-color: rgba(0, 0, 0, 0.18);
  transform: translateY(-1px);
}

.pill-link:active {
  transform: translateY(0);
}

.season-tip {
  margin-top: 10px;
  font-size: 12px;
  line-height: 1.55;
  color: rgba(0, 0, 0, 0.7);
}

.season-more {
  margin-top: 10px;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.18s ease, transform 0.18s ease;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.72);
}

.season-card:hover .season-more {
  opacity: 1;
  transform: translateY(0);
}

.more-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 6px;
}

.more-k {
  color: rgba(0, 0, 0, 0.55);
  font-weight: 700;
  flex: 0 0 auto;
}

.more-v {
  text-align: right;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.72);
}

.cuisines {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.cuisine-card {
  text-align: left;
  border-radius: 14px;
  padding: 12px;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  min-height: 130px;
  position: relative;
  overflow: hidden;
}

.cuisine-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.10);
}

.cuisine-card.highlight {
  border-color: rgba(0, 0, 0, 0.75);
  border-width: 2px;
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.12);
}

.cuisine-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cuisine-icon {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 16px;
}

.cuisine-name {
  font-size: 14px;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.78);
}

.tags {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  font-size: 12px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.7);
}

.dish {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.dish-k {
  font-size: 12px;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.55);
  flex: 0 0 auto;
}

.dish-v {
  font-size: 12px;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.75);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dish-link {
  padding: 0;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: rgba(0, 0, 0, 0.25);
  text-underline-offset: 3px;
}

.dish-link:hover {
  text-decoration-color: rgba(0, 0, 0, 0.65);
}

.cuisine-more {
  margin-top: 10px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.7);
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.cuisine-card:hover .cuisine-more {
  opacity: 1;
  transform: translateY(0);
}

.more-pill {
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  height: 22px;
  margin-right: 6px;
  margin-top: 6px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: transparent;
  color: rgba(0, 0, 0, 0.75);
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}

.more-pill:hover {
  border-color: rgba(0, 0, 0, 0.28);
  background: rgba(0, 0, 0, 0.04);
}

@media (max-width: 980px) {
  .split {
    grid-template-columns: 1fr;
  }
  .cuisines {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .seasons {
    grid-template-columns: 1fr;
  }
}
</style>

