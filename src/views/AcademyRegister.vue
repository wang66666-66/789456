<template>
  <div class="login-page">
    <div class="bg" />
    <header class="topbar">
      <div class="topbar-inner">
        <div class="logo-name-only">知味学堂</div>
        <nav class="top-links" aria-label="快捷入口">
          <button type="button" class="top-link" @click="goLogin">学堂登录</button>
        </nav>
      </div>
    </header>

    <div class="shell">
      <section class="left" aria-label="注册说明">
        <div class="kicker">JOIN THE ACADEMY</div>
        <h1 class="headline">创建你的专属账号，开启知味学习之旅</h1>
        <p class="desc">
          加入知味学堂，构建你的个人学习档案与成长路径。
        </p>
        <div class="bullets">
          <div class="bullet">
            <div class="b-text">
              <div class="b-title">记录学习进度</div>
              <div class="b-sub">学习天数、经验值和成长等级实时更新</div>
            </div>
          </div>
          <div class="bullet">
            <div class="b-text">
              <div class="b-title">收藏美食清单</div>
              <div class="b-sub">把喜欢的菜品沉淀成你的专属复习库</div>
            </div>
          </div>
          <div class="bullet">
            <div class="b-text">
              <div class="b-title">解锁徽章与挑战</div>
              <div class="b-sub">在学堂持续完成任务，点亮你的成就体系</div>
            </div>
          </div>
        </div>
      </section>

      <section class="card" aria-label="注册">
        <div class="card-title">
          <div class="t">注册知味学堂账号</div>
          <div class="s">填写信息后即可登录学习</div>
        </div>

        <el-form :model="form" :rules="rules" ref="formRef" label-position="top" class="form">
          <el-form-item label="用户名（可选）" prop="username">
            <el-input
              v-model="form.username"
              placeholder="不填则默认取邮箱前缀"
              size="large"
              clearable
            />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" size="large" clearable />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              placeholder="请输入密码"
              size="large"
              show-password
              type="password"
            />
          </el-form-item>

          <div class="actions">
            <el-button class="btn primary" size="large" type="primary" :loading="loading" @click="submit">
              注册并登录
            </el-button>
            <el-button class="btn primary" size="large" type="primary" @click="goLogin">
              已有账号，去登录
            </el-button>
          </div>
        </el-form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
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

const goLogin = () => {
  router.push('/academy/login')
}

const goHome = () => router.push('/')

const submit = async () => {
  if (loading.value) return
  const ok = await formRef.value?.validate?.().catch(() => false)
  if (!ok) return

  loading.value = true
  try {
    await userStore.register({
      username: form.username,
      email: form.email,
      password: form.password
    })
    ElMessage.success('注册成功，请登录')
    router.replace('/academy/login')
  } catch (err) {
    ElMessage.error(err?.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  overflow: hidden;
}

.bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(1100px 600px at 12% 18%, rgba(42, 110, 187, 0.1), transparent 58%),
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
}

.top-link {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.85);
  color: rgba(26, 24, 22, 0.82);
  padding: 8px 12px;
  border-radius: 999px;
  font-weight: 800;
  cursor: pointer;
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
}

.bullet {
  display: block;
  padding: 16px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.b-title {
  font-weight: 900;
  color: rgba(26, 24, 22, 0.86);
}

.b-sub {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(58, 48, 38, 0.68);
}

.card {
  width: min(520px, calc(100% - 32px));
  position: relative;
  z-index: 1;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 26px 58px rgba(0, 0, 0, 0.11);
  padding: clamp(22px, 3.2vw, 34px);
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
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: none;
  background: rgba(255, 255, 255, 0.92);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.form :deep(.el-input__wrapper.is-focus) {
  border-color: rgba(42, 110, 187, 0.62);
  box-shadow: 0 0 0 4px rgba(42, 110, 187, 0.12);
}

.actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: 8px;
}
.btn {
  width: 100%;
  height: 44px;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-weight: 800;
}
.btn.primary {
  --el-color-primary: #2a6ebb;
  background: linear-gradient(135deg, #2a6ebb, #1f56a1);
  border: none;
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
