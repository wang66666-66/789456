<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>关于知味集</h3>
        <p>用数字科技传承中华饮食文化，让传统美食焕发新的生机。</p>
      </div>
      
      <div class="footer-section">
        <h3>快速链接</h3>
        <ul>
          <li><router-link to="/">首页</router-link></li>
          <li><router-link to="/map">地图探索</router-link></li>
          <li><router-link to="/four-seasons-eight-cuisines">四时八珍</router-link></li>
          <li><router-link to="/solar-term">二十四节气</router-link></li>
          <li><router-link to="/academy">知味学堂</router-link></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3>联系方式</h3>
        <p>邮箱: 123456789@qq.com</p>
        <p>电话: 18571078582</p>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>© 2026 知味集 · 中华美食文化数字平台 | 版权所有</p>
    </div>
  </footer>
</template>

<script setup>
// 页脚组件
</script>

<style scoped>
.footer {
  width: 100%;
  box-sizing: border-box;
  /* 透明底部栏：不遮挡全局背景图 */
  background: transparent;
  /* 底部区域上方分隔线 */
  border-top: 1px solid #e0d6c8;
  color: rgba(26, 24, 22, 0.88);
  padding: clamp(10px, 1.4vw, 16px) clamp(8px, 1vw, 12px) clamp(6px, 1vw, 10px);
  margin-top: clamp(10px, 1.6vw, 20px);
}

.footer-content {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: clamp(8px, 1.6vw, 16px);
  margin-bottom: clamp(8px, 1.2vw, 12px);
}

.footer-section h3 {
  font-size: 13px;
  margin-bottom: 5px;
  font-weight: 800;
  color: #c23b22;
}

.footer-section p {
  color: rgba(26, 24, 22, 0.72);
  line-height: 1.45;
  margin-bottom: 4px;
  font-size: 12px;
}

.footer-section ul {
  list-style: none;
}

.footer-section li {
  margin-bottom: 3px;
  font-size: 12px;
}

.footer-section a {
  color: rgba(26, 24, 22, 0.78);
  text-decoration: none;
  transition: color 0.3s;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.65);
}

.footer-section a:hover {
  color: rgba(26, 24, 22, 0.95);
  text-decoration: underline;
}

.footer-bottom {
  text-align: center;
  padding-top: clamp(6px, 1vw, 10px);
  border-top: 1px solid rgba(0, 0, 0, 0.10);
  color: rgba(26, 24, 22, 0.62);
  font-size: 11px;
}

.footer-bottom p {
  margin: 0;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}
</style>