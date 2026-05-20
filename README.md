# 滑块拼图

> 经典滑块拼图游戏，随时随地，打开即玩！

## 在线体验

👉 **https://sliding-puzzle-game.pages.dev**

## 游戏简介

滑块拼图是一款基于 HTML5 Canvas 的经典益智游戏，采用原生 JavaScript 开发，无需安装，支持 PC、手机、平板等所有现代浏览器。

通过拖动滑块将图案恢复到完整状态，适合所有年龄段玩家。内置 AI 提示功能，卡关时一键获取最优解法。

## 功能特色

### 游戏玩法
- 🎮 **拖拽移动**：支持点击、触摸拖拽、滑动等多种操作方式
- 🔀 **20个精心设计的关卡**：4种主题 × 5个难度，循序渐进
- 🧩 **多难度递进**：3x3 → 4x4 → 5x5 → 6x6，从入门到精通
- ♻️ **重置功能**：一键恢复关卡初始状态
- ↩️ **撤销功能**：后悔了？随时撤回上一步操作

### 智能辅助
- 🤖 **AI 提示**：A* 算法自动求解，一键获取完整解题步骤
- 📋 **步骤缓存**：计算一次，整局游戏反复查看，零延迟
- 🏷️ **滑块编号**：每个滑块右下角标注编号，与提示步骤精准对应

### 技术亮点
- 📱 **全平台适配**：响应式设计，手机、平板、PC 完美适配
- ⚡ **高性能渲染**：HTML5 Canvas + 设备像素比适配，清晰流畅
- 📴 **PWA 离线支持**：首次加载后可离线游玩
- 🌐 **零依赖**：纯原生 JavaScript，无第三方框架

## 截图

*(待添加游戏截图)*

## 快速开始

### 在线游玩

直接访问部署地址即可，无需安装：

```
https://sliding-puzzle-game.pages.dev
```

### 本地开发

#### 前置要求
- Node.js 18.x 或更高版本
- npm 9.x 或更高版本

#### 安装与运行

```bash
# 克隆项目
git clone <repository-url>
cd sliding-puzzle-web

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

## 构建与部署

### 生产构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

### 部署到 Cloudflare Pages

1. 推送代码到 GitHub 仓库
2. 访问 https://pages.cloudflare.com
3. 创建项目 → 连接 GitHub 仓库
4. 配置：
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. 点击 "Save and Deploy"

### 部署到 Vercel

```bash
npm run deploy:vercel
```

### 部署到 Netlify

```bash
npm run deploy:netlify
```

## 开发脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产版本 |
| `npm run lint` | ESLint 代码检查 |
| `npm run lint:fix` | 自动修复代码问题 |
| `npm run format` | Prettier 格式化代码 |

## 项目结构

```
sliding-puzzle-web/
├── src/
│   ├── core/                    # 核心引擎
│   │   ├── canvas/
│   │   │   └── CanvasRenderer.js  # Canvas 渲染器
│   │   ├── puzzle/
│   │   │   └── PuzzleEngine.js    # 拼图游戏逻辑
│   │   ├── solver/
│   │   │   └── AStarSolver.js     # A* 寻路算法
│   │   └── input/
│   │       └── TouchHandler.js    # 触摸/鼠标输入处理
│   ├── config/
│   │   └── levels.config.js       # 关卡配置（20个关卡）
│   ├── utils/
│   │   └── svgGenerator.js        # SVG 占位图生成器
│   ├── styles/
│   │   ├── variables.css          # CSS 变量
│   │   ├── base.css               # 基础样式
│   │   ├── responsive.css         # 响应式布局
│   │   └── animations.css         # 动画效果
│   └── app.js                     # 应用入口
├── index.html                     # 页面入口
├── vite.config.js                 # Vite 配置
├── vercel.json                    # Vercel 部署配置
└── package.json
```

## 技术栈

| 技术 | 用途 |
|------|------|
| **HTML5 Canvas** | 游戏画面渲染 |
| **JavaScript ES6+** | 核心逻辑 |
| **CSS3** | UI 样式与动画 |
| **Vite** | 开发与构建工具 |
| **A* Algorithm** | AI 求解算法 |

## 浏览器兼容性

| 浏览器 | 最低版本 | 支持度 |
|--------|---------|--------|
| Chrome | 80+ | ✅ 完全支持 |
| Safari | 13+ | ✅ 完全支持 |
| Firefox | 78+ | ✅ 完全支持 |
| Edge | 80+ | ✅ 完全支持 |
| 微信浏览器 | 7.0+ | ✅ 完全支持 |

## 开发规范

提交信息格式：
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/your-feature`)
3. 提交更改 (`git commit -m 'feat: your feature description'`)
4. 推送分支 (`git push origin feature/your-feature`)
5. 创建 Pull Request

## 许可证

[MIT](./LICENSE)

## 更新日志

### v1.0.0 (2026-05-14)
- ✅ 核心拼图引擎
- ✅ Canvas 高清渲染
- ✅ 触摸/鼠标操作支持
- ✅ 20个关卡配置
- ✅ A* 智能提示
- ✅ 提示步骤缓存
- ✅ 撤销与重置功能
- ✅ PWA 离线支持
- ✅ 响应式设计
- ✅ 滑块编号水印

---

**如有问题或建议，欢迎提交 Issue。**
