# 测试指南 - 本地服务器运行

## ⚠️ 重要：必须使用本地服务器

由于 Service Worker 和 WebGL 的安全限制，**不能直接双击 `index.html` 打开**（file:// 协议）。

## 🚀 快速启动本地服务器

### 方法 1：Python（推荐，Windows 自带）
```powershell
# 在项目目录打开 PowerShell
python -m http.server 5500
# 或者使用 Python 启动器
py -m http.server 5500
```
然后访问：http://localhost:5500

### 方法 2：Node.js
```powershell
# 使用 serve（推荐）
npx serve -l 5500

# 或者使用 http-server
npx http-server -p 5500
```
然后访问：http://localhost:5500

### 方法 3：VS Code Live Server
1. 安装 VS Code 扩展：Live Server
2. 右键 `index.html` → "Open with Live Server"
3. 自动在浏览器打开

## ✅ 验证步骤

### 1. WebGL 星云背景
- ✅ 打开页面应该看到**紫蓝色星云** + 闪烁星点（WebGL 模式）
- ✅ 点击背景有**金色柔光脉冲**
- ✅ 滚动页面时银河带角度变化，有视差效果
- ✅ 控制台无 "clearRect" 或 "setTransform" 错误

### 2. 性能降级测试（可选）
在浏览器开发者工具 Console 输入：
```javascript
// 模拟低性能，触发 2D 降级
starField._fpsSamples = Array(20).fill(performance.now() - 1000);
```
几秒后应该看到自动切换到 2D 星点模式，无崩溃。

### 3. Service Worker 离线缓存
- ✅ 控制台显示："ServiceWorker 注册成功：./"
- ✅ 在 DevTools → Application → Service Workers 看到已激活的 worker
- ✅ 断网后刷新页面仍能显示（离线兜底）

如果是 `file://` 打开，会显示：
> 略过 Service Worker（需在 https 或 localhost 下运行）

这是**正常行为**，切换到本地服务器即可。

## 🎯 已修复的问题

1. **WebGL → 2D 降级崩溃**
   - ✅ 正确释放 WebGL 上下文
   - ✅ 方法代理确保外部调用继续工作
   - ✅ 2D 上下文获取失败时有兜底逻辑

2. **setTransform 错误**
   - ✅ `scaleCanvas` 识别上下文类型
   - ✅ 只对 2D 上下文调用 setTransform
   - ✅ WebGL 安全跳过

3. **Service Worker 注册失败**
   - ✅ 使用独立文件 `sw.js`（不再用 Blob）
   - ✅ 检查安全上下文（https/localhost）
   - ✅ file:// 协议时优雅跳过，不报错

## 🌟 推荐配置

**开发环境：** http://localhost:5500  
**生产环境：** GitHub Pages / Vercel / Netlify（自动 HTTPS）

享受你的星云背景吧！🌌✨
