# SF Neighbor · 旧金山社区资源指南

帮助无家可归者在手机上找到 Food Bank、免费餐食、收容所、淋浴、厕所、诊所和住房援助，并能导航过去。纯静态网站，无需账号、无需后端、无需任何 API key。默认随手机语言显示英文、西班牙语或中文。资料核查日期：**2026-11-08（旧金山日期）**。

## 打开

在 Windows 双击 **`启动预览.cmd`**，然后使用 `http://127.0.0.1:4173`。也可以在项目目录运行 `node tools/serve.cjs`。

手机 GPS 必须通过 HTTPS 才能使用，本机预览只有在这台电脑上才算安全环境。要在真手机上试导航，需要先把 `dist/` 部署到支持 HTTPS 的静态托管。

## 功能

- 8 个分类：Food Bank、免费餐食、收容所、淋浴和日间中心、公共厕所、看病、住房援助、求助电话，共 166 个地点和电话。
- 点分类看到全部地点，可按邮编、街道搜索，按距离排序，按“现在开放”“接收新人”“不限邮编”“应急食物”筛选。
- 免费地图（Leaflet + OpenStreetMap），只在需要时加载，点地点就在地图上定位。
- “到这里去”提供两种方式：站内步行导航（路线、三语步骤、GPS 跟随、偏离重算、到达提示），或跳转 Google 地图自动开始导航。路程超过 40 分钟时提示公交方案。
- GPS 失败时可在地图上点选起点。路线服务失败时保留 Google 地图入口和重试。

## 资料从哪里来

| 内容 | 来源 | 更新方式 |
| --- | --- | --- |
| 77 个 Food Bank 站点 | [SF-Marin Food Bank 官方定位器](https://foodlocator.sfmfoodbank.org/) 公开数据 | 打开 Food Bank 分类时**实时读取官方数据**，读取失败时用保存的副本。 |
| 其余地点 | 市政府和机构官网，见每条“详情”里的来源 | 没有实时接口，运行 `node tools/verify-sources.cjs` 逐条对比官网。 |
| 坐标 | 街道地址来自市政 [EAS 地址库](https://data.sfgov.org/d/ramy-di5m)，路口和广场来自 OpenStreetMap | `node tools/geocode.cjs`，记录在 `data/geocoding.json`。 |

收容所的床位、食物余量没有任何公开的实时数据，所以页面只显示公布信息，并明确说明这一点。家暴庇护所地址依法保密，只显示热线，不显示地图标记。

## 日后更新

1. 定期运行 `node tools/refresh-foodbank.cjs` 刷新 Food Bank 副本，运行 `node tools/verify-sources.cjs` 查看官网上电话和地址是否变化。结果写入 `qa/verification.json`：`MISMATCH` 表示官网上找不到该电话或地址，需要人工确认。
2. 修改 `data/resources.json`，只有真的重新核查后才改 `checked` 日期。新增地址后运行 `node tools/geocode.cjs` 补坐标。
3. 界面模板在 `src/index.html`，样式在 `css/site.css`，主逻辑在 `js/app.js`，地图导航在 `js/nav.js`，文案和共用函数在 `js/core.js`。
4. 运行 `node tools/build.cjs` 生成 `index.html`、三个纯文字版页面和 `sw.js`。
5. 运行 `node --test tests/core.test.cjs` 和 `node tests/browser.cjs`。`node tests/live-map.cjs` 会真实访问地图和路线服务，只在需要时手动运行。
6. 运行 `node tools/sync-repo.cjs`，然后在 GitHub Desktop 里提交并 Push，线上网站几分钟后更新。

## 发布

线上网站是 https://sf-vulnerable-hub.vercel.app ，由 GitHub 仓库 `lisirith/sf-vulnerable-hub` 的 `main` 分支自动部署到 Vercel。本机克隆在 `文档\GitHub\sf-vulnerable-hub`。

FOSSGIS 路线服务的使用条款要求网站上有运营者的联系邮箱。`data/resources.json` 的 `contactEmail` 为空时，站内步行导航自动关闭，只提供 Google 地图。填写邮箱并重新运行 `node tools/sync-repo.cjs` 后，站内导航和页脚邮箱会自动出现。

`node tools/sync-repo.cjs` 会打包网站，把成品放到仓库根目录，把项目源码放到仓库的 `121121/`，并保留 Google 验证文件 `googlec61804f1f8ef0124.html`。`.original/` 和本机设置不会进入仓库。

## 免费服务的限制

- 地图图块：[OpenStreetMap 图块政策](https://operations.osmfoundation.org/policies/tiles/)，不保证可用，禁止预下载和离线缓存。
- 路线：[FOSSGIS Valhalla](https://fossgis.de/arbeitsgruppen/osm-server/nutzungsbedingungen/)，每秒最多 1 次请求，禁止高流量网站使用，随时可能停止。
- 访问量明显增加时，需要换成自建或付费服务。地址都集中在 `js/nav.js` 开头两行。列表、电话和 Google 地图都不依赖这两项服务。

## 手机性能

为旧手机和有限流量设计：不用外部字体和图片，首屏不连接第三方，地图库和底图按需加载，地图标记用单一 canvas 绘制，列表每次渲染 25 条，导航时页面隐藏就停止 GPS。访问过一次后可离线重新打开目录。没有 JavaScript 或非常老的手机可用纯文字版。

测试记录在 `qa/`。模拟结果不等于真机表现，尚未在实体 Android 或 iPhone 上测试。

第三方许可：`vendor/leaflet/LICENSE`。地图数据和路线 © OpenStreetMap contributors，ODbL。
