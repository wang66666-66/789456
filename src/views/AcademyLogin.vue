<template>
  <div class="login-page">
    <div class="bg" />

    <header class="topbar">
      <div class="topbar-inner">
        <div class="logo-name-only">知味学堂</div>
        <nav class="top-links" aria-label="快捷入口">
          <button type="button" class="top-link" @click="goHome">地图探索</button>
          <button type="button" class="top-link" @click="goAcademy">学堂首页</button>
        </nav>
      </div>
    </header>

    <div class="shell">
      <section class="left" aria-label="学堂介绍">
        <div class="kicker">FOOD CULTURE ACADEMY</div>
        <h1 class="headline">像教育平台一样，系统学习中华美食文化</h1>
        <p class="desc">
          从“地图探索”到“学堂训练”，把每一道菜的历史、技法与文化语境串成你的学习路径。
        </p>

        <div class="bullets">
          <div class="bullet">
            <div class="b-text">
              <div class="b-title">学习进度可视化</div>
              <div class="b-sub">连续学习、经验值、阶段称号自动累计</div>
            </div>
          </div>
          <div class="bullet">
            <div class="b-text">
              <div class="b-title">每日小挑战</div>
              <div class="b-sub">用轻量测验巩固“节气 × 菜系 × 代表菜”</div>
            </div>
          </div>
          <div class="bullet">
            <div class="b-text">
              <div class="b-title">收藏即复习</div>
              <div class="b-sub">把喜欢的菜做成你的专属复习清单</div>
            </div>
          </div>
        </div>

      </section>

      <section class="card" aria-label="登录">
        <div class="card-title">
          <div class="t">登录到知味学堂</div>
          <div class="s">进入你的学习空间</div>
        </div>

        <el-form :model="form" :rules="rules" ref="formRef" label-position="top" class="form">
          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="form.email"
              placeholder="请输入邮箱"
              size="large"
              clearable
              @keyup.enter="submit"
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              placeholder="请输入密码"
              size="large"
              show-password
              type="password"
              @keyup.enter="submit"
            />
          </el-form-item>

          <div class="actions">
            <el-button class="btn primary" size="large" type="primary" :loading="loading" @click="submit">
              登录并进入
            </el-button>
          </div>

          <div class="divider">
            <span>或</span>
          </div>

          <button type="button" class="quick" @click="goHome">先逛逛地图探索</button>

          <div class="footer">
            <button type="button" class="link" @click="goRegister">没有账号？去注册</button>
            <button type="button" class="link" @click="goHome">← 返回地图探索</button>
          </div>
        </el-form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const redirectTo = computed(() => String(route.query.redirect || '/academy'))

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  email: '',
  password: ''
})

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const goHome = () => {
  router.push('/map')
}

const goAcademy = () => {
  router.push('/academy')
}

const goRegister = () => {
  router.push('/academy/register')
}

const submit = async () => {
  if (loading.value) return
  const ok = await formRef.value?.validate?.().catch(() => false)
  if (!ok) return

  loading.value = true
  try {
    await userStore.login(form.email, form.password)
    ElMessage.success('登录成功')
    router.replace(redirectTo.value)
  } catch (err) {
    ElMessage.error(err?.message || '登录失败，请检查后端服务')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  position: relative;
  /* 让登录页真正铺满可见区域（顶部导航已在页面内） */
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  overflow: hidden;
}

.bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(1100px 600px at 12% 18%, rgba(42, 110, 187, 0.10), transparent 58%),
    radial-gradient(900px 560px at 86% 16%, rgba(139, 69, 19, 0.09), transparent 60%),
    linear-gradient(180deg, #ffffff 0%, #f9f6f0 100%);
}

.topbar {
  position: relative;
  z-index: 2;
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
}

.topbar-inner {
  max-width: 100%;
  margin: 0 auto;
  padding: 12px clamp(10px, 1.6vw, 18px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.logo-name-only {
  font-weight: 900;
  color: rgba(26, 24, 22, 0.9);
  letter-spacing: 0.02em;
}

.top-links {
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.top-link {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.85);
  color: rgba(26, 24, 22, 0.82);
  padding: 8px 12px;
  border-radius: 999px;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease;
}

.top-link:hover {
  background: #fff;
  border-color: rgba(42, 110, 187, 0.25);
}

.shell {
  position: relative;
  z-index: 1;
  max-width: 100%;
  margin: 0 auto;
  padding: clamp(22px, 3.2vw, 44px) clamp(10px, 1.6vw, 18px);
  display: grid;
  grid-template-columns: 1.25fr minmax(420px, 520px);
  gap: clamp(18px, 3vw, 36px);
  align-items: stretch;
  /* 让左右两块不挤，内容区在页面中垂直居中 */
  min-height: calc(100vh - 72px);
  min-height: calc(100dvh - 72px);
  align-content: center;
}

.left {
  padding: 10px 2px;
  min-width: 0;
}

.kicker {
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.18em;
  color: rgba(42, 110, 187, 0.72);
}

.headline {
  margin: 10px 0 10px;
  font-size: clamp(26px, 3.1vw, 40px);
  font-weight: 900;
  color: rgba(26, 24, 22, 0.92);
  letter-spacing: -0.01em;
  line-height: 1.15;
}

.desc {
  margin: 0 0 16px;
  color: rgba(58, 48, 38, 0.72);
  font-size: 16px;
  line-height: 1.85;
}

.bullets {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.bullet {
  display: block;
  padding: 16px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.04);
}

.b-title {
  font-weight: 900;
  color: rgba(26, 24, 22, 0.86);
  line-height: 1.2;
}

.b-sub {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(58, 48, 38, 0.68);
}

.note {
  margin-top: 18px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(42, 110, 187, 0.06);
  border: 1px solid rgba(42, 110, 187, 0.12);
  color: rgba(44, 44, 44, 0.82);
  font-size: 12px;
  line-height: 1.7;
}

.card {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 26px 58px rgba(0, 0, 0, 0.11);
  padding: clamp(22px, 3.2vw, 34px);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 30px 66px rgba(0, 0, 0, 0.12);
}

.card-title .t {
  font-size: 20px;
  font-weight: 900;
  color: rgba(44, 44, 44, 0.92);
}

.card-title .s {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(58, 48, 38, 0.7);
}

.form {
  margin-top: 14px;
}

.form :deep(.el-form-item__label) {
  font-weight: 800;
  color: rgba(26, 24, 22, 0.78);
}

.form :deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.10);
  box-shadow: none;
  background: rgba(255, 255, 255, 0.92);
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.form :deep(.el-input__wrapper:hover) {
  border-color: rgba(42, 110, 187, 0.35);
}

.form :deep(.el-input__wrapper.is-focus) {
  border-color: rgba(42, 110, 187, 0.62);
  box-shadow: 0 0 0 4px rgba(42, 110, 187, 0.12);
  background: #fff;
}

.actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  width: 100%;
  border-radius: 12px;
  font-weight: 800;
}

.btn.primary {
  --el-color-primary: #2a6ebb;
  background: linear-gradient(135deg, #2a6ebb, #1f56a1);
  border: none;
}

.btn.ghost {
  background: rgba(248, 242, 232, 0.88);
  border: 1px solid rgba(0, 0, 0, 0.08);
  color: rgba(44, 44, 44, 0.9);
}

.btn.ghost:hover {
  border-color: rgba(42, 110, 187, 0.3);
}

.divider {
  margin: 16px 0 12px;
  position: relative;
  text-align: center;
  color: rgba(58, 48, 38, 0.55);
  font-size: 12px;
  font-weight: 800;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 44%;
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  display: inline-flex;
  padding: 0 10px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.quick {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.10);
  background: rgba(255, 255, 255, 0.72);
  color: rgba(26, 24, 22, 0.85);
  font-weight: 900;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.quick:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.9);
}

.footer {
  margin-top: 14px;
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.link {
  border: 1px solid rgba(42, 110, 187, 0.18);
  background: rgba(42, 110, 187, 0.06);
  padding: 8px 12px;
  border-radius: 999px;
  cursor: pointer;
  color: rgba(42, 110, 187, 0.9);
  font-weight: 800;
  transition: background 0.18s ease, border-color 0.18s ease;
}

.link:hover {
  background: rgba(42, 110, 187, 0.1);
  border-color: rgba(42, 110, 187, 0.35);
}

@media (max-width: 980px) {
  .shell {
    grid-template-columns: 1fr;
  }
  .top-links {
    display: none;
  }
}
</style>

