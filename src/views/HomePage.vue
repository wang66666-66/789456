<template>
  <div class="home-page">
    <header class="hero-banner reveal-item" role="banner" aria-label="首页横幅">
      <div
        class="hero-bg-parallax"
        aria-hidden="true"
        :style="{ transform: `translate3d(0, ${bannerTranslateY}px, 0)` }"
      >
        <div class="hero-bg-entry" :class="{ 'is-loaded': bannerLoaded }">
          <div class="hero-bg-contain" />
        </div>
      </div>
    </header>

    <main class="cards-wrap" aria-label="首页功能入口">
      <article
        v-for="card in cards"
        :key="card.title"
        class="entry-card reveal-item"
        :class="card.positionClass"
        role="button"
        tabindex="0"
        @click="go(card.path)"
        @keyup.enter="go(card.path)"
        :style="{ transitionDelay: `${card.delay}s` }"
      >
        <div class="card-icon" aria-hidden="true">
          <svg class="card-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
            <path :d="card.iconPath" />
          </svg>
        </div>
        <h2 class="card-title">{{ card.title }}</h2>
        <div class="card-subtitle">{{ card.subtitle }}</div>
        <p class="card-desc">{{ card.desc }}</p>
        <button
          type="button"
          class="explore-btn"
          @click.stop="go(card.path)"
        >
          {{ card.cta }}
        </button>
      </article>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const cards = [
  {
    iconPath:
      'M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2Zm0 2.2 6 2V19l-6-2V5.2Z',
    title: '地图探索',
    subtitle: '美食地图',
    desc: '点击任意省份，解锁当地代表性美食、文化典故与非遗技艺。从北京烤鸭到广东早茶，一张地图带你吃遍中国。',
    cta: '开启味觉之旅',
    positionClass: 'card-map',
    path: '/map',
    delay: 0
  },
  {
    iconPath:
      'M18 3c-6.2 1-10 5.8-10 11.2 0 2.9 1.3 5.2 3.7 6.8 1.3.9 3 .9 4.4.1 3.5-2 5.9-6.2 5.9-10.6V3Zm-8.5 12c1.8-.8 3.9-1.2 6.2-1.2v2c-2.1 0-4 .4-5.6 1.1-.5.2-1.1 0-1.4-.5-.2-.5 0-1.1.8-1.4Z',
    title: '四时八珍',
    subtitle: '顺时而食，不时不食',
    desc: '春食芽、夏食瓜、秋食果、冬食根。跟随二十四节气，品味当季最鲜美的食材与传统养生智慧。',
    cta: '品味四季',
    positionClass: 'card-season',
    path: '/season-cuisine',
    delay: 0.1
  },
  {
    iconPath:
      'M7 2h2v2h6V2h2v2h3v18H2V4h5V2Zm13 8H4v10h16V10Zm0-4H4v2h16V6Z',
    title: '二十四节气',
    subtitle: '光阴里的味道',
    desc: '立春咬春饼，清明吃青团，冬至煮饺子。每个节气都有专属的美食仪式感，探寻古人“与天地合其德”的饮食哲学。',
    cta: '走进节气',
    positionClass: 'card-solar',
    path: '/solar',
    delay: 0.2
  },
  {
    iconPath:
      'M12 3 1 8l11 5 9-4.1V17h2V8L12 3Zm0 12L4.3 11.5 12 8l7.7 3.5L12 15Zm-7 2.2V14l7 3 7-3v3.2c0 1.5-3.2 3.3-7 3.3s-7-1.8-7-3.3Z',
    title: '知味学堂',
    subtitle: '学食知味，以味传文',
    desc: '参与美食知识答题，赢取“食神”勋章；复现传统菜肴，上传你的作品，与同好交流切磋，成为真正的中华美食文化传承人。',
    cta: '开始学习',
    positionClass: 'card-academy',
    path: '/academy',
    delay: 0.3
  }
]

const go = (path) => {
  router.push(path)
}

// 1) 滚动入场动画（IntersectionObserver）
let io = null
onMounted(() => {
  const els = Array.from(document.querySelectorAll('.reveal-item'))
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        e.target.classList.add('is-in')
        io?.unobserve(e.target)
      }
    },
    { root: null, threshold: 0.12 }
  )
  els.forEach((el) => io?.observe(el))
  
  // 2) 视差滚动（Banner 背景图，系数 0.3）
  updateParallax()
  window.addEventListener('scroll', onScroll, { passive: true })

  // 让初始缩放过渡在首帧之后触发（1.2 -> 1，0.5s ease-out）
  requestAnimationFrame(() => {
    bannerLoaded.value = true
  })
})

onUnmounted(() => {
  io?.disconnect()
  io = null

  window.removeEventListener('scroll', onScroll)
  if (raf) window.cancelAnimationFrame(raf)
  raf = 0
})

const bannerTranslateY = ref(0)
const PARALLAX_FACTOR = 0.3
let raf = 0
const bannerLoaded = ref(false)

const updateParallax = () => {
  raf = 0
  // translateY: 让背景滚动慢于页面（0.3）
  bannerTranslateY.value = Math.round(window.scrollY * PARALLAX_FACTOR)
}

const onScroll = () => {
  if (raf) return
  raf = window.requestAnimationFrame(updateParallax)
}

</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: transparent;
}

.hero-banner {
  width: 100%;
  height: 100vh;
  min-height: 560px;
  background-color: transparent;
  position: relative;
  overflow: hidden;
}

.hero-banner::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 160px;
  pointer-events: none;
  /* 顶部渐变遮罩：让透明导航文字更清晰 */
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.42) 0%, rgba(0, 0, 0, 0) 100%);
  z-index: 2;
}

.hero-bg-parallax {
  position: absolute;
  inset: 0;
  will-change: transform;
  z-index: 1;
}

.hero-bg-entry {
  position: absolute;
  inset: 0;
  transform: scale(1.2);
  transition: transform 1.2s ease-out;
  will-change: transform;
}

.hero-bg-entry.is-loaded {
  transform: scale(1);
}

.hero-bg-contain {
  position: absolute;
  inset: 0;
  background: url('/images/bg/home-banner.jpg') center / cover no-repeat;
  background-color: #f9f6f0;
  opacity: 1;
}

.cards-wrap {
  width: 100%;
  margin: 0 auto;
  padding: 28px 16px 40px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-areas:
    'map season'
    'solar academy';
  gap: 28px;
}

.card-map {
  grid-area: map;
}

.card-season {
  grid-area: season;
}

.card-solar {
  grid-area: solar;
}

.card-academy {
  grid-area: academy;
}

.entry-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  padding: 22px 20px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  outline: none;
  position: relative;
  overflow: hidden;
  background-image: url('/images/home-cards-bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.entry-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.86);
  pointer-events: none;
}

.entry-card > * {
  position: relative;
  z-index: 1;
}

.entry-card:hover,
.entry-card:focus-visible {
  transform: translateY(-6px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.16);
}

.card-icon {
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: #c23b22;
}

.card-icon-svg {
  width: 48px;
  height: 48px;
  display: block;
}

.card-icon-svg path {
  fill: currentColor;
}

.card-title {
  margin: 0 0 8px;
  color: #c23b22;
  font-size: 22px;
  line-height: 1.25;
}

.card-subtitle {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: rgba(44, 44, 44, 0.7);
  margin-bottom: 10px;
}

.card-desc {
  margin: 0;
  color: #5a5a5a;
  font-size: 15px;
  line-height: 1.7;
  min-height: 92px;
}

.explore-btn {
  margin-top: 16px;
  border: 2px solid #c23b22;
  border-radius: 10px;
  padding: 10px 16px;
  background: transparent;
  color: #c23b22;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.explore-btn:hover {
  background: #c23b22;
  color: #fff;
}

/* 滚动入场动画 */
.reveal-item {
  opacity: 0;
  transform: translate3d(0, 20px, 0);
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.reveal-item.is-in {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

@media (max-width: 900px) {
  .cards-wrap {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-areas:
      'map season'
      'solar academy';
    gap: 20px;
    padding-top: 20px;
  }

  .card-title {
    font-size: 20px;
  }
}

@media (max-width: 640px) {
  .hero-banner {
    min-height: 420px;
  }

  .cards-wrap {
    grid-template-columns: 1fr;
    grid-template-areas:
      'map'
      'season'
      'solar'
      'academy';
  }
}
</style>
