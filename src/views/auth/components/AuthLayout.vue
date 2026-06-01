<template>
  <div class="auth-container">
    <div class="auth-brand">
      <div class="auth-brand-inner">
        <div class="auth-logo">H</div>
        <h1 class="auth-title">Hei PC</h1>
        <p class="auth-desc">面向公众的现代化服务平台</p>
      </div>
      <div class="auth-circle auth-circle-1" />
      <div class="auth-circle auth-circle-2" />
      <div class="auth-circle auth-circle-3" />
    </div>
    <div class="auth-form-panel">
      <div class="auth-form-inner">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
}

.auth-brand {
  position: relative;
  display: none;
  flex: 1;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, var(--primary-color, #1677ff) 0%, #0a3d8f 100%);
}

.auth-brand-inner {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 40px;
}

.auth-logo {
  width: 72px;
  height: 72px;
  margin: 0 auto 24px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: #fff;
}

.auth-title {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px;
  letter-spacing: -0.5px;
}

.auth-desc {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
}

.auth-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.12;
}

.auth-circle-1 {
  width: 400px;
  height: 400px;
  background: #fff;
  top: -100px;
  right: -120px;
}

.auth-circle-2 {
  width: 280px;
  height: 280px;
  background: #fff;
  bottom: -60px;
  left: -80px;
}

.auth-circle-3 {
  width: 160px;
  height: 160px;
  background: #fff;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.auth-form-panel {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: var(--container-bg, #fff);
}

.auth-form-inner {
  width: 100%;
  max-width: 400px;
}

@media (min-width: 768px) {
  .auth-brand {
    display: flex;
  }
}

@media (max-width: 767px) {
  .auth-container {
    flex-direction: column;
  }

  .auth-brand {
    display: flex;
    padding: 32px 20px;
    min-height: 200px;
  }

  .auth-brand-inner {
    padding: 0;
  }

  .auth-logo {
    width: 56px;
    height: 56px;
    margin-bottom: 16px;
    font-size: 24px;
    border-radius: 14px;
  }

  .auth-title {
    font-size: 24px;
    margin-bottom: 8px;
  }

  .auth-form-panel {
    padding: 32px 20px;
    align-items: flex-start;
  }
}
</style>
