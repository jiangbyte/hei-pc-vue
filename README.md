# Hei PC Vue

**Hei PC Vue** 是 HEI 快速开发框架的 Vue3 前台（C 端）解决方案，基于 Vue 3 + Vite + TypeScript + Ant Design Vue 构建。默认策略为公开访问，适用于面向公众的业务场景。

![Vue](https://img.shields.io/badge/Vue-3.5-brightgreen.svg)
![Vite](https://img.shields.io/badge/Vite-8.x-orange.svg)
![Ant Design Vue](https://img.shields.io/badge/Ant%20Design%20Vue-4.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)

## 简介

Hei PC Vue 与 Hei Gin 后端配套使用，作为前台（C 端）展示与交互界面。与 [Hei Admin Vue](https://github.com/jiangbyte/hei-admin-vue)（管理后台）不同，本项目面向公众用户，默认无需登录即可访问，按需接入用户认证体系。

**主要特点：**
- 公开访问策略，页面和接口默认对游客开放
- 复用 Hei Admin Vue 的技术架构与组件模式
- 接入 BIZ 业务字典树（公开接口），支持字典驱动的动态渲染
- 可选 C 端用户登录/注册（验证码、SM2 加密）
- 采用与 Admin 一致的 HTTP 封装、状态管理、字典工具链

## 技术栈

| 类型 | 技术 |
|------|------|
| 核心框架 | Vue 3.5+、Vite 8.x、TypeScript 5.x |
| UI 组件 | Ant Design Vue 4.x、@ant-design/icons-vue |
| 状态管理 | Pinia（pinia-plugin-persistedstate 持久化） |
| 路由 | Vue Router 4.x |
| HTTP 请求 | Alova 3.x（Fetch / XHR 双适配器） |
| 样式方案 | UnoCSS + Sass |
| 工具库 | @vueuse/core、Day.js |
| 加密 | sm-crypto（国密 SM2/SM3/SM4） |

## 功能模块

| 模块 | 说明 |
|------|------|
| 首页 | 公开首页，展示 BIZ 字典数据 |
| 关于 | 公共关于页面 |
| 登录 | C 端用户名密码登录（验证码 + SM2 加密） |
| 注册 | C 端用户注册 |
| 字典 | 公开 BIZ 业务字典树（无需认证） |

## 项目结构

```
hei-pc-vue/
├── public/                  # 静态资源
├── src/
│   ├── api/                # API 接口层（Alova）
│   │   ├── auth.ts         # 认证接口（登录/注册/验证码/SM2）
│   │   ├── client-user.ts  # C 端用户接口（个人信息）
│   │   └── dict.ts         # 字典接口（公开 BIZ 字典树）
│   ├── components/         # 公共组件
│   │   └── DictSelect.vue  # 字典选择组件（复用自 Admin）
│   ├── hooks/              # 自定义 Hooks（useMobile）
│   ├── layouts/            # 布局组件
│   │   ├── base-layout/    # 基础布局（公共 Header + Footer）
│   │   └── blank-layout/   # 空白布局（登录/注册页）
│   ├── router/             # 路由配置
│   ├── store/              # 状态管理（应用、认证、字典）
│   ├── styles/             # 全局样式
│   ├── types/              # TypeScript 类型定义
│   ├── utils/              # 工具函数
│   │   └── http/           # Alova 实例封装
│   ├── views/              # 页面组件
│   │   ├── auth/           # 登录/注册
│   │   ├── about/          # 关于我们
│   │   ├── error/          # 403/404
│   │   └── home/           # 首页
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── package.json            # 项目配置
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
├── uno.config.ts           # UnoCSS 配置
└── .env                    # 环境变量配置
```

## 快速开始

### 前置要求

- Node.js >= 22
- pnpm >= 9
- 后端服务已启动（[Hei Gin](https://github.com/jiangbyte/hei-gin) 或兼容后端）

### 启动开发

```bash
# 安装依赖
pnpm install

# 配置环境变量（.env 文件）
# VITE_API_BASE_URL=http://localhost:18885

# 启动开发服务
pnpm dev

# 构建生产包
pnpm build

# 预览构建结果
pnpm preview
```

> 开发时需确保后端服务已启动，`.env` 中的 `VITE_API_BASE_URL` 需指向后端地址（默认 `http://localhost:18885`）。

## 后端 API

本项目需要后端提供以下公开接口：

| 接口 | 说明 | 认证 |
|------|------|------|
| `GET /api/v1/public/biz-dict/tree` | BIZ 字典树 | 无需认证 |
| `GET /api/v1/public/c/captcha` | 验证码 | 无需认证 |
| `GET /api/v1/public/c/sm2/public-key` | SM2 公钥 | 无需认证 |
| `POST /api/v1/public/c/login` | 用户登录 | 无需认证 |
| `POST /api/v1/public/c/register` | 用户注册 | 无需认证 |
| `POST /api/v1/c/logout` | 退出登录 | 需 C 端 Token |
| `GET /api/v1/client-user/current` | 当前用户信息 | 需 C 端 Token |

## 与 Hei Admin Vue 的关系

Hei PC Vue 与 [Hei Admin Vue](https://github.com/jiangbyte/hei-admin-vue) 共享相同的基础技术栈和工具链：

- **HTTP 封装**: 相同的 Alova 实例配置、响应拦截、错误处理
- **字典工具**: 相同的 dictStore + dictTool 模式，仅数据源改为公开 BIZ 字典树
- **字典组件**: 可复用的 `DictSelect` 组件
- **状态管理**: 相同的 Pinia + persist 持久化方案

区别在于：
- Hei Admin Vue 需要登录后通过动态路由加载菜单和权限
- Hei PC Vue 默认公开访问，认证为可选功能

## 相关项目

| 项目 | 说明 |
|------|------|
| [Hei Admin Vue](https://github.com/jiangbyte/hei-admin-vue) | 管理后台前端（Vue 3） |
| [Hei Gin](https://github.com/jiangbyte/hei-gin) | Go 后端（Gin + Ent） |
| [Hei Boot](https://github.com/jiangbyte/hei-boot) | Java 单体应用（Spring Boot） |
| [Hei Cloud](https://github.com/jiangbyte/hei-cloud) | Java 微服务架构（Spring Cloud） |
| [Hei FastAPI](https://github.com/jiangbyte/hei-fastapi) | Python 后端（FastAPI） |

## 参与贡献

欢迎贡献代码或提出建议！

1. Fork 本仓库
2. 新建 `Feat_xxx` 分支
3. 提交代码
4. 创建 Pull Request

## 开源协议

本项目采用 [MIT License](LICENSE) 开源协议

## 联系方式

- [GitHub](https://github.com/jiangbyte/hei-pc-vue)

---

如果这个项目对你有帮助，请给一个 Star 支持！
