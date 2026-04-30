import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const normalizeText = (value) => String(value ?? '').trim().toLowerCase()

export const useDataStore = defineStore('data', () => {
  // 省份数据
  const provinces = ref([])
  
  // 菜品数据
  const dishes = ref([])
  
  // 节气数据
  const solarTerms = ref([])
  
  // 当前选中的省份
  const selectedProvince = ref(null)
  
  // 当前选中的地级市（用于省内进一步筛选）
  const selectedCity = ref('')
  
  // 当前选中的菜品
  const selectedDish = ref(null)
  
  // 当前选中的节气
  const selectedSolarTerm = ref(null)
  
  // 搜索关键词
  const searchKeyword = ref('')
  
  // 计算属性：搜索结果
  const searchResults = computed(() => {
    const keyword = normalizeText(searchKeyword.value)
    if (!keyword) return []

    const results = []

    const calcScore = (name, aliases = '') => {
      const n = normalizeText(name)
      const a = normalizeText(aliases)
      const corpus = `${n}\0${a}`
      if (!corpus.includes(keyword)) return -1
      if (n === keyword) return 120
      if (n.startsWith(keyword)) return 100
      if (n.includes(keyword)) return 85
      if (a.startsWith(keyword)) return 70
      return 55
    }

    // 搜索省份
    provinces.value.forEach((province) => {
      const score = calcScore(province?.name, province?.region)
      if (score < 0) return
      results.push({
        type: 'province',
        data: province,
        score
      })
    })

    // 搜索菜品
    dishes.value.forEach((dish) => {
      const aliases = [
        dish.description,
        dish.flavor,
        dish.city,
        dish.cultural_meaning,
        dish.region,
        dish.province
      ]
        .map((s) => normalizeText(s))
        .join('\0')
      const score = calcScore(dish?.name, aliases)
      if (score < 0) return
      results.push({
        type: 'dish',
        data: dish,
        score
      })
    })

    // 搜索节气
    solarTerms.value.forEach((term) => {
      const aliases = `${term?.season || ''}\0${term?.description || ''}`
      const score = calcScore(term?.name, aliases)
      if (score < 0) return
      results.push({
        type: 'solarTerm',
        data: term,
        score
      })
    })

    // 排序与去重（同类型同 id/名称只保留最高分）
    const dedupMap = new Map()
    results.forEach((item) => {
      const id = item?.data?.id ?? item?.data?.name
      const key = `${item.type}:${String(id)}`
      const prev = dedupMap.get(key)
      if (!prev || item.score > prev.score) {
        dedupMap.set(key, item)
      }
    })

    return Array.from(dedupMap.values())
      .sort((a, b) => b.score - a.score)
      .map(({ score, ...rest }) => rest)
  })
  
  // 计算属性：当前节气
  const currentSolarTerm = computed(() => {
    const today = new Date()
    const month = today.getMonth() + 1
    const day = today.getDate()

    // 解析节气日期范围，格式如 "02/03-02/05"
    for (const term of solarTerms.value) {
      try {
        const dateRange = term.date.split('-')
        if (dateRange.length !== 2) continue

        const [startMonth, startDay] = dateRange[0].split('/').map(Number)
        const [endMonth, endDay] = dateRange[1].split('/').map(Number)

        // 处理跨年情况（如大寒到立春）
        if (startMonth > endMonth) {
          // 跨年节气，如12月-1月
          if ((month === startMonth && day >= startDay) ||
              (month === endMonth && day <= endDay) ||
              (month > startMonth || month < endMonth)) {
            return term
          }
        } else {
          // 正常情况
          if ((month === startMonth && day >= startDay) ||
              (month === endMonth && day <= endDay) ||
              (month > startMonth && month < endMonth)) {
            return term
          }
        }
      } catch (error) {
        console.warn('解析节气日期失败:', term.name, error)
      }
    }

    return solarTerms.value[0] || null
  })
  
  let loadInflight = null
  let solarExtraMerged = false

  // 加载初始数据（已加载或进行中的请求会合并，避免多处重复请求）
  const loadInitialData = async () => {
    if (provinces.value.length > 0 && dishes.value.length > 0 && solarTerms.value.length > 0) {
      // 已有基础数据时，仍确保节气美食扩展数据至少合并一次
      if (!solarExtraMerged) {
        const solarDishData = await import('@/data/solar_terms_dishes_complete.json')
        const solarExtra = (solarDishData.default || solarDishData)?.dishes || []
        const merged = [...dishes.value, ...solarExtra]
        dishes.value = Array.from(new Map(merged.map((d) => [String(d.id), d])).values())
        solarExtraMerged = true
      }
      return
    }
    if (loadInflight) return loadInflight

    loadInflight = (async () => {
      try {
        const [provinceData, dishData, solarData, solarDishData] = await Promise.all([
          import('@/data/provinces.json'),
          import('@/data/dishes.json'),
          import('@/data/solarTerms.json'),
          import('@/data/solar_terms_dishes_complete.json')
        ])

        provinces.value = provinceData.default || provinceData
        const baseDishes = dishData.default || dishData
        const solarExtra = (solarDishData.default || solarDishData)?.dishes || []
        // 按 id 去重后合并，保留原有地图菜品并补充节气完整数据
        const merged = [...baseDishes, ...solarExtra]
        dishes.value = Array.from(new Map(merged.map((d) => [String(d.id), d])).values())
        solarExtraMerged = true
        solarTerms.value = solarData.default || solarData

        /* 进入首页不默认选中省份/菜品，由用户在地图或侧栏选择 */
        if (solarTerms.value.length > 0) {
          selectedSolarTerm.value = currentSolarTerm.value || solarTerms.value[0]
        }
      } catch (error) {
        console.error('加载数据失败:', error)
        throw error
      } finally {
        loadInflight = null
      }
    })()

    return loadInflight
  }
  
  // 选择省份（优先用业务里的 foods，否则选该省第一道菜品以刷新右侧详情）
  const selectProvince = (province) => {
    selectedProvince.value = province
    selectedCity.value = ''
    const fromFoods = province?.foods?.[0]
    const fromDishes = dishes.value.find((d) => d.provinceId === province?.id)
    selectedDish.value = fromFoods ?? fromDishes ?? null
  }
  
  // 选择地级市（仅在已选省份下生效）
  const selectCity = (cityName) => {
    selectedCity.value = cityName || ''
    if (!selectedProvince.value || !selectedCity.value) return
    const fromCityDish = dishes.value.find(
      (d) => d.provinceId === selectedProvince.value.id && d.city === selectedCity.value
    )
    if (fromCityDish) selectedDish.value = fromCityDish
  }
  
  // 选择菜品
  const selectDish = (dish) => {
    selectedDish.value = dish
  }
  
  // 选择节气
  const selectSolarTerm = (term) => {
    selectedSolarTerm.value = term
  }

  // 收藏节气
  const favoriteSolarTermIds = ref([])

  const toggleFavoriteSolarTerm = (term) => {
    if (!term || !term.id) return
    const idx = favoriteSolarTermIds.value.indexOf(term.id)
    if (idx === -1) {
      favoriteSolarTermIds.value.push(term.id)
    } else {
      favoriteSolarTermIds.value.splice(idx, 1)
    }
  }

  const isSolarTermFavorite = (term) => {
    if (!term || !term.id) return false
    return favoriteSolarTermIds.value.includes(term.id)
  }
  
  // 搜索
  const search = (keyword) => {
    searchKeyword.value = keyword
  }
  
  return {
    provinces,
    dishes,
    solarTerms,
    selectedProvince,
    selectedCity,
    selectedDish,
    selectedSolarTerm,
    searchKeyword,
    searchResults,
    currentSolarTerm,
    favoriteSolarTermIds,
    loadInitialData,
    selectProvince,
    selectCity,
    selectDish,
    selectSolarTerm,
    toggleFavoriteSolarTerm,
    isSolarTermFavorite,
    search
  }
})