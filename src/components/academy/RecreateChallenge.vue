<template>
  <section class="rc-wrap">
    <header class="rc-head">
      <div class="rc-title">
        <div class="t">复现挑战</div>
        <div class="s">发布你的作品 · 互动点赞评论</div>
      </div>

      <div class="rc-actions">
        <button type="button" class="btn primary" @click="openPublish">
          上传我的作品
        </button>
      </div>
    </header>

    <!-- 作品展示区 -->
    <div class="works">
      <article v-for="w in visibleWorks" :key="w.id" class="work-card">
        <div class="work-top">
          <div class="user">
            <div class="avatar" aria-hidden="true">{{ w.user.name.slice(0, 1) }}</div>
            <div class="meta">
              <div class="name">{{ w.user.name }}</div>
              <div class="time">{{ formatTime(w.createdAt) }}</div>
            </div>
          </div>
        </div>

        <div class="media">
          <img
            v-if="w.images?.length"
            class="thumb"
            :src="w.images[0]"
            :alt="w.desc"
            @error="onImgError"
          />
          <div v-else class="thumb placeholder">暂无图片</div>

          <div v-if="(w.images?.length || 0) > 1" class="more">+{{ w.images.length - 1 }}</div>
        </div>

        <div class="body">
          <p class="desc">{{ w.desc }}</p>

          <div v-if="w.ingredients?.length" class="tags">
            <span v-for="(tag, idx) in w.ingredients" :key="`${w.id}-tag-${idx}`" class="tag">{{ tag }}</span>
          </div>

          <div class="stats">
            <button
              type="button"
              class="icon-btn like-btn"
              :class="{ active: w.likedByMe }"
              @click="toggleWorkLike(w)"
              :title="w.likedByMe ? '取消点赞' : '点赞'"
            >
              <span class="ico" aria-hidden="true">♥</span>
              <span class="num">{{ w.likeCount }}</span>
            </button>

            <button type="button" class="icon-btn" @click="toggleComments(w)">
              <span class="text-label">评论</span>
              <span class="num">{{ commentCount(w) }}</span>
            </button>
          </div>
        </div>

        <!-- 评论区（每个作品独立） -->
        <div v-if="w.showComments" class="comments">
          <div class="comment-list">
            <div v-for="c in w.comments" :key="c.id" class="comment">
              <div class="c-avatar" aria-hidden="true">{{ c.user.name.slice(0, 1) }}</div>
              <div class="c-main">
                <div class="c-row">
                  <span class="c-name">{{ c.user.name }}</span>
                  <span class="c-time">{{ formatTime(c.createdAt) }}</span>
                </div>
                <div class="c-content">{{ c.content }}</div>
                <div class="c-actions">
                  <button
                    type="button"
                    class="c-btn"
                    :class="{ active: c.likedByMe }"
                    @click="toggleCommentLike(w, c)"
                  >
                    ♥ {{ c.likeCount }}
                  </button>
                  <button type="button" class="c-btn" @click="startReply(w, c)">回复</button>
                </div>

                <!-- 二级评论 -->
                <div v-if="c.replies?.length" class="replies">
                  <div v-for="r in c.replies" :key="r.id" class="reply">
                    <div class="c-avatar small" aria-hidden="true">{{ r.user.name.slice(0, 1) }}</div>
                    <div class="c-main">
                      <div class="c-row">
                        <span class="c-name">{{ r.user.name }}</span>
                        <span class="c-time">{{ formatTime(r.createdAt) }}</span>
                      </div>
                      <div class="c-content">{{ r.content }}</div>
                      <div class="c-actions">
                        <button
                          type="button"
                          class="c-btn"
                          :class="{ active: r.likedByMe }"
                          @click="toggleReplyLike(w, c, r)"
                        >
                          ♥ {{ r.likeCount }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 回复输入框 -->
                <div v-if="w.replyTo?.commentId === c.id" class="reply-box">
                  <input
                    v-model="w.replyTo.content"
                    class="input"
                    :placeholder="`回复 @${c.user.name}`"
                    maxlength="200"
                    @keyup.enter="publishReply(w, c)"
                  />
                  <button type="button" class="btn mini" :disabled="!w.replyTo.content.trim()" @click="publishReply(w, c)">
                    发布
                  </button>
                  <button type="button" class="btn mini ghost" @click="cancelReply(w)">取消</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 发布评论 -->
          <div class="comment-box">
            <input
              v-model="w.newComment"
              class="input"
              placeholder="写下你的评论…"
              maxlength="200"
              @keyup.enter="publishComment(w)"
            />
            <button type="button" class="btn mini" :disabled="!w.newComment.trim()" @click="publishComment(w)">
              发布
            </button>
          </div>
        </div>
      </article>

      <div class="load-more">
        <button type="button" class="btn ghost" :disabled="loadingMore || !hasMore" @click="loadMore">
          {{ !hasMore ? '没有更多了' : loadingMore ? '加载中…' : '加载更多' }}
        </button>
      </div>
    </div>

    <!-- 发布作品：模态框 -->
    <el-dialog v-model="publishOpen" title="上传我的复现" width="min(680px, 94vw)" :close-on-click-modal="false">
      <div class="publish">
        <div class="field">
          <div class="label">作品图片（可多张）</div>
          <input type="file" multiple accept="image/*" @change="onPickImages" />
          <div v-if="publish.images.length" class="previews">
            <div v-for="(src, idx) in publish.images" :key="`pv-${idx}`" class="pv">
              <img :src="src" alt="preview" @error="onImgError" />
              <button type="button" class="pv-del" @click="removePickedImage(idx)">×</button>
            </div>
          </div>
        </div>

        <div class="field">
          <div class="label">文字描述（最多200字）</div>
          <el-input
            v-model="publish.desc"
            type="textarea"
            :rows="4"
            maxlength="200"
            show-word-limit
            placeholder="说说你复现过程中的小心得…"
          />
        </div>

        <div class="field">
          <div class="label">使用的食材（可选，逗号分隔）</div>
          <input
            v-model="publish.ingredientsText"
            class="input"
            placeholder="例如：咸肉, 春笋, 姜, 葱"
            maxlength="200"
          />
        </div>
      </div>

      <template #footer>
        <el-button @click="publishOpen = false">取消</el-button>
        <el-button type="primary" :loading="publishing" :disabled="!canPublish" @click="submitPublish">
          发布作品
        </el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

/**
 * 后续对接后端时：
 * - dishId 用于请求某一道菜的复现作品列表
 * - 所有 mock 的 “apiXxx” 函数替换为真实 API 调用即可
 */
const props = defineProps({
  dishId: { type: String, default: 'hb_wuhan_1' }
})

const publishOpen = ref(false)
const publishing = ref(false)
const loadingMore = ref(false)

const pageSize = 4
const cursor = ref(0)
const hasMore = ref(true)

const publish = reactive({
  images: [],
  desc: '',
  ingredientsText: ''
})

function openPublish() {
  publishOpen.value = true
}

function resetPublish() {
  publish.images = []
  publish.desc = ''
  publish.ingredientsText = ''
}

const canPublish = computed(() => publish.images.length > 0 && publish.desc.trim().length > 0)

function onPickImages(e) {
  const files = Array.from(e.target.files || [])
  for (const f of files) {
    const url = URL.createObjectURL(f)
    publish.images.push(url)
  }
  e.target.value = ''
}

function removePickedImage(idx) {
  const url = publish.images[idx]
  publish.images.splice(idx, 1)
  try {
    URL.revokeObjectURL(url)
  } catch {
    // ignore
  }
}

function onImgError(ev) {
  const img = ev.target
  img.onerror = null
  img.src = '/images/default-dish.jpg'
}

function nowIso() {
  return new Date().toISOString()
}

function formatTime(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleString()
  } catch {
    return String(iso || '')
  }
}

function uid(prefix) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

// ---------------------------
// Mock 数据（演示用）
// ---------------------------
const works = ref([])

// 分页展示（这里只做“加载更多”演示；对接后端后换成真实分页）
const visibleWorks = computed(() => works.value.filter((w) => String(w.dishId) === String(props.dishId)))

function commentCount(w) {
  const top = w.comments?.length || 0
  const replies = (w.comments || []).reduce((sum, c) => sum + (c.replies?.length || 0), 0)
  return top + replies
}

function toggleComments(w) {
  w.showComments = !w.showComments
}

function toggleWorkLike(w) {
  w.likedByMe = !w.likedByMe
  w.likeCount += w.likedByMe ? 1 : -1
}

function toggleCommentLike(w, c) {
  c.likedByMe = !c.likedByMe
  c.likeCount += c.likedByMe ? 1 : -1
}

function toggleReplyLike(w, c, r) {
  r.likedByMe = !r.likedByMe
  r.likeCount += r.likedByMe ? 1 : -1
}

function startReply(w, c) {
  w.replyTo = { commentId: c.id, content: '' }
}

function cancelReply(w) {
  w.replyTo = null
}

async function publishComment(w) {
  const content = String(w.newComment || '').trim()
  if (!content) return

  // 乐观更新：先插入评论，再模拟延迟
  const optimistic = {
    id: uid('c'),
    user: { id: 'me', name: '我' },
    createdAt: nowIso(),
    content,
    likedByMe: false,
    likeCount: 0,
    replies: []
  }
  w.comments.unshift(optimistic)
  w.newComment = ''

  await sleep(500)
}

async function publishReply(w, parentComment) {
  const content = String(w.replyTo?.content || '').trim()
  if (!content) return

  const optimistic = {
    id: uid('r'),
    user: { id: 'me', name: '我' },
    createdAt: nowIso(),
    content,
    likedByMe: false,
    likeCount: 0
  }
  parentComment.replies = parentComment.replies || []
  parentComment.replies.unshift(optimistic)
  w.replyTo = null

  await sleep(500)
}

async function submitPublish() {
  if (!canPublish.value) return
  publishing.value = true

  // 乐观更新：立即插入到列表顶部
  const optimistic = {
    id: uid('work'),
    dishId: String(props.dishId),
    user: { id: 'me', name: '我' },
    createdAt: nowIso(),
    images: [...publish.images],
    desc: publish.desc.trim(),
    ingredients: String(publish.ingredientsText || '')
      .split(/[，,]/)
      .map((x) => x.trim())
      .filter(Boolean),
    likedByMe: false,
    likeCount: 0,
    showComments: false,
    newComment: '',
    replyTo: null,
    comments: []
  }
  works.value.unshift(optimistic)

  await sleep(500)

  publishing.value = false
  publishOpen.value = false
  resetPublish()
}

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  await sleep(500)

  // 演示：假装只有两页
  cursor.value += 1
  if (cursor.value >= 1) hasMore.value = false
  loadingMore.value = false
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}
</script>

<style scoped>
.rc-wrap {
  width: 100%;
  border-radius: 18px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.rc-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: linear-gradient(135deg, rgba(194, 59, 34, 0.08), rgba(139, 90, 43, 0.06));
}

.rc-title .t {
  font-size: 16px;
  font-weight: 900;
  color: rgba(26, 24, 22, 0.92);
}

.rc-title .s {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 700;
  color: rgba(58, 48, 38, 0.68);
}

.btn {
  border: none;
  cursor: pointer;
  border-radius: 12px;
  font-weight: 900;
  padding: 10px 12px;
}

.btn.primary {
  color: #fff;
  background: linear-gradient(135deg, #1f1f1f, #000000);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.25);
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
}

.btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 22px rgba(0, 0, 0, 0.32);
  filter: brightness(1.05);
}

.btn.ghost {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(0, 0, 0, 0.10);
  color: rgba(26, 24, 22, 0.82);
}

.btn.mini {
  padding: 8px 10px;
  border-radius: 10px;
  background: linear-gradient(135deg, #1f1f1f, #000000);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #fff;
  transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease;
}

.btn.mini:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 16px rgba(0, 0, 0, 0.24);
  filter: brightness(1.05);
}

.btn.mini.ghost {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(0, 0, 0, 0.10);
  color: rgba(26, 24, 22, 0.82);
}

.works {
  padding: 12px;
  display: grid;
  gap: 12px;
}

.work-card {
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
}

.work-top {
  padding: 12px 12px 10px;
}

.user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: #fff;
  background: linear-gradient(135deg, #2a6ebb, #8b5a2b);
}

.name {
  font-weight: 900;
  color: rgba(26, 24, 22, 0.88);
}

.time {
  font-size: 12px;
  color: rgba(58, 48, 38, 0.62);
}

.media {
  position: relative;
  padding: 0 12px 12px;
}

.thumb {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: contain;
  object-position: center;
  background: #f4f1eb;
  border-radius: 14px;
  display: block;
}

.thumb.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(58, 48, 38, 0.55);
  background: #f5f0e6;
  border: 1px dashed rgba(0, 0, 0, 0.12);
}

.more {
  position: absolute;
  right: 18px;
  bottom: 18px;
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
}

.body {
  padding: 0 12px 12px;
}

.desc {
  margin: 0;
  color: rgba(26, 24, 22, 0.82);
  line-height: 1.7;
  font-size: 13px;
}

.tags {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  font-size: 12px;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 999px;
  background: rgba(245, 240, 230, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.06);
  color: rgba(58, 48, 38, 0.72);
}

.stats {
  margin-top: 12px;
  display: flex;
  gap: 10px;
}

.icon-btn {
  border: 1px solid rgba(0, 0, 0, 0.10);
  background: rgba(255, 255, 255, 0.92);
  border-radius: 999px;
  padding: 8px 12px;
  cursor: pointer;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(26, 24, 22, 0.82);
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease, color 0.16s ease;
}

.icon-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 14px rgba(0, 0, 0, 0.08);
}

.icon-btn.active {
  border-color: rgba(194, 59, 34, 0.40);
  color: #c23b22;
}

.like-btn {
  flex-direction: column;
  min-width: 56px;
  padding: 8px 8px;
  gap: 2px;
}

.like-btn .ico {
  font-size: 22px;
  line-height: 1;
}

.like-btn.active .ico {
  text-shadow: 0 2px 10px rgba(194, 59, 34, 0.35);
  transform: scale(1.12);
}

.text-label {
  font-size: 12px;
}

.ico {
  font-size: 14px;
}

.num {
  font-size: 12px;
}

.comments {
  padding: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(249, 246, 240, 0.65);
}

.comment {
  display: flex;
  gap: 10px;
  padding: 10px 0;
}

.c-avatar {
  width: 32px;
  height: 32px;
  border-radius: 12px;
  background: rgba(245, 240, 230, 1);
  border: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: rgba(58, 48, 38, 0.72);
  flex: 0 0 auto;
}

.c-avatar.small {
  width: 28px;
  height: 28px;
  border-radius: 10px;
}

.c-main {
  flex: 1;
  min-width: 0;
}

.c-row {
  display: flex;
  gap: 10px;
  align-items: baseline;
  justify-content: space-between;
}

.c-name {
  font-weight: 900;
  color: rgba(26, 24, 22, 0.82);
  font-size: 12px;
}

.c-time {
  font-size: 12px;
  color: rgba(58, 48, 38, 0.58);
  flex: 0 0 auto;
}

.c-content {
  margin-top: 6px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f5f0e6;
  color: rgba(26, 24, 22, 0.80);
  line-height: 1.65;
  font-size: 13px;
}

.c-actions {
  margin-top: 6px;
  display: flex;
  gap: 8px;
}

.c-btn {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 900;
  color: rgba(58, 48, 38, 0.70);
  padding: 4px 6px;
  border-radius: 10px;
}

.c-btn.active {
  color: #c23b22;
}

.replies {
  margin-top: 10px;
  padding-left: 14px;
  border-left: 2px solid rgba(0, 0, 0, 0.06);
}

.reply {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.comment-box,
.reply-box {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.input {
  flex: 1;
  min-width: 0;
  height: 40px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.10);
  background: rgba(255, 255, 255, 0.92);
  outline: none;
  font-weight: 700;
}

.input:focus {
  border-color: rgba(194, 59, 34, 0.35);
  box-shadow: 0 0 0 4px rgba(194, 59, 34, 0.10);
}

.load-more {
  display: flex;
  justify-content: center;
  padding: 6px 0 2px;
}

.publish .field {
  margin-bottom: 14px;
}

.publish .label {
  font-weight: 900;
  color: rgba(26, 24, 22, 0.82);
  font-size: 13px;
  margin-bottom: 8px;
}

.previews {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.pv {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.pv img {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  object-position: center;
  background: #f4f1eb;
}

.pv-del {
  position: absolute;
  right: 6px;
  top: 6px;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: none;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  cursor: pointer;
  font-weight: 900;
  line-height: 22px;
}

@media (max-width: 720px) {
  .previews {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>

