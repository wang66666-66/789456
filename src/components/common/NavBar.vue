<template>
  <header class="navbar" :class="{ 'is-home-overlay': route.path === '/' }">
    <div class="navbar-container">
      <!-- Logo -->
      <div class="logo" @click="$router.push('/')">
        <div class="logo-icon">知</div>
        <div class="logo-text">知味集</div>
      </div>
      
      <!-- 导航链接 -->
      <nav class="nav-links">
        <router-link
          to="/"
          class="nav-link"
          :class="{ active: $route.path === '/' }"
        >
          首页
        </router-link>
        <router-link 
          to="/map" 
          class="nav-link"
          :class="{ active: $route.path === '/map' }"
        >
          美食地图
        </router-link>
        <router-link
          to="/four-seasons-eight-cuisines"
          class="nav-link"
          :class="{ active: $route.path === '/four-seasons-eight-cuisines' }"
        >
          四时八珍
        </router-link>
        <router-link 
          to="/solar-term" 
          class="nav-link"
          :class="{ active: $route.path === '/solar-term' }"
        >
          二十四节气
        </router-link>
        <router-link 
          to="/academy" 
          class="nav-link"
          :class="{ active: $route.path === '/academy' }"
        >
          知味学堂
        </router-link>
      </nav>
      
      <!-- 搜索和用户 -->
      <div class="user-section">
        <!-- 搜索框 -->
        <div class="search-box" ref="searchBoxRef">
          <el-input
            v-model="searchText"
            placeholder="搜索美食、省份、节气..."
            :prefix-icon="Search"
            @keyup.enter="handleSearch"
            @keydown.down.prevent="handleArrowDown"
            @keydown.up.prevent="handleArrowUp"
            @keydown.esc.prevent="closeSearchResults"
            @focus="handleSearchFocus"
            @input="handleSearchInput"
            clearable
          />
        </div>
        
        <!-- 登录/用户按钮 -->
        <button
          type="button"
          class="user-avatar"
          @click="toggleLogin"
          :aria-label="userStore.isLoggedIn ? '用户' : '登录'"
        >
          <el-icon class="user-icon"><UserFilled /></el-icon>
        </button>
      </div>
    </div>
    
    <!-- 搜索结果下拉 -->
    <div v-if="showSearchResults" class="search-results">
      <div v-if="searchResults.length === 0" class="no-results">
        未找到相关结果
      </div>
      <div v-else>
        <div v-for="(result, index) in visibleSearchResults"
             :key="index" 
             class="search-result-item"
             :class="{ active: index === activeResultIndex }"
             @click="handleResultClick(result)">
          <div class="result-content">
            <div class="result-title">{{ result.data.name }}</div>
            <div class="result-type">{{ getResultTypeText(result.type) }}</div>
          </div>
        </div>
        <div v-if="searchResults.length > resultLimit" class="search-more-tip">
          还有 {{ searchResults.length - resultLimit }} 条结果，继续输入可缩小范围
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search, UserFilled } from '@element-plus/icons-vue'
import { useDataStore } from '@/stores/data'
import { useUserStore } from '@/stores/user'
import { debounce } from '@/utils/helper'

const router = useRouter()
const route = useRoute()
const dataStore = useDataStore()
const userStore = useUserStore()

const searchText = ref('')
const showSearchResults = ref(false)
const searchBoxRef = ref(null)
const activeResultIndex = ref(-1)
const resultLimit = 6

// 监听搜索关键词变化
watch(() => dataStore.searchKeyword, (newVal) => {
  searchText.value = newVal
  if (newVal) {
    showSearchResults.value = true
  } else {
    showSearchResults.value = false
  }
})

// 搜索结果
const searchResults = computed(() => dataStore.searchResults)
const visibleSearchResults = computed(() => searchResults.value.slice(0, resultLimit))

// 用户首字母
// 处理搜索
const handleSearch = () => {
  if (searchText.value.trim()) {
    dataStore.search(searchText.value)
    showSearchResults.value = true
    if (activeResultIndex.value >= 0 && activeResultIndex.value < visibleSearchResults.value.length) {
      handleResultClick(visibleSearchResults.value[activeResultIndex.value])
    }
  } else {
    closeSearchResults()
  }
}

const applySearchInput = (raw) => {
  const q = raw.trim()
  if (q) {
    dataStore.search(q)
    showSearchResults.value = true
    activeResultIndex.value = -1
  } else {
    closeSearchResults()
  }
}

const debouncedSearchInput = debounce(applySearchInput, 200)

// 实时搜索（防抖，减少 store 与列表重算频率）
const handleSearchInput = () => {
  debouncedSearchInput(searchText.value)
}

const handleSearchFocus = () => {
  if (searchText.value.trim()) {
    dataStore.search(searchText.value)
    showSearchResults.value = true
  }
}

const closeSearchResults = () => {
  dataStore.search('')
  showSearchResults.value = false
  activeResultIndex.value = -1
}

const handleArrowDown = () => {
  if (!showSearchResults.value || visibleSearchResults.value.length === 0) return
  activeResultIndex.value =
    activeResultIndex.value >= visibleSearchResults.value.length - 1
      ? 0
      : activeResultIndex.value + 1
}

const handleArrowUp = () => {
  if (!showSearchResults.value || visibleSearchResults.value.length === 0) return
  activeResultIndex.value =
    activeResultIndex.value <= 0
      ? visibleSearchResults.value.length - 1
      : activeResultIndex.value - 1
}

// 处理结果点击
const handleResultClick = (result) => {
  searchText.value = ''
  closeSearchResults()
  
  switch (result.type) {
    case 'province':
      dataStore.selectProvince(result.data)
      router.push('/map')
      break
    case 'dish':
      dataStore.selectDish(result.data)
      router.push('/map')
      break
    case 'solarTerm':
      dataStore.selectSolarTerm(result.data)
      router.push('/solar-term')
      break
  }
}

// 获取结果类型文本
const getResultTypeText = (type) => {
  const texts = {
    province: '省份',
    dish: '美食',
    solarTerm: '节气'
  }
  return texts[type] || '未知'
}

// 切换登录状态
const toggleLogin = async () => {
  if (userStore.isLoggedIn) {
    await userStore.logout()
    if (route.name === 'academy') {
      router.replace({ name: 'academy-login', query: { redirect: '/academy' } })
    }
  } else {
    router.push({ name: 'academy-login', query: { redirect: route.fullPath || '/academy' } })
  }
}

const handleDocumentClick = (event) => {
  const root = searchBoxRef.value
  if (!root) return
  if (!root.contains(event.target)) {
    closeSearchResults()
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<style scoped>
.navbar {
  /* 透明导航栏：不遮挡全局背景图 */
  background-color: transparent;
  box-shadow: none;
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: none;
}

/* 仅首页：让导航栏叠在 Banner 图片上方 */
.navbar.is-home-overlay {
  position: absolute;
  left: 0;
  right: 0;
}

.navbar.is-home-overlay .nav-link {
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.55);
}

.navbar.is-home-overlay .nav-link:hover,
.navbar.is-home-overlay .nav-link.active {
  color: #fff;
}

.navbar.is-home-overlay .logo-text {
  -webkit-text-fill-color: initial;
  background: none;
  color: rgba(255, 255, 255, 0.96);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.55);
}

.navbar.is-home-overlay .logo-icon {
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.28);
}

.navbar-container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 clamp(8px, 1.2vw, 14px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 70px;
  gap: 12px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2A6EBB, #8B4513);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(42, 110, 187, 0.3);
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #2A6EBB, #8B4513);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-link {
  text-decoration: none;
  color: rgba(26, 24, 22, 0.90);
  font-weight: 500;
  font-size: 16px;
  padding: 8px 0;
  position: relative;
  transition: all 0.3s;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.65);
}

.nav-link:hover, .nav-link.active {
  color: #2A6EBB;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #2A6EBB, #8B4513);
  border-radius: 2px;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-box {
  flex: 1 1 auto;
  width: min(300px, 100%);
  max-width: min(320px, 100%);
  min-width: 0;
}

:deep(.el-input__wrapper) {
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background-color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s;
}

:deep(.el-input__wrapper:hover) {
  border-color: #2A6EBB;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #2A6EBB;
  box-shadow: 0 0 0 3px rgba(42, 110, 187, 0.1);
}

.user-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: rgba(26, 24, 22, 0.82);
  border: 1px solid rgba(0, 0, 0, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  transition: box-shadow 0.3s;
  box-shadow: none;
  overflow: hidden;
  padding: 0;
}

.user-avatar:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  border-color: rgba(0, 0, 0, 0.22);
}

.user-icon {
  font-size: 18px;
  line-height: 1;
}

.search-results {
  position: absolute;
  top: 70px;
  right: 280px;
  width: 300px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1001;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #888;
}

.search-result-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background-color: #f5f1e8;
}

.search-result-item.active {
  background-color: #eef5ff;
}

.result-content {
  flex: 1;
}

.result-title {
  font-weight: 600;
  color: #2c2c2c;
  margin-bottom: 4px;
}

.result-type {
  font-size: 12px;
  color: #888;
}

.search-more-tip {
  padding: 10px 16px;
  font-size: 12px;
  color: #777;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background: #fafafa;
}

@media (max-width: 768px) {
  .navbar-container {
    flex-wrap: wrap;
    height: auto;
    padding: 12px 8px;
  }
  
  .nav-links {
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: 15px;
    gap: 20px;
  }
  
  .user-section {
    order: 2;
  }
  
  .search-box {
    width: 200px;
  }
  
  .search-results {
    right: 8px;
    width: calc(100% - 16px);
  }
}
</style>