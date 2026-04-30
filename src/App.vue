<template>
  <div id="app">
    <!-- 顶部导航栏 -->
    <NavBar />
    
    <!-- 主内容区域 -->
    <main class="main-content" :class="{ 'main-content--home': route.path === '/' }">
      <router-view />
    </main>
    
    <!-- 底部信息 -->
    <Footer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/common/NavBar.vue'
import Footer from '@/components/common/Footer.vue'
import { useDataStore } from '@/stores/data'

const dataStore = useDataStore()
const route = useRoute()

onMounted(() => {
  // 初始化数据
  dataStore.loadInitialData()
})
</script>

<style scoped>
#app {
  width: 100%;
  min-width: 0;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  /* 让 body 背景图透出来（卡片仍是白底） */
  background: transparent;
}

.main-content {
  flex: 1 1 auto;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin: 0 auto;
  /* 左右留白略小，内容区更贴边、更宽 */
  padding: clamp(10px, 1.8vw, 18px) clamp(8px, 1.2vw, 14px);
}

/* 首页需要 Banner 贴边全屏：去掉内容区 padding */
.main-content.main-content--home {
  padding: 0;
}
</style>