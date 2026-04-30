<template>
  <div class="china-map-wrap">
    <button
      v-if="dataStore.selectedProvince"
      type="button"
      class="map-reset-btn"
      title="返回全国"
      aria-label="返回全国"
      @click="resetNational"
    >
      ↻
    </button>
    <div ref="mapChart" class="map-chart" />
    <div class="map-review-number">审图号：GS（2024）0650号</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useDataStore } from '@/stores/data'
import prefectureCities from '@/data/prefectureCities.json'
import { bboxFromFeature } from '@/utils/prefectureScatter'

// 画布背景透明：露出容器装饰背景；地图区域（省份填充）仍保持不透明
const MAP_BG = 'rgba(0,0,0,0)'
// 让水墨背景更明显一点（仍保持边界线/文字清晰）
const LAND_FILL = 'rgba(248, 242, 232, 0.86)'
const PROVINCE_BORDER = '#c2b8a8'
const BORDER_WIDTH = 0.8
// 极浅朱砂红（用于省份 hover 填充）
const HOVER_FILL = 'rgba(194, 59, 34, 0.14)'
const HOVER_BORDER = 'rgba(194, 59, 34, 0.55)'
const GLOW_COLOR = 'rgba(194, 59, 34, 0.28)'
const MARKER_COLOR = '#c23b22'
const MARKER_SIZE = 9

const CHINA_CENTER = [104.2, 35.8]
const CHINA_ZOOM = 1.12
const CITY_LABEL_MIN_ZOOM = 2.15

const mapChart = ref(null)
const dataStore = useDataStore()

let chartInstance = null
let resizeObserver = null
let regionNamesFromGeo = []
let featureByProvinceName = {}
let windowResizeHandler = null
let echartsApiPromise = null
let geoRoamHandler = null
let scatterLabelsVisible = null

function loadEChartsApi() {
  if (echartsApiPromise) return echartsApiPromise
  echartsApiPromise = (async () => {
    const core = await import('echarts/core')
    const charts = await import('echarts/charts')
    const components = await import('echarts/components')
    const renderers = await import('echarts/renderers')

    core.use([
      charts.MapChart,
      charts.ScatterChart,
      components.TooltipComponent,
      components.GeoComponent,
      renderers.CanvasRenderer
    ])

    return {
      init: core.init,
      registerMap: core.registerMap
    }
  })()
  return echartsApiPromise
}

function zoomFromBbox(bb) {
  const w = bb.maxLng - bb.minLng
  const h = bb.maxLat - bb.minLat
  const span = Math.max(w, h * 1.12) || 2
  // 调大放大力度，让选中省份更明显
  const z = 100 / span
  return Math.min(8.2, Math.max(2.6, z))
}

function getViewForProvince(province) {
  if (!province?.name) {
    return { center: [...CHINA_CENTER], zoom: CHINA_ZOOM }
  }
  const feat = featureByProvinceName[province.name]
  const bb = feat ? bboxFromFeature(feat) : null
  if (bb) {
    return { center: [bb.cx, bb.cy], zoom: zoomFromBbox(bb) }
  }
  if (province.coordinates?.length >= 2) {
    return { center: [province.coordinates[0], province.coordinates[1]], zoom: 2.35 }
  }
  return { center: [...CHINA_CENTER], zoom: CHINA_ZOOM }
}

function scatterDataForProvince(province) {
  if (!province?.name) return []
  return prefectureCities
    .filter((c) => c.province === province.name)
    .map((c) => ({
      name: c.name,
      value: [c.lng, c.lat]
    }))
}

function shouldShowCityLabels(zoom) {
  return Number(zoom || 0) >= CITY_LABEL_MIN_ZOOM
}

function buildGeoOption(center, zoom) {
  return {
    map: 'china',
    roam: true,
    zlevel: 0,
    center: [...center],
    zoom,
    itemStyle: {
      // 底层 geo 只保留边界线，填充交给 map 系列控制
      areaColor: 'rgba(0, 0, 0, 0)',
      borderColor: PROVINCE_BORDER,
      borderWidth: BORDER_WIDTH
    },
    emphasis: {
      itemStyle: {
        areaColor: HOVER_FILL,
        borderColor: HOVER_BORDER,
        borderWidth: 1,
        shadowBlur: 18,
        shadowColor: GLOW_COLOR,
        shadowOffsetX: 0,
        shadowOffsetY: 0
      }
    },
    label: { show: false }
  }
}

function buildMapSeries(selectedProvinceName) {
  return {
    name: '省份',
    type: 'map',
    geoIndex: 0,
    map: 'china',
    zlevel: 1,
    data: regionNamesFromGeo.map((name) => {
      const isSelected = !!selectedProvinceName && name === selectedProvinceName
      return {
        name,
        itemStyle: isSelected
          ? {
              areaColor: HOVER_FILL,
              borderColor: HOVER_BORDER,
              borderWidth: 1,
              shadowBlur: 22,
              shadowColor: GLOW_COLOR,
              shadowOffsetX: 0,
              shadowOffsetY: 0
            }
          : undefined
      }
    }),
    selectedMode: false,
    itemStyle: {
      areaColor: LAND_FILL,
      borderColor: PROVINCE_BORDER,
      borderWidth: BORDER_WIDTH
    },
    emphasis: {
      itemStyle: {
        areaColor: HOVER_FILL,
        borderColor: HOVER_BORDER,
        borderWidth: 1,
        shadowBlur: 20,
        shadowColor: GLOW_COLOR,
        shadowOffsetX: 0,
        shadowOffsetY: 0
      }
    },
    label: { show: false }
  }
}

function buildScatterSeries(data, showLabels) {
  return {
    name: '地级市',
    type: 'scatter',
    coordinateSystem: 'geo',
    geoIndex: 0,
    zlevel: 10,
    data,
    symbol: 'circle',
    symbolSize: MARKER_SIZE,
    label: {
      show: showLabels,
      formatter: '{b}',
      position: 'top',
      distance: 5,
      color: '#3a3026',
      fontSize: 11,
      fontWeight: 600
    },
    labelLayout: {
      hideOverlap: true
    },
    emphasis: {
      scale: 1.15,
      label: {
        fontSize: 12,
        color: MARKER_COLOR
      },
      itemStyle: {
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    },
    itemStyle: {
      color: MARKER_COLOR,
      borderColor: '#ffffff',
      borderWidth: 1,
      shadowBlur: 4,
      shadowColor: 'rgba(194, 59, 34, 0.25)'
    }
  }
}

function buildSeries(sel, zoom = CHINA_ZOOM) {
  const cities = scatterDataForProvince(sel)
  const list = [buildMapSeries(sel?.name)]
  if (cities.length > 0) {
    list.push(buildScatterSeries(cities, shouldShowCityLabels(zoom)))
  }
  return list
}

function applyChartState() {
  if (!chartInstance) return
  const sel = dataStore.selectedProvince
  const { center, zoom } = getViewForProvince(sel)
  scatterLabelsVisible = shouldShowCityLabels(zoom)

  chartInstance.setOption(
    {
      geo: buildGeoOption(center, zoom),
      series: buildSeries(sel, zoom)
    },
    { replaceMerge: ['geo', 'series'] }
  )

  nextTick(() => {
    chartInstance?.resize()
  })
}

function resetNational() {
  dataStore.selectProvince(null)
  dataStore.selectCity('')
}

function onChartClick(params) {
  if (params.seriesType === 'scatter') {
    const cityName = params.name
    if (cityName) dataStore.selectCity(cityName)
    return
  }
  if (params.seriesType !== 'map') return
  const regionName = params.name || params.data?.name
  if (!regionName) return
  const province = dataStore.provinces.find((p) => p.name === regionName)
  if (province) {
    dataStore.selectProvince(province)
    dataStore.selectCity('')
  }
}

async function initMap() {
  if (!mapChart.value) return

  const echartsLib = await loadEChartsApi()
  const { default: chinaGeo } = await import('@/assets/geo/china.json')

  featureByProvinceName = {}
  for (const f of chinaGeo.features || []) {
    const n = f.properties?.name
    if (n) featureByProvinceName[n] = f
  }

  regionNamesFromGeo = (chinaGeo.features || [])
    .map((f) => f.properties?.name)
    .filter((n) => n != null && String(n).trim().length > 0)

  echartsLib.registerMap('china', chinaGeo)

  chartInstance = echartsLib.init(mapChart.value)

  chartInstance.setOption({
    animation: true,
    animationDuration: 500,
    animationDurationUpdate: 750,
    animationEasingUpdate: 'cubicOut',
    backgroundColor: MAP_BG,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0,0,0,0)',
      borderWidth: 0,
      padding: 0,
      extraCssText: 'box-shadow:none;',
      formatter(params) {
        if (params.seriesType === 'scatter') {
          return `<span style=\"font-weight:700;color:${MARKER_COLOR};font-size:14px;\">${params.name}</span>`
        }
        if (params.seriesType === 'map') {
          return params.name
            ? `<span style=\"font-weight:800;color:#2c2c2c;font-size:14px;\">${params.name}</span>`
            : ''
        }
        return ''
      }
    },
    geo: buildGeoOption(CHINA_CENTER, CHINA_ZOOM),
    series: buildSeries(dataStore.selectedProvince, CHINA_ZOOM)
  })

  chartInstance.on('click', onChartClick)

  // 当用户手动缩放/拖拽到较小比例时，自动恢复全国视图
  geoRoamHandler = () => {
    if (!chartInstance) return
    const opt = chartInstance.getOption()
    const geoOpt = Array.isArray(opt.geo) ? opt.geo[0] : opt.geo
    const currentZoom = geoOpt?.zoom ?? CHINA_ZOOM
    const nextShowLabels = shouldShowCityLabels(currentZoom)
    if (dataStore.selectedProvince && scatterLabelsVisible !== nextShowLabels) {
      scatterLabelsVisible = nextShowLabels
      chartInstance.setOption(
        {
          series: buildSeries(dataStore.selectedProvince, currentZoom)
        },
        { replaceMerge: ['series'] }
      )
    }
    // 当缩放回到接近全国视图时，清除选中省份
    // 阈值更低：需要缩得更小才自动回全国
    // 阈值更大：缩小到更接近全国就自动回归
    if (currentZoom <= CHINA_ZOOM * 1.18) {
      if (dataStore.selectedProvince) {
        dataStore.selectProvince(null)
        dataStore.selectCity('')
      }
    }
  }
  chartInstance.on('georoam', geoRoamHandler)

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver?.disconnect()
    resizeObserver = new ResizeObserver(() => chartInstance?.resize())
    resizeObserver.observe(mapChart.value)
  }
}

watch(
  () => dataStore.selectedProvince?.id,
  () => applyChartState()
)

onMounted(async () => {
  if (!dataStore.provinces.length || !dataStore.dishes.length || !dataStore.solarTerms.length) {
    await dataStore.loadInitialData()
  }
  await initMap()
  windowResizeHandler = () => chartInstance?.resize()
  window.addEventListener('resize', windowResizeHandler)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  if (windowResizeHandler) {
    window.removeEventListener('resize', windowResizeHandler)
    windowResizeHandler = null
  }
  if (chartInstance && geoRoamHandler) {
    chartInstance.off('georoam', geoRoamHandler)
    geoRoamHandler = null
  }
  chartInstance?.off('click', onChartClick)
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<style scoped>
.china-map-wrap {
  position: relative;
  width: 100%;
  height: clamp(260px, 58vh, 720px);
  min-height: 260px;
  background: transparent;
}

.map-chart {
  width: 100%;
  height: 100%;
  min-height: 240px;
}

.map-reset-btn {
  position: absolute;
  right: 12px;
  top: 10px;
  z-index: 360;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  border: 1px solid rgba(194, 184, 168, 0.9);
  border-radius: 50%;
  background: rgba(255, 252, 248, 0.96);
  color: #111111;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(58, 48, 38, 0.16);
  transition: all 0.18s ease;
}

.map-reset-btn:hover {
  background: #fff;
  color: #000000;
  transform: rotate(-18deg) scale(1.04);
}

.map-reset-btn:active {
  transform: rotate(-18deg) scale(0.96);
}

.map-review-number {
  position: absolute;
  right: 10px;
  bottom: 8px;
  z-index: 350;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.4;
  color: rgba(58, 48, 38, 0.85);
  background: rgba(255, 252, 248, 0.86);
  border: 1px solid rgba(194, 184, 168, 0.65);
  pointer-events: none;
}
</style>
