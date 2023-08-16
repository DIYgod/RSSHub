import Route from '@site/src/components/Route';

# 🔄 程序更新

## Amazon {#amazon}

### Kindle 软件更新 {#amazon-kindle-ruan-jian-geng-xin}

<Route author="NavePnow" example="/amazon/kindle/software-updates" path="/amazon/kindle/software-updates" radar="1"/>

## AMD {#amd}

### 显卡驱动更新 {#amd-xian-ka-qu-dong-geng-xin}

<Route author="ysc3839" example="/amd/graphicsdrivers/731F/C0" path="/amd/graphicsdrivers/:id/:rid?" paramsDesc={['id', 'rid']}>

可从设备管理器查看 id 和 rid。如 `PCI\VEN_1002&DEV_731F&SUBSYS_05771043&REV_C1`，则 id 为 `731F`，rid 为 `C1`。

</Route>

## Android {#android}

### SDK Platform Tools release notes {#android-sdk-platform-tools-release-notes}

<Route author="nczitzk" example="/android/platform-tools-releases" path="/android/platform-tools-releases"/>

## Anki {#anki}

### Changes {#anki-changes}

<Route author="nczitzk" example="/anki/changes" path="/anki/changes"/>

## AnyTXT {#anytxt}

### Release Notes {#anytxt-release-notes}

<Route author="nczitzk" example="/anytxt/release-notes" path="/anytxt/release-notes"/>

## APKPure {#apkpure}

### 所有版本 {#apkpure-suo-you-ban-ben}

<Route author="maple3142" example="/apkpure/versions/jp.co.craftegg.band/jp" path="/apkpure/versions/:pkg/:region?" paramsDesc={['包名稱', '區域代號，預設為 `en`']} radar="1" anticrawler="1" puppeteer="1"/>

## App Center {#app-center}

### Release {#app-center-release}

<Route author="Rongronggg9" example="/app-center/release/cloudflare/1.1.1.1-windows/beta" path="/app-center/release/:user/:app/:distribution_group" paramsDesc={['用户', 'App 名称', '分发组']} radar="1" rssbud="1">

:::tip 提示

参数可从 Release 页的 URL 中提取: `https://install.appcenter.ms/users/:user/apps/:app/distribution_groups/:distribution_group`

:::

</Route>

## App Store/Mac App Store {#app-store%2Fmac-app-store}

### 应用更新 {#app-store%2Fmac-app-store-ying-yong-geng-xin}

<Route author="HenryQW" example="/appstore/update/cn/id444934666" path="/appstore/update/:country/:id" paramsDesc={['App Store 国家, 如 QQ 的链接为 https://apps.apple.com/cn/app/qq/id444934666?mt=8, 则 country 为 `cn`', 'App Store app id, 如 QQ 的链接为 https://apps.apple.com/cn/app/qq/id444934666?mt=8, 则 id 为 `id444934666`']}/>

### 价格更新（限免） {#app-store%2Fmac-app-store-jia-ge-geng-xin-%EF%BC%88-xian-mian-%EF%BC%89}

<Route author="HenryQW" example="/appstore/price/cn/mac/id1152443474" path="/appstore/price/:country/:type/:id" paramsDesc={['App Store 国家, 如 Squash 的链接为 https://apps.apple.com/cn/app/id1152443474, 则 country 为 `cn`', 'App 类型, `iOS` 或 `mac`', 'App Store app id, 必选, 如 Squash 的链接为 https://apps.apple.com/cn/app/id1152443474, 则 id 为 `id115244347`']}/>

### 内购价格更新（限免） {#app-store%2Fmac-app-store-nei-gou-jia-ge-geng-xin-%EF%BC%88-xian-mian-%EF%BC%89}

<Route author="HenryQW" example="/appstore/iap/cn/id953286746" path="/appstore/iap/:country/:id" paramsDesc={['App Store 国家, 必选, 如 Darkroom – Photo Editor 的链接为 https://apps.apple.com/cn/app/id953286746, 则 country 为 `cn`', 'App Store app id, 必选, 如 Darkroom – Photo Editor 的链接为 https://apps.apple.com/cn/app/id953286746, 则 id 为 `id953286746`']}/>

### 每日精品限免 / 促销应用（鲜面连线 by AppSo） {#app-store%2Fmac-app-store-mei-ri-jing-pin-xian-mian-%2F-cu-xiao-ying-yong-%EF%BC%88-xian-mian-lian-xian-by-appso%EF%BC%89}

<Route author="Andiedie" example="/appstore/xianmian" path="/appstore/xianmian"/>

### 最新限免（GoFans） {#app-store%2Fmac-app-store-zui-xin-xian-mian-%EF%BC%88gofans%EF%BC%89}

<Route author="HenryQW" example="/appstore/gofans" path="/appstore/gofans"/>

## aptonic {#aptonic}

### 新的 Dropzone 动作 {#aptonic-xin-de-dropzone-dong-zuo}

<Route author="HenryQW" example="/aptonic/action" path="/aptonic/action/:untested?" paramsDesc={['填写任意值，将会同时包括非官方的 Dropzone 动作']}/>

## Bandisoft {#bandisoft}

### 更新记录 {#bandisoft-geng-xin-ji-lu}

<Route author="nczitzk" example="/bandisoft/bandizip" path="/bandisoft/:id?/:lang?" paramsDesc={['软件 id，见下表，默认为 Bandizip', '语言，见下表，默认为英语']}>

软件 id

| Bandizip (Win) | Bandizip (Mac) | Honeycam | Honeyview |
| -------------- | -------------- | -------- | --------- |
| bandizip       | bandizip.mac   | honeycam | honeyview |

语言

| English | 中文 (简体) | 中文 (繁體) | 日本語 | Русский | Español | Français | Deutsch | Italiano | Slovenčina | Українська | Беларуская | Dansk | Polski | Português Brasileiro | Čeština | Nederlands | Slovenščina | Türkçe | ภาษาไทย | 한국어 |
| ------- | ----------- | ----------- | ------ | ------- | ------- | -------- | ------- | -------- | ---------- | ---------- | ---------- | ----- | ------ | -------------------- | ------- | ---------- | ----------- | ------ | ------- | ------ |
| en      | cn          | tw          | jp     | ru      | es      | fr       | de      | it       | sk         | uk         | be         | da    | pl     | br                   | cs      | nl         | sl          | tr     | th      | kr     |

</Route>

## Bilibili {#bilibili}

### 更新情报 {#bilibili-geng-xin-qing-bao}

<Route author="nczitzk" example="/bilibili/app/android" path="/bilibili/app/:id?" paramsDesc={['客户端 id，见下表，默认为安卓版']}>

| 安卓版  | iPhone 版 | iPad HD 版 | UWP 版 | TV 版          |
| ------- | --------- | ---------- | ------ | -------------- |
| android | iphone    | ipad       | win    | android_tv_yst |

## BlueStacks {#bluestacks}

### BlueStacks 5 版本日誌 {#bluestacks-bluestacks-5-ban-ben-ri-zhi}

<Route author="TonyRL" example="/bluestacks/release/5" path="/bluestacks/release/5" radar="1" anticrawler="1" puppeteer="1"/>

## Brave {#brave}

### Release Notes {#brave-release-notes}

<Route author="nczitzk" example="/brave/latest" path="/brave/latest"/>

## Bugly SDK {#bugly-sdk}

### 更新日志 {#bugly-sdk-geng-xin-ri-zhi}

<Route author="cielpy" example="/bugly/changelog/1" path="/bugly/changelog/:platform" paramsDesc={['平台类型, 必选, 1 为 Android, 2 为 iOS']}/>

## Cent Browser {#cent-browser}

### 更新日志 {#cent-browser-geng-xin-ri-zhi}

<Route author="hoilc" example="/centbrowser/history" path="/centbrowser/history"/>

## Checkra1n {#checkra1n}

### 新版本发布 {#checkra1n-xin-ban-ben-fa-bu}

<Route author="ntzyz" example="/checkra1n/releases" path="/checkra1n/releases"/>

## Chocolatey {#chocolatey}

### 软件更新 {#chocolatey-ruan-jian-geng-xin}

<Route author="woodgear" example="/chocolatey/software/GoogleChrome" path="/chocolatey/software"/>

## Chrome 网上应用店 {#chrome-wang-shang-ying-yong-dian}

### 扩展程序更新 {#chrome-wang-shang-ying-yong-dian-kuo-zhan-cheng-xu-geng-xin}

<Route author="DIYgod" example="/chrome/webstore/extensions/kefjpfngnndepjbopdmoebkipbgkggaa" path="/chrome/webstore/extensions/:id" paramsDesc={['扩展程序 id, 可在应用页 URL 中找到']} />

## Civitai {#civitai}

### Latest models {#civitai-latest-models}

<Route author="DIYgod" example="/civitai/models" path="/civitai/models"/>

### Model discussions {#civitai-model-discussions}

:::caution 注意

需要配置 `CIVITAI_COOKIE` 才可获取 NSFW 模型的图片信息

:::

<Route author="DIYgod" example="/civitai/discussions/4384" path="/civitai/discussions/:modelId"/>

## Clash {#clash}

### Premium Releases {#clash-premium-releases}

<Route author="ttttmr" example="/clash/premium" path="/clash/premium" radar="1" />

## CPUID {#cpuid}

### 新闻 {#cpuid-xin-wen}

<Route author="TonyRL" example="/cpuid/news" path="/cpuid/news" radar="1" rssbud="1"/>

## cpython {#cpython}

### 正式版本发布 {#cpython-zheng-shi-ban-ben-fa-bu}

<Route author="trim21" example="/cpython" path="/cpython" />

### 所有版本发布 {#cpython-suo-you-ban-ben-fa-bu}

<Route author="trim21" example="/cpython/pre" path="/cpython/pre" />

## CurseForge {#curseforge}

### 文件更新 {#curseforge-wen-jian-geng-xin}

<Route author="junfengP" example="/curseforge/sc2/assets/taylor-mouses-stuff/files" path="/curseforge/:gameid/:catalogid/:projectid/files" paramsDesc={['游戏名，以`https://www.curseforge.com/sc2/assets/taylor-mouses-stuff/files`为例，`sc2`代表星际2', '分类名，紧跟在游戏名后，如示例中`assets`', '项目名，紧跟在分类名后，如示例中`taylor-mouses-stuff`']}/>

例如：`https://www.curseforge.com/sc2/assets/taylor-mouses-stuff/files` 对应 `/curseforge/sc2/assets/taylor-mouses-stuff/files`

</Route>

## Ditto clipboard manager {#ditto-clipboard-manager}

### Changes {#ditto-clipboard-manager-changes}

<Route author="nczitzk" example="/ditto/changes" path="/ditto/changes/:type?" paramsDesc={['类型，可选 `beta`']}/>

## Docker Hub {#docker-hub}

### 镜像有新 Build {#docker-hub-jing-xiang-you-xin-build}

<Route author="HenryQW" example="/dockerhub/build/wangqiru/ttrss" path="/dockerhub/build/:owner/:image/:tag?" paramsDesc={['镜像作者', '镜像名称', '镜像标签，默认 latest']} radar="1" rssbud="1">

:::caution 注意

官方镜像的 owner 填写 library, 如: <https://rsshub.app/dockerhub/build/library/mysql>

:::

</Route>

### 镜像有新 Tag {#docker-hub-jing-xiang-you-xin-tag}

<Route author="outloudvi" example="/dockerhub/tag/library/mariadb" path="/dockerhub/tag/:owner/:image/:limits?" paramsDesc={['镜像作者', '镜像名称', 'tag 数量，默认为 10']} radar="1" rssbud="1">

:::caution 注意

官方镜像的 owner 填写 library, 如: <https://rsshub.app/dockerhub/tag/library/mysql>

:::

</Route>

## Eagle {#eagle}

### 更新日志 {#eagle-geng-xin-ri-zhi}

<Route author="tigercubden" example="/eagle/changelog" path="/eagle/changelog/:language?" paramsDesc={['语言，选项见下表，默认为 `cn`']} radar="1">

语言

| 简体中文 | 繁体中文 | 英文 |
| -------- | -------- | ---- |
| cn       | tw       | en   |

</Route>

## Everything {#everything}

### Changes {#everything-changes}

<Route author="nczitzk" example="/everything/changes" path="/everything/changes"/>

## F-Droid {#f-droid}

### App 更新 {#f-droid-app-geng-xin}

<Route author="garywill" example="/fdroid/apprelease/com.termux" path="/fdroid/apprelease/:app" paramsDesc={['App包名']} />

## fir.im 应用 {#fir.im-ying-yong}

### 更新 {#fir.im-ying-yong-geng-xin}

<Route author="cielpy" example="/fir/update/xcz" path="/fir/update/:id" paramsDesc={['fir app id, 必选, 如 fir 生成的链接地址为 https://fir.im/xcz, 则 id 为 `xcz`']}/>

## Firefox {#firefox}

### 新版本发布 {#firefox-xin-ban-ben-fa-bu}

<Route author="fengkx" example="/firefox/release/desktop" path="/firefox/release/:platform" paramsDesc={['操作平台']}>

| 桌面    | Android | Beta | Nightly | Android Beta | ESR           |
| ------- | ------- | ---- | ------- | ------------ | ------------- |
| desktop | android | beta | nightly | android-beta | organizations |

</Route>

### 附加组件 (Add-ons) 更新 {#firefox-fu-jia-zu-jian-(add-ons)-geng-xin}

<Route author="DIYgod" example="/firefox/addons/rsshub-radar" path="/firefox/addons/:id" paramsDesc={['附加组件 id, 可在应用页 URL 中找到']} />

## fish shell {#fish-shell}

### Release Notes {#fish-shell-release-notes}

<Route author="x2cf" example="/fishshell" path="/fishshell" radar="1" />

## FossHub {#fosshub}

### Software Update {#fosshub-software-update}

<Route author="nczitzk" example="/fosshub/qBittorrent" path="/fosshub/:id" paramsDesc={['软件 id，可在对应软件页 URL 中找到']}/>

## Greasy Fork {#greasy-fork}

### 脚本更新 {#greasy-fork-jiao-ben-geng-xin}

<Route author="imlonghao" example="/greasyfork/zh-CN/bilibili.com" path="/greasyfork/:language/:domain?" paramsDesc={['语言, 可在网站右上角找到, `all` 为所有语言', '按脚本生效域名过滤, 可选']} radar="1"/>

### 脚本版本历史 {#greasy-fork-jiao-ben-ban-ben-li-shi}

<Route author="miles170" example="/greasyfork/scripts/14178-ac-baidu-重定向优化百度搜狗谷歌必应搜索-favicon-双列/versions" path="/greasyfork/scripts/:script/versions" paramsDesc={['脚本 id，可在对应脚本页 URL 中找到']} radar="1" />

### 脚本反馈 {#greasy-fork-jiao-ben-fan-kui}

<Route author="miles170" example="/greasyfork/scripts/14178-ac-baidu-重定向优化百度搜狗谷歌必应搜索-favicon-双列/feedback" path="/greasyfork/scripts/:script/feedback" paramsDesc={['脚本 id，可在对应脚本页 URL 中找到']} radar="1" />

## Hugo {#hugo}

### 更新日志 {#hugo-geng-xin-ri-zhi}

<Route author="maokwen" example="/hugo/releases" path="/hugo/releases"/>

## iFi audio {#ifi-audio}

### Download Hub {#ifi-audio-download-hub}

<Route author="NavePnow" example="/ifi-audio/download/1503007035/44472" path="/ifi-audio/download/:val/:id" paramsDesc={['商品 val', '商品 id']}/>

:::caution 注意

1.  打开网站 <https://ifi-audio.com/download-hub> 并打开 Inspect -> Network 调试面板
2.  在网站中选择设备以及对应的 serial number，点击搜索
3.  在 Network 面板中找到最后一个 <https://ifi-audio.com/wp-admin/admin-ajax.php> 请求，查看 Payload 中的 val 和 id，填写在 url 中

:::

## ImageMagick {#imagemagick}

### Changelog {#imagemagick-changelog}

<Route author="nczitzk" example="/imagemagick/changelog" path="/imagemagick/changelog"/>

## Infuse {#infuse}

### Release Notes {#infuse-release-notes}

<Route author="NathanDai" example="/firecore/ios" path="/firecore/:os" paramsDesc={['`ios`,`tvos`,`macos`']}/>

## IPSW\.me {#ipsw%5C.me}

### 苹果固件更新 - IPSWs/OTAs 版本 {#ipsw%5C.me-ping-guo-gu-jian-geng-xin---ipsws%2Fotas-ban-ben}

<Route author="Jeason0228" example="/ipsw/index/ipsws/iPhone11,8" path="/ipsw/index/:ptype/:pname/" paramsDesc={['填写ipsws或otas，得到不同版本的固件','产品名，`http://rsshub.app/ipsw/index/ipsws/iPod`如填写iPad则关注iPad整个系列(ptype选填为ipsws).`http://rsshub.app/ipsw/index/ipsws/iPhone11,8`如果填写具体的iPhone11,8则关注这个机型的ipsws固件信息']}/>

## Logseq {#logseq}

:::caution
Logseq 开发团队已经放弃了 [旧网站](https://logseq.com/blog)。
请使用 <https://github.com/logseq/logseq/releases.atom> 代替。
:::

## MacKed {#macked}

### 应用更新 {#macked-ying-yong-geng-xin}

<Route author="HXHL" example="/macked/app/cleanmymac-x" path="/macked/app/:name" paramsDesc={['应用名, 可在应用页 URL 中找到']}/>

## MacUpdate {#macupdate}

### 更新 {#macupdate-geng-xin}

<Route author="TonyRL" example="/macupdate/app/11942" path="/macupdate/app/:appId/:appSlug?" paramsDesc={['应用 ID，可在 URL 找到', '应用名，可在 URL 找到']} radar="1"/>

## MacWk {#macwk}

### 应用更新 {#macwk-ying-yong-geng-xin}

<Route author="f48vj" example="/macwk/soft/sublime-text" path="/macwk/soft/:name" paramsDesc={['应用名，可在应用页 URL 中找到']} radar="1" rssbud="1"/>

## ManicTime {#manictime}

<Route author="nczitzk" example="/manictime/releases" path="/manictime/releases"/>

## Mathpix {#mathpix}

<Route author="nczitzk" example="/mathpix/blog" path="/mathpix/blog"/>

## Microsoft Edge {#microsoft-edge}

### 外接程序更新 {#microsoft-edge-wai-jie-cheng-xu-geng-xin}

<Route author="hoilc" example="/edge/addon/gangkeiaobmjcjokiofpkfpcobpbmnln" path="/edge/addon/:crxid" paramsDesc={['扩展 id，可在扩展页 URL 中找到']} />

## Microsoft Store {#microsoft-store}

### Updates {#microsoft-store-updates}

<Route author="hellodword" example="/microsoft-store/updates/9WZDNCRFHVN5/CN" path="/microsoft-store/updates/:productid/:market?" paramsDesc={['在 Store 中点击 `分享` - `复制链接` 即可获得', '默认为 `CN`']} />

## MIUI {#miui}

### MIUI 新版本发布 {#miui-miui-xin-ban-ben-fa-bu}

<Route author="Indexyz" example="/miui/aries" path="/miui/:device/:type?/:region?" paramsDesc={['设备的 `codename` 例如 小米 2s 为 `aries`. 国际版的 `codename` 一般以 `_global` 结尾. 可查阅 MIUI 线刷包下载页面', '类型', '地区, 默认为 `cn`']}>

| 类型   | type    |
| ------ | ------- |
| 稳定版 | release |
| 开发版 | dev     |

| 地区   | region |
| ------ | ------ |
| 国内版 | cn     |
| 国际版 | global |

</Route>

## Neat Download Manager {#neat-download-manager}

### Download {#neat-download-manager-download}

<Route author="nczitzk" example="/neatdownloadmanager/download" path="/neatdownloadmanager/download/:os?" paramsDesc={['操作系统，可选 windows 或 macos，默认为全部']}/>

## Not a Tesla App {#not-a-tesla-app}

### 特斯拉系统更新 {#not-a-tesla-app-te-si-la-xi-tong-geng-xin}

<Route author="mrbruce516" example="/notateslaapp/ota" path="/notateslaapp/ota" radar="1"/>

## NPM {#npm}

### 包 {#npm-bao}

<Route author="Fatpandac" example="/npm/package/rsshub" path="/npm/package/:name" paramsDesc={['包名']}/>

## Nvidia Web Driver {#nvidia-web-driver}

### 更新日志 {#nvidia-web-driver-geng-xin-ri-zhi}

<Route author="cielpy" example="/nvidia/webdriverupdate" path="/nvidia/webdriverupdate"/>

## O&O Software {#o%26o-software}

### Changelog {#o%26o-software-changelog}

<Route author="nczitzk" example="/oo-software/changelog/shutup10" path="/oo-software/changelog/:id" paramsDesc={['软件 id，见下表，默认为 shutup10，可在对应软件页中找到']}>

| Software       | Id          |
| -------------- | ----------- |
| O&O ShutUp10++ | shutup10    |
| O&O AppBuster  | ooappbuster |
| O&O Lanytix    | oolanytix   |
| O&O DeskInfo   | oodeskinfo  |

</Route>

## Obsidian {#obsidian}

### Announcements {#obsidian-announcements}

<Route author="nczitzk" example="/obsidian/announcements" path="/obsidian/announcements"/>

## OneNote Gem Add-Ins {#onenote-gem-add-ins}

### Release History {#onenote-gem-add-ins-release-history}

<Route author="nczitzk" example="/onenotegem/release" path="/onenotegem/release"/>

## OpenWrt {#openwrt}

### Releases {#openwrt-releases}

<Route author="DIYgod" example="/openwrt/releases/xiaomi/xiaomi_redmi_router_ac2100" path="/releases/:brand/:model" paramsDesc={['产品型号，可在 `Table of Hardware` -> `Device Page` 的 URL 中找到', '同上']}/>

## Postman {#postman}

### Release Notes {#postman-release-notes}

<Route author="nczitzk" example="/postman/release-notes" path="/postman/release-notes"/>

## Potplayer {#potplayer}

### 版本历史 {#potplayer-ban-ben-li-shi}

<Route author="nczitzk" example="/potplayer/update" path="/potplayer/update/:language?" paramsDesc={['语言，见下表，默认为英语']}>

| 한국어 | 中文 (简体) | 中文 (繁体) | ENGLISH | Українська | РУССКИЙ | Polski |
| ------ | ----------- | ----------- | ------- | ---------- | ------- | ------ |
| ko     | zh_CN       | zh_TW       | en      | uk         | ru      | pl     |

</Route>

## PuTTY {#putty}

### Change Log {#putty-change-log}

<Route author="nczitzk" example="/putty/changes" path="/putty/changes"/>

## qBittorrent {#qbittorrent}

### 消息 {#qbittorrent-xiao-xi}

<Route author="TonyRL" example="/qbittorrent/news" path="/qbittorrent/news" radar="1" rssbud="1"/>

## QNAP {#qnap}

### Release Notes {#qnap-release-notes}

<Route author="nczitzk" example="/qnap/release-notes/qts" path="/qnap/release-notes/:id" paramsDesc={['OS id，见下表']}>

| QTS | QuTS hero | QuTScloud | QuWAN Orchestrator | QES | TAS | AfoBot |
| --- | --------- | --------- | ------------------ | --- | --- | ------ |
| qts | quts_hero | qutscloud | quwan_orchestrator | qes | tas | afobot |

</Route>

## QQ 互联 SDK {#qq-hu-lian-sdk}

### 更新日志 {#qq-hu-lian-sdk-geng-xin-ri-zhi}

<Route author="nuomi1" example="/tencent/qq/sdk/changelog/iOS" path="/tencent/qq/sdk/changelog/:platform" paramsDesc={['平台，iOS / Android']}/>

## QTTabBar {#qttabbar}

### Change Log {#qttabbar-change-log}

<Route author="nczitzk" example="/qttabbar/change-log" path="/qttabbar/change-log"/>

## Quicker {#quicker}

### 版本更新 {#quicker-ban-ben-geng-xin}

<Route author="Cesaryuan nczitzk" example="/quicker/versions" path="/quicker/versions"/>

## RemNote {#remnote}

### 变更日志 {#remnote-bian-geng-ri-zhi}

<Route author="TonyRL" example="/remnote/changelog" path="/remnote/changelog" radar="1" rssbud="1"/>

## RescueTime {#rescuetime}

### Release Notes {#rescuetime-release-notes}

<Route author="nczitzk" example="/rescuetime/release-notes" path="/rescuetime/release-notes/:os?" paramsDesc={['OS id，见下表']}>

| Mac OS | Windows |
| ------ | ------- |
| mac    | windows |

</Route>

## RSSHub {#rsshub}

### 有新路由啦 {#rsshub-you-xin-lu-you-la}

<Route author="DIYgod" example="/rsshub/routes" path="/rsshub/routes/:lang?" radar="1" rssbud="1" paramsDesc={['语言，`en` 为英文路由，其他值或留空则为中文路由，预设为中文路由']}/>

### 有新赞助商啦 {#rsshub-you-xin-zan-zhu-shang-la}

<Route author="DIYgod" example="/rsshub/sponsors" path="/rsshub/sponsors" radar="1" rssbud="1"/>

## Sesame {#sesame}

### Release Notes {#sesame-release-notes}

<Route author="nczitzk" example="/sesame/release_notes" path="/sesame/release_notes"/>

## Shuax {#shuax}

### Project {#shuax-project}

<Route author="nczitzk" example="/shuax/project/chrome" path="/shuax/project"  paramsDesc={['项目名，见下表，默认为 MouseInc']}>

| MouseInc | Chrome | Edge |
| -------- | ------ | ---- |
| mouseinc | chrome | edge |

</Route>

## simpread {#simpread}

### 消息通知 {#simpread-xiao-xi-tong-zhi}

<Route author="zytomorrow" example="/simpread/notice" path="/simpread/notice"/>

### 更新日志 {#simpread-geng-xin-ri-zhi}

<Route author="zytomorrow" example="/simpread/changelog" path="/simpread/changelog"/>

## sketch.com {#sketch.com}

### beta 更新 {#sketch.com-beta-geng-xin}

<Route author="Jeason0228" example="/sketch/beta" path="/sketch/beta"  />

### Release 更新 {#sketch.com-release-geng-xin}

<Route author="Jeason0228" example="/sketch/updates" path="/sketch/updates"  />

## Sony {#sony}

### Software Downloads {#sony-software-downloads}

<Route author="NavePnow" example="/sony/downloads/product/nw-wm1am2" path="/sony/downloads/:productType/:productId" paramsDesc={['产品类别', '产品Id']}>

:::tip 提示

打开 `https://www.sony.com/electronics/support` 并搜索对应的产品，比如 `Sony A7M4` 对应的网站是 `https://www.sony.com/electronics/support/e-mount-body-ilce-7-series/ilce-7m4/downloads`，`productType` 为 `e-mount-body-ilce-7-series`, `productId` 为 `ilce-7m4`

:::

</Route>

## Thunderbird {#thunderbird}

### 更新日志 {#thunderbird-geng-xin-ri-zhi}

<Route author="garywill" example="/thunderbird/release" path="/thunderbird/release"/>

## Total Commander {#total-commander}

### What's New {#total-commander-what's-new}

<Route author="nczitzk" example="/totalcommander/whatsnew" path="/totalcommander/whatsnew"/>

## TradingView {#tradingview}

### Blog {#tradingview-blog}

<Route author="nczitzk" example="/tradingview/blog/en" path="/tradingview/blog/:language?" paramsDesc={['语言，见下表，默认为 en 即英语']}>

语言

| 编号 | 语言                |
| ---- | ------------------- |
| en   | English             |
| ru   | Русский             |
| ja   | 日本語              |
| es   | Español             |
| tr   | Türkçe              |
| ko   | 한국어              |
| it   | Italiano            |
| pt   | Português do Brasil |
| de   | Deutsch             |
| fr   | Français            |
| pl   | Polski              |
| id   | Bahasa Indonesia    |
| my   | Bahasa Malaysia     |
| tw   | 繁體                |
| cn   | 简体                |
| vi   | Tiếng Việt          |
| th   | ภาษาไทย             |
| sv   | Svenska             |
| ar   | العربية             |
| il   | Hebrew              |

</Route>

## Typora {#typora}

### Changelog {#typora-changelog}

<Route author="cnzgray" example="/typora/changelog" path="/typora/changelog" radar="1"/>

### Dev Release Changelog {#typora-dev-release-changelog}

<Route author="nczitzk" example="/typora/changelog/dev" path="/typora/changelog/dev" radar="1"/>

## VMware {#vmware}

### Flings {#vmware-flings}

<Route author="nczitzk" example="/vmware/flings" path="/vmware/flings"/>

## Western Digital {#western-digital}

### Download {#western-digital-download}

<Route author="nczitzk" example="/wdc/download/279" path="/wdc/download/:id?" paramsDesc={['软件 id，可在对应软件页 URL 中找到，默认为 279，即 Western Digital Dashboard']}/>

## winstall {#winstall}

### 应用更新 {#winstall-ying-yong-geng-xin}

<Route author="TonyRL" example="/winstall/Mozilla.Firefox" path="/winstall/:appId" paramsDesc={['应用名']} radar="1"/>

## WizFile {#wizfile}

### 更新日志 {#wizfile-geng-xin-ri-zhi}

<Route author="Fatpandac" example="/wizfile/updates" path="/wizfile/updates"/>

## WizTree {#wiztree}

### What's New {#wiztree-what's-new}

<Route author="nczitzk" example="/diskanalyzer/whats-new" path="/diskanalyzer/whats-new"/>

## X410 {#x410}

### News {#x410-news}

<Route author="nczitzk" example="/x410/news" path="/x410/news"/>

## xclient.info {#xclient.info}

### 应用更新 {#xclient.info-ying-yong-geng-xin}

<Route author="DIYgod" example="/xclient/app/sketch" path="/xclient/app/:name" paramsDesc={['应用名, 可在应用页 URL 中找到']}/>

## Xiaomi.eu {#xiaomi.eu}

### ROM Releases {#xiaomi.eu-rom-releases}

<Route author="maple3142" example="/xiaomieu/releases" path="/xiaomieu/releases"/>

## Xposed Module Repository {#xposed-module-repository}

### Module 更新 {#xposed-module-repository-module-geng-xin}

<Route author="nczitzk" example="/xposed/module/com.ext.star.wars" path="/xposed/module/:mod" paramsDesc={['模块包名, 模块页中的 Package 字段']}/>

## XYplorer {#xyplorer}

### What's New {#xyplorer-what's-new}

<Route author="nczitzk" example="/xyplorer/whatsnew" path="/xyplorer/whatsnew"/>

## Zotero {#zotero}

### 版本历史 {#zotero-ban-ben-li-shi}

<Route author="jasongzy" example="/zotero/versions" path="/zotero/versions"/>

## 华硕 {#hua-shuo}

### 固件 {#hua-shuo-gu-jian}

<Route author="Fatpandac" example="/asus/bios/RT-AX88U" path="/asus/bios/:model" paramsDesc={['产品型号，可在产品页面找到']}/>

### GPU Tweak {#hua-shuo-gpu-tweak}

<Route author="TonyRL" example="/asus/gpu-tweak" path="/asus/gpu-tweak" radar="1" rssbud="1"/>

## 蒲公英应用分发 {#pu-gong-ying-ying-yong-fen-fa}

### app 更新 {#pu-gong-ying-ying-yong-fen-fa-app-geng-xin}

<Route author="zytomorrow" example="/pgyer/:app" path="/pgyer/kz-test" paramsDesc={['app为下载页最后的路径']} radar="1" rssbud="1"/>

## 腾讯云移动直播 SDK {#teng-xun-yun-yi-dong-zhi-bo-sdk}

### 更新日志 {#teng-xun-yun-yi-dong-zhi-bo-sdk-geng-xin-ri-zhi}

<Route author="cielpy" example="/qcloud/mlvb/changelog" path="/qcloud/mlvb/changelog"/>

## 小米应用商店 {#xiao-mi-ying-yong-shang-dian}

### 金米奖 {#xiao-mi-ying-yong-shang-dian-jin-mi-jiang}

<Route author="nczitzk" example="/mi/golden" path="/mi/golden"/>

## 猿料 {#yuan-liao}

### 标签 {#yuan-liao-biao-qian}

<Route author="nczitzk" example="/yuanliao" path="/yuanliao/:tag/:sort?" paramsDesc={['标签，见下表，默认为 `utools`', '排序，见下表，默认为最新回复']}>

标签

| uTools | 插件发布 |
| ------ | -------- |
| utools | plugins  |

排序

| 最新回复 | 热门回复      | 新鲜出炉   | 陈年旧贴  |
| -------- | ------------- | ---------- | --------- |
|          | -commentCount | -createdAt | createdAt |

</Route>
