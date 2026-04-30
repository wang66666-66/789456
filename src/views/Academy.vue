<template>
  <div class="academy-page">
    <div class="page-header">
      <h1>知味学堂</h1>
      <p>记录您的学习足迹，开启美食文化之旅</p>
    </div>
    
    <div class="academy-content">
      <div class="dash-hero">
        <div class="dash-left">
          <div class="dash-kicker">LEARNING DASHBOARD</div>
          <h2 class="dash-title">你好，{{ userStore.userInfo.username }}</h2>
          <p class="dash-sub">继续你的美食文化学习之旅 · 当前等级：{{ userStore.userLevel }}</p>
          <div class="dash-progress">
            <div class="dash-progress-row">
              <span>学习进度</span>
              <span class="dash-progress-val">{{ Math.round(userStore.progressPercentage) }}%</span>
            </div>
            <div class="dash-bar">
              <div class="dash-bar-fill" :style="{ width: userStore.progressPercentage + '%' }" />
            </div>
          </div>
        </div>
        <div class="dash-right">
          <button type="button" class="dash-btn" @click="goHome">去地图探索</button>
          <button type="button" class="dash-btn ghost" @click="handleLogout">退出登录</button>
        </div>
      </div>

      <div class="academy-layout edu">
        <!-- 左侧用户信息 -->
        <div class="user-sidebar">
          <div class="user-profile">
            <div class="user-avatar-large">
              {{ userInitials }}
            </div>
            <div class="user-info">
              <h3 class="user-name">{{ userStore.userInfo.username }}</h3>
              <div class="user-level">{{ userStore.userLevel }}</div>
            </div>
          </div>
          
          <div class="user-stats">
            <div class="stat-item">
              <div class="stat-number">{{ userStore.userInfo.studyDays }}</div>
              <div class="stat-label">学习天数</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ userStore.userInfo.collectedFoods.length }}</div>
              <div class="stat-label">收藏美食</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ userStore.userInfo.experience }}</div>
              <div class="stat-label">经验值</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ userStore.userInfo.unlockedBadges.length }}</div>
              <div class="stat-label">获得成就</div>
            </div>
          </div>
          
          <div class="progress-section">
            <div class="progress-info">
              <span>学习进度</span>
              <span>{{ Math.round(userStore.progressPercentage) }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: userStore.progressPercentage + '%' }"></div>
            </div>
          </div>
          
          <div class="recreate-block">
            <RecreateChallenge />
          </div>

          <button class="logout-btn" @click="handleLogout">退出登录</button>
        </div>
        
        <!-- 右侧学习内容 -->
        <div class="learning-content">
          <!-- 我的成就 -->
          <div class="achievements-section">
            <h2>我的成就</h2>
            <div class="badge-grid">
              <div v-for="badge in badges" 
                   :key="badge.id"
                   class="badge-item"
                   :class="{ unlocked: isBadgeUnlocked(badge.id) }"
                   :title="badge.description">
                <div class="badge-icon">{{ badge.icon }}</div>
                <div class="badge-name">{{ badge.name }}</div>
                <div v-if="!isBadgeUnlocked(badge.id)" class="badge-lock">🔒</div>
              </div>
            </div>
          </div>
          
          <!-- 今日挑战 -->
          <div class="quiz-section">
            <h2>今日知识挑战</h2>
            <div class="quiz-card">
              <div class="quiz-question">{{ quizQuestion.question }}</div>
              <div class="quiz-options">
                <div v-for="(option, index) in quizQuestion.options" 
                     :key="index"
                     class="quiz-option"
                     :class="{ selected: selectedAnswer === index }"
                     @click="selectAnswer(index)">
                  {{ option }}
                </div>
              </div>
              <button class="submit-btn" 
                      :disabled="selectedAnswer === null"
                      @click="submitAnswer">
                提交答案
              </button>
              
              <div v-if="showResult" class="quiz-result">
                <div v-if="isAnswerCorrect" class="result-correct">
                  <span class="result-icon">✅</span>
                  <span>回答正确！+10 经验值</span>
                </div>
                <div v-else class="result-wrong">
                  <span class="result-icon">❌</span>
                  <span>回答错误，正确答案是：{{ quizQuestion.options[quizQuestion.correctAnswer] }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 我的收藏 -->
          <div class="collection-section">
            <h2>我的收藏</h2>
            <div v-if="userStore.userInfo.collectedFoods.length === 0" class="empty-collection">
              <div class="empty-icon">📁</div>
              <p>您还没有收藏任何美食</p>
              <router-link to="/map" class="explore-link">去探索美食 →</router-link>
            </div>
            <div v-else class="collection-grid">
              <div
                v-for="foodId in userStore.userInfo.collectedFoods.slice(0, 6)"
                :key="foodId"
                class="collection-item"
                @click="viewFoodDetail(foodId)"
              >
                <div class="collection-media">
                  <img :src="getFoodImage(foodId)" 
                       :alt="getFoodName(foodId)"
                       class="collection-image"
                       @error="onCollectionImageError">
                  <div class="collection-region">{{ getFoodRegionLine(foodId) }}</div>
                </div>
                <div class="collection-info">
                  <h4>{{ getFoodName(foodId) }}</h4>
                  <p class="collection-flavor">{{ getFoodFlavor(foodId) }}</p>
                </div>
                <button
                  type="button"
                  class="uncollect-btn"
                  title="取消收藏"
                  @click.stop="uncollect(foodId)"
                >
                  取消收藏
                </button>
              </div>
            </div>
            <!-- 暂未实现 /collections 页面：避免出现无效入口 -->
          </div>
          
          <!-- 学习记录 -->
          <div class="study-record-section">
            <h2>学习记录</h2>
            <div class="record-list">
              <div class="record-item">
                <div class="record-content">
                  <div class="record-title">连续学习天数</div>
                  <div class="record-value">{{ userStore.userInfo.studyDays }} 天</div>
                </div>
              </div>
              <div class="record-item">
                <div class="record-content">
                  <div class="record-title">累计答题</div>
                  <div class="record-value">{{ userStore.userInfo.completedQuizzes.length }} 题</div>
                </div>
              </div>
              <div class="record-item">
                <div class="record-content">
                  <div class="record-title">总经验值</div>
                  <div class="record-value">{{ userStore.userInfo.experience }} 点</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useDataStore } from '@/stores/data'
import RecreateChallenge from '@/components/academy/RecreateChallenge.vue'
import { withBase } from '@/utils/assets'

const router = useRouter()
const userStore = useUserStore()
const dataStore = useDataStore()

// 状态
const selectedAnswer = ref(null)
const showResult = ref(false)
const isAnswerCorrect = ref(false)

// 计算属性
const userInitials = computed(() => {
  if (userStore.isLoggedIn && userStore.userInfo.username) {
    return userStore.userInfo.username.charAt(0)
  }
  return 'U'
})

// 成就数据
const badges = ref([
  { id: 1, name: '初探美食', icon: '🍜', description: '收藏第一道美食' },
  { id: 2, name: '节气学者', icon: '📅', description: '了解所有节气美食' },
  { id: 3, name: '地图探索者', icon: '🗺️', description: '探索5个省份' },
  { id: 4, name: '美食收藏家', icon: '⭐', description: '收藏10道美食' },
  { id: 5, name: '答题达人', icon: '🧠', description: '答对10道题' },
  { id: 6, name: '文化传承者', icon: '📚', description: '学习30天' }
])

// 测试题目
const quizQuestion = ref({
  id: 1,
  question: '以下哪道菜是川菜的代表作？',
  options: ['北京烤鸭', '麻婆豆腐', '白切鸡', '西湖醋鱼'],
  correctAnswer: 1
})

// 页面加载
onMounted(() => {
  if (userStore.isLoggedIn) {
    // 增加学习天数
    const today = new Date().toDateString()
    const lastStudy = localStorage.getItem('lastStudyDay')
    if (lastStudy !== today) {
      userStore.userInfo.studyDays += 1
      localStorage.setItem('lastStudyDay', today)
      userStore.saveToLocalStorage()
    }
  }
})

// 快速返回地图
const goHome = () => {
  router.push('/map')
}

const uncollect = (foodId) => {
  const ok = userStore.uncollectFood(String(foodId))
  if (ok) {
    // no-op: keep UX quiet, just update list
  }
}

// 登出
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    Promise.resolve(userStore.logout()).finally(() => {
      router.replace({ name: 'academy-login', query: { redirect: '/academy' } })
    })
  }
}

// 检查成就是否解锁
const isBadgeUnlocked = (badgeId) => {
  return userStore.userInfo.unlockedBadges.includes(badgeId)
}

// 选择答案
const selectAnswer = (index) => {
  selectedAnswer.value = index
  showResult.value = false
}

// 提交答案
const submitAnswer = () => {
  if (selectedAnswer.value === null) return
  
  isAnswerCorrect.value = selectedAnswer.value === quizQuestion.value.correctAnswer
  showResult.value = true
  
  if (isAnswerCorrect.value) {
    // 记录答题
    userStore.completeQuiz(quizQuestion.value.id, 10)
    
    // 检查是否解锁答题成就
    if (userStore.userInfo.completedQuizzes.length >= 10) {
      userStore.unlockBadge(5) // 答题达人成就
    }
  }
  
  // 3秒后重置
  setTimeout(() => {
    selectedAnswer.value = null
    showResult.value = false
    // 加载下一题
    loadNextQuestion()
  }, 3000)
}

// 加载下一题
const loadNextQuestion = () => {
  // 这里可以从题库中随机选择下一题
  // 目前使用固定的演示题目
  quizQuestion.value = {
    id: 2,
    question: '以下哪个节气是春季的第一个节气？',
    options: ['立春', '雨水', '惊蛰', '春分'],
    correctAnswer: 0
  }
}

// 查看美食详情
const viewFoodDetail = (foodId) => {
  router.push({ name: 'dish-detail', params: { id: String(foodId) } })
}

// 获取美食图片
const findDish = (foodId) =>
  dataStore.dishes.find((d) => String(d.id) === String(foodId))

const getFoodImage = (foodId) => {
  const dish = findDish(foodId)
  return dish?.image || withBase('/images/default-dish.jpg')
}

// 获取美食名称
const getFoodName = (foodId) => {
  const dish = findDish(foodId)
  return dish?.name || '未知美食'
}

// 获取美食口味
const getFoodFlavor = (foodId) => {
  const dish = findDish(foodId)
  return dish?.flavor || '未知口味'
}

const onCollectionImageError = (event) => {
  const img = event.target
  img.onerror = null
  img.src = withBase('/images/default-dish.jpg')
}

// 所属区域文案（与首页 DishCard 一致，图片正下方展示）
const getFoodRegionLine = (foodId) => {
  const dish = findDish(foodId)
  if (!dish) return '所属区域 · —'
  const p = dataStore.provinces.find((x) => x.id === dish.provinceId)
  const provName = p?.name || dish.province || ''
  if (dish.city && provName) {
    return `${dish.city} · ${provName}`
  }
  if (dish.region) {
    return `所属区域 · ${dish.region}`
  }
  if (p) {
    return `所属区域 · ${p.name}（${p.region}）`
  }
  return '所属区域 · 中国'
}
</script>

<style scoped>
.academy-page {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: calc(100vh - 140px);
  min-height: calc(100dvh - 140px);
  box-sizing: border-box;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 36px;
  background: linear-gradient(135deg, #2A6EBB, #8B4513);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
}

.page-header p {
  color: #666;
  font-size: 16px;
}

.academy-content {
  width: 100%;
}

.academy-layout.edu {
  max-width: 1200px;
  margin: 0 auto;
}

.dash-hero {
  max-width: 1200px;
  margin: 0 auto 14px;
  padding: 16px 16px;
  border-radius: 18px;
  background: radial-gradient(900px 420px at 12% 20%, rgba(42, 110, 187, 0.18), transparent 62%),
    radial-gradient(700px 360px at 90% 28%, rgba(139, 69, 19, 0.14), transparent 60%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.86));
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
}

.dash-kicker {
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.18em;
  color: rgba(42, 110, 187, 0.78);
}

.dash-title {
  margin: 6px 0 6px;
  font-size: clamp(20px, 2vw, 28px);
  font-weight: 900;
  color: rgba(26, 24, 22, 0.92);
}

.dash-sub {
  margin: 0;
  color: rgba(58, 48, 38, 0.7);
  font-size: 13px;
  line-height: 1.7;
}

.dash-progress {
  margin-top: 12px;
  max-width: 520px;
}

.dash-progress-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: 800;
  color: rgba(26, 24, 22, 0.72);
  margin-bottom: 8px;
}

.dash-progress-val {
  color: rgba(26, 24, 22, 0.86);
}

.dash-bar {
  height: 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.dash-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(135deg, #2a6ebb, #8b4513);
  transition: width 0.3s ease;
}

.dash-right {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.dash-btn {
  border: none;
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 900;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, #2a6ebb, #1f56a1);
  box-shadow: 0 10px 18px rgba(42, 110, 187, 0.22);
  transition: transform 0.18s ease;
}

.dash-btn.ghost {
  background: rgba(255, 255, 255, 0.9);
  color: rgba(26, 24, 22, 0.82);
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.06);
}

.dash-btn:hover {
  transform: translateY(-1px);
}

.academy-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 30px;
}

.user-sidebar {
  background-color: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
  width: 100%;
}

.user-avatar-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2A6EBB, #8B4513);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(42, 110, 187, 0.3);
}

.user-info {
  text-align: center;
}

.user-name {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c2c2c;
}

.user-level {
  font-size: 16px;
  color: #8B4513;
  font-weight: 500;
  padding: 4px 12px;
  background-color: #f5f1e8;
  border-radius: 20px;
  display: inline-block;
}

.user-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
  margin-bottom: 30px;
}

.stat-item {
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #2A6EBB;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #888;
}

.progress-section {
  width: 100%;
  margin-bottom: 30px;
}

.recreate-block {
  width: 100%;
  margin-bottom: 18px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: #2c2c2c;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #2A6EBB, #8B4513);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.logout-btn {
  width: 100%;
  padding: 12px;
  background-color: #f5f1e8;
  color: #8B4513;
  border: 2px solid #8B4513;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: auto;
}

.logout-btn:hover {
  background-color: #8B4513;
  color: white;
}

.learning-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.achievements-section,
.quiz-section,
.collection-section,
.study-record-section {
  background-color: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.achievements-section h2,
.quiz-section h2,
.collection-section h2,
.study-record-section h2 {
  font-size: 20px;
  color: #2A6EBB;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f5f1e8;
}

.badge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 20px;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px;
  border-radius: 12px;
  background-color: #f9f9f9;
  position: relative;
  transition: all 0.3s;
  opacity: 0.6;
  filter: grayscale(1);
}

.badge-item.unlocked {
  opacity: 1;
  filter: none;
  background-color: #f0f7ff;
  border: 2px solid #2A6EBB;
}

.badge-icon {
  font-size: 32px;
  margin-bottom: 5px;
}

.badge-name {
  font-size: 12px;
  text-align: center;
  color: #2c2c2c;
  font-weight: 500;
}

.badge-lock {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 12px;
  opacity: 0.5;
}

.quiz-card {
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 25px;
}

.quiz-question {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 20px;
  color: #2c2c2c;
  line-height: 1.5;
}

.quiz-options {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.quiz-option {
  padding: 15px 20px;
  background-color: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 15px;
  color: #2c2c2c;
}

.quiz-option:hover {
  border-color: #2A6EBB;
  background-color: #f0f7ff;
}

.quiz-option.selected {
  background-color: #2A6EBB;
  color: white;
  border-color: #2A6EBB;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #2A6EBB, #8B4513);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: box-shadow 0.3s;
  margin-bottom: 20px;
}

.submit-btn:hover:not(:disabled) {
  box-shadow: 0 4px 20px rgba(42, 110, 187, 0.3);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quiz-result {
  padding: 15px;
  border-radius: 8px;
}

.result-correct {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #2e7d32;
  background-color: #e8f5e9;
  padding: 12px 16px;
  border-radius: 8px;
}

.result-wrong {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #c62828;
  background-color: #ffebee;
  padding: 12px 16px;
  border-radius: 8px;
}

.result-icon {
  font-size: 20px;
}

.empty-collection {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
  opacity: 0.3;
}

.explore-link {
  display: inline-block;
  margin-top: 20px;
  color: #2A6EBB;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.explore-link:hover {
  color: #1e5ca3;
  text-decoration: underline;
}

.collection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.collection-item {
  display: flex;
  flex-direction: column;
  border: 2px solid #f5f1e8;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: #fff;
  position: relative;
}

.collection-item:hover {
  border-color: #2A6EBB;
}

.uncollect-btn {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 2;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 800;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.92);
  color: rgba(26, 24, 22, 0.8);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.uncollect-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.10);
  background: #fff;
}

.collection-media {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.collection-image {
  display: block;
  width: 100%;
  height: 120px;
  object-fit: contain;
  object-position: center;
  background: #f4f1eb;
  margin: 0;
  vertical-align: top;
}

.collection-region {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #5d4a35;
  text-align: center;
  line-height: 1.35;
  background: linear-gradient(180deg, #f5f1e8 0%, #ebe4d6 100%);
  border-top: 1px solid rgba(139, 69, 19, 0.12);
  border-bottom: 1px solid rgba(42, 110, 187, 0.08);
}

.collection-info {
  padding: 12px;
  flex: 1;
}

.collection-info h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #2c2c2c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.collection-flavor {
  font-size: 12px;
  color: #888;
  margin: 0;
}


.record-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.record-item {
  display: block;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 12px;
}

.record-content {
  flex: 1;
}

.record-title {
  font-size: 14px;
  color: #888;
  margin-bottom: 4px;
}

.record-value {
  font-size: 20px;
  font-weight: 700;
  color: #2A6EBB;
}

@media (max-width: 1200px) {
  .academy-layout {
    grid-template-columns: 1fr;
  }
  
  .user-sidebar {
    position: sticky;
    top: 20px;
    z-index: 10;
  }

  .dash-hero {
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .badge-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .collection-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .record-list {
    grid-template-columns: 1fr;
  }
}
</style>