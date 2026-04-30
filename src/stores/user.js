import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'

const defaultUserInfo = () => ({
  id: null,
  username: '',
  email: '',
  avatar: '',
  level: '青铜食客',
  experience: 0,
  collectedFoods: [],
  completedQuizzes: [],
  unlockedBadges: [],
  studyDays: 0
})

export const useUserStore = defineStore('user', () => {
  // 用户状态
  const isLoggedIn = ref(false)
  const userInfo = ref(defaultUserInfo())
  
  // 计算属性
  const userLevel = computed(() => {
    const exp = userInfo.value.experience
    if (exp < 100) return '青铜食客'
    if (exp < 300) return '白银品味师'
    if (exp < 600) return '黄金美食家'
    if (exp < 1000) return '钻石鉴赏家'
    return '王者级饕餮'
  })
  
  const progressPercentage = computed(() => {
    const exp = userInfo.value.experience
    if (exp < 100) return (exp / 100) * 100
    if (exp < 300) return ((exp - 100) / 200) * 100
    if (exp < 600) return ((exp - 300) / 300) * 100
    if (exp < 1000) return ((exp - 600) / 400) * 100
    return 100
  })
  
  const quizEntryId = (entry) => (typeof entry === 'number' ? entry : entry?.id)

  const normalizeServerUser = (serverUser = {}) => ({
    ...defaultUserInfo(),
    ...serverUser,
    username: serverUser.username || '',
    email: serverUser.email || '',
    collectedFoods: Array.isArray(serverUser.collectedFoods) ? serverUser.collectedFoods : [],
    completedQuizzes: Array.isArray(serverUser.completedQuizzes) ? serverUser.completedQuizzes : [],
    unlockedBadges: Array.isArray(serverUser.unlockedBadges) ? serverUser.unlockedBadges : []
  })

  const apiRequest = async (path, options = {}) => {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data?.message || `请求失败 (${res.status})`)
    }
    return data
  }

  // 登录（Flask API）
  const login = async (email, password) => {
    const data = await apiRequest('/api/login', {
      method: 'POST',
      body: JSON.stringify({
        email: String(email || '').trim(),
        password: String(password || '')
      })
    })
    isLoggedIn.value = true
    userInfo.value = normalizeServerUser(data?.user)
    saveToLocalStorage()
    return true
  }

  // 注册（Flask API）
  const register = async ({ email, password, username = '' }) => {
    await apiRequest('/api/register', {
      method: 'POST',
      body: JSON.stringify({
        email: String(email || '').trim(),
        password: String(password || ''),
        username: String(username || '').trim()
      })
    })
    return true
  }
  
  // 登出
  const logout = async () => {
    try {
      await apiRequest('/api/logout', { method: 'POST' })
    } catch (_) {
      // 后端不可达时也允许本地退出，避免卡死在登录态
    }
    isLoggedIn.value = false
    userInfo.value = defaultUserInfo()
    localStorage.removeItem('userInfo')
    return true
  }
  
  // 收藏美食
  const collectFood = (foodId) => {
    if (!isLoggedIn.value) return false
    
    if (!userInfo.value.collectedFoods.includes(foodId)) {
      userInfo.value.collectedFoods.push(foodId)
      userInfo.value.experience += 5
      saveToLocalStorage()
      return true
    }
    return false
  }

  // 取消收藏
  const uncollectFood = (foodId) => {
    if (!isLoggedIn.value) return false
    const idx = userInfo.value.collectedFoods.indexOf(foodId)
    if (idx === -1) return false
    userInfo.value.collectedFoods.splice(idx, 1)
    saveToLocalStorage()
    return true
  }

  // 切换收藏（收藏/取消收藏）
  const toggleCollectFood = (foodId) => {
    if (!isLoggedIn.value) return { ok: false, collected: false }
    const exists = userInfo.value.collectedFoods.includes(foodId)
    if (exists) {
      uncollectFood(foodId)
      return { ok: true, collected: false }
    }
    collectFood(foodId)
    return { ok: true, collected: true }
  }
  
  // 完成答题
  const completeQuiz = (quizId, score) => {
    if (!isLoggedIn.value) return

    const done = userInfo.value.completedQuizzes.some(
      (q) => quizEntryId(q) === quizId
    )
    if (!done) {
      userInfo.value.completedQuizzes.push({ id: quizId, score })
      userInfo.value.experience += score
      saveToLocalStorage()
    }
  }
  
  // 解锁成就
  const unlockBadge = (badgeId) => {
    if (!isLoggedIn.value) return false
    
    if (!userInfo.value.unlockedBadges.includes(badgeId)) {
      userInfo.value.unlockedBadges.push(badgeId)
      userInfo.value.experience += 20
      saveToLocalStorage()
      return true
    }
    return false
  }
  
  // 保存到本地存储
  const saveToLocalStorage = () => {
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
  }
  
  // 从本地存储加载
  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('userInfo')
    if (saved) {
      try {
        userInfo.value = JSON.parse(saved)
        isLoggedIn.value = true
      } catch (e) {
        userInfo.value = defaultUserInfo()
        isLoggedIn.value = false
      }
    }
  }

  return {
    isLoggedIn,
    userInfo,
    userLevel,
    progressPercentage,
    register,
    login,
    logout,
    collectFood,
    uncollectFood,
    toggleCollectFood,
    completeQuiz,
    unlockBadge,
    saveToLocalStorage,
    loadFromLocalStorage
  }
})