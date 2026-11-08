# SF Neighbor · 旧金山社区资源指南

一个无需账号、无需后端的轻量目录，帮助使用者找到免费餐食、成人收容服务和食品领取渠道。默认英文，可切换西班牙语、中文。资料最后核查：**2026-11-07（旧金山日期）**。

## 打开新版

在 Windows 双击 **`启动预览.cmd`**，然后使用 `http://127.0.0.1:4173`。保留启动窗口，关闭或按 Ctrl+C 可停止服务。启动器优先使用已安装的 Node.js，也能找到本机 Codex 附带的 Node.js。

也可以在项目目录运行：

```text
node tools/serve.cjs
```

直接双击 `index.html` 仍能看列表、筛选、切换语言、拨打电话、打开步行路线；内嵌地图不在 `file://` 模式请求 OSM 图块。原因是 OSM 要求网页提供有效 HTTP Referer。完整地图请通过上面的本地网址或 HTTPS 网站打开。手机定位需要 HTTPS（本机 localhost 测试除外）。

## 本次修改

- 保留原有 6 个服务地点，新增 Dolores Shelter Program、SF–Marin Food Bank 官方查询入口，共 8 项资源、7 个地图标记。Food Bank 是分发点查询服务，没有把仓库当作可直接领取食物的地点。
- 更新了电话、公开服务时间、收容申请流程和服务条件。每项资源有官方来源与核查日期；资料超过 30 天时提示重新确认。网站没有实时床位或库存数据。
- 按公开地址重新核对坐标。原 Sanctuary、St. Anthony’s、GLIDE、Mother Brown’s 等标记存在偏差；现在以地址匹配坐标展示，并明确标记仅为大致位置。核对记录见 `data/geocoding.json`（OpenStreetMap / ODbL）。
- 移除阻挡内容的封面、渐变动画、全屏固定背景和重复的规则式“AI 问答”。改为浅色高对比界面、明确电话入口、可键盘操作的控件及手机布局。
- 列表直接写入 HTML，无 JavaScript 也能读取。地图失败不影响求助信息。首屏不连接任何第三方脚本、字体或地图服务。
- Leaflet 1.9.4 存在项目本地，点击地图后才加载。使用 OSM 当前标准图块地址和版权署名。地图图块不预下载、不放入离线缓存，也不通过换域名绕过服务限制。
- 移除 Leaflet Routing Machine 默认演示服务器依赖。其路由配置不能保证真正的步行路线；现在以**完整地址**打开 Google Maps 步行路线，不自动发送用户定位坐标。
- 定位只由用户点击触发，计算直线距离而非步行距离；不保存、不上传定位数据，提供拒绝、超时、精度低、城市范围外等提示。
- 可保存当前筛选结果为纯文字文件。成功联网访问并安装 Service Worker 后，已缓存目录可离线重新打开；地图、外部页面及路线仍需要网络。浏览器可能清理缓存，文字下载是另一个保留方式。
- 原文件备份在 `.original/`，不包含在发布包中。旧 `css/index.html` 转向主入口；原来含虚构地点的未使用 `js/location.js` 已退役。

## 资料与重要修正

| 资源 | 核实后的处理 | 主要依据 |
| --- | --- | --- |
| Next Door / MSC-South / Sanctuary | 标记市政府成人收容预约候补流程，不再声称可以随时直接入住，也不暗示有空床 | [SF 2026 官方服务指引 PDF](https://media.api.sf.gov/documents/HRC_Community_Guidance_2026.pdf)、[Next Door 项目说明](https://media.api.sf.gov/documents/Agenda_Item_10_Five_Keys-Next_Door.pdf)、[SVDP 联系页](https://svdp-sf.org/contact-us/)、[ECS Sanctuary](https://www.ecs-sf.org/sanctuary) |
| GLIDE | 按官网更新三餐时段，保留早间特殊人群服务说明 | [GLIDE Daily Free Meals](https://www.glide.org/programs/daily-free-meals/) |
| St. Anthony’s | 更新早餐开始、午餐及工作日外带餐时段；不杜撰早餐结束时间 | [Dining Room](https://www.stanthonysf.org/services/dining-room/) |
| Mother Brown’s | 使用当前运营方 Felton Institute 的信息，区分周末与工作日晚餐，说明基本登记要求 | [Felton Institute](https://felton.org/social-services/adult/mother-browns-kitchen/) |
| Dolores Shelter Program | 增加成人现场排队选择，明确先到先服务、视床位而定 | [Mission Action](https://www.missionaction.org/our-work/housing-shelter/) |
| SF–Marin Food Bank | 链接官方领取点查询，不硬编码可能变化的各站排期 | [Find Food](https://www.sfmfoodbank.org/find-food/) |

核查基于公开官网资料，不等同电话确认或实地核查。市政府部分网页有浏览器验证，因此同时保留官方 PDF 依据与电话入口。翻译为辅助摘要；机构名称和地址保留英文方便问路。

## 日后更新

1. 修改 `data/resources.json`。`en/es/zh` 分别存放时间、说明和电话用途；`sources` 保存对应官方来源。只有真的重新核查后才更改 `checked` 日期。
2. 界面模板在 `src/index.html`，样式在 `css/site.css`，交互在 `js/app.js`，翻译及共享渲染函数在 `js/core.js`。
3. 运行 `node tools/build.cjs`。它生成 `index.html` 和带内容版本号的 `sw.js`，避免手工修改生成文件后丢失改动。
4. 运行 `node --test tests/core.test.cjs`；若有 Playwright 和 Chrome，运行 `node tests/browser.cjs`。此电脑已用 Codex 附带的 Playwright 验证。

地图服务配置目前在 `js/app.js` 的 `L.tileLayer` 调用。OSM 免费服务是 best-effort，不保证永不中断；应持续遵守[图块使用政策](https://operations.osmfoundation.org/policies/tiles/)。如网站访问量显著增加，选择符合预算和用途的图块服务。无论底图是否可用，列表、电话和外部路线都独立工作。

## 验证与发布

已通过 8 项数据/逻辑检查，以及 13 项隔离 Chromium 浏览器检查，覆盖筛选、搜索、翻译、模拟定位成功与拒绝、地图脚本和图块失败、文字下载、禁用存储、禁用 JavaScript、离线重新打开与 320/390px 手机布局。真实 OSM 图块返回 HTTP 200，七个标记可见。截图和测试记录在 `qa/`。

一轮本地模拟测试（390×844、CPU 4 倍降速、750 kbit/s 下载、150ms 延迟）中，启用 gzip 后首次内容绘制约 **0.94 秒**；核心 HTML/CSS/JS 压缩后合计约 **24.2 KiB**。这不是实体低端手机或生产网络的承诺。尚未在实际 Android/iOS 设备上验证，也未实测各机构的当天服务状态。

运行 `node tools/package.cjs` 会把可发布的静态文件放在 `dist/`。将 **dist 里的内容**部署到支持 HTTPS、gzip/Brotli 的静态托管即可；无需 API key。不要把 `.original/`、`tests/` 或整个工作目录直接发布。当前只修改了本地项目，尚未发布到公网。

第三方许可：`vendor/leaflet/LICENSE`。坐标及地图数据 © OpenStreetMap contributors，ODbL。
