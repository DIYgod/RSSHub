---
pageClass: routes
---

# 程序更新

## AMD

### 显卡驱动更新

<Route author="ysc3839" example="/amd/graphicsdrivers/731F/C0" path="/amd/graphicsdrivers/:id/:rid?" :paramsDesc="['id', 'rid']">

可从设备管理器查看 id 和 rid。如 `PCI\VEN_1002&DEV_731F&SUBSYS_05771043&REV_C1`，则 id 为 `731F`，rid 为 `C1`。

</Route>

## Anki

### Changes

<Route author="nczitzk" example="/anki/changes" path="/anki/changes"/>

## AnyTXT

### Release Notes

<Route author="nczitzk" example="/anytxt/release-notes" path="/anytxt/release-notes"/>

## Apkpure

### Versions

<Route author="maple3142" example="/apkpure/versions/jp/jp.co.craftegg.band" path="/apkpure/versions/:region/:pkg" :paramsDesc="['區域代號', 'package name']"/>

## App Center

### Release

<Route author="Rongronggg9" example="/app-center/release/cloudflare/1.1.1.1-windows/beta" path="/app-center/release/:user/:app/:distribution_group" :paramsDesc="['用户', 'App 名称', '分发组']" radar="1" rssbud="1">

::: tip 提示

参数可从 Release 页的 URL 中提取: `https://install.appcenter.ms/users/:user/apps/:app/distribution_groups/:distribution_group`

:::

</Route>

## App Store/Mac App Store

### 应用更新

<Route author="HenryQW" example="/appstore/update/cn/id444934666" path="/appstore/update/:country/:id" :paramsDesc="['App Store 国家, 如 QQ 的链接为 https://apps.apple.com/cn/app/qq/id444934666?mt=8, 则 country 为 `cn`', 'App Store app id, 如 QQ 的链接为 https://apps.apple.com/cn/app/qq/id444934666?mt=8, 则 id 为 `id444934666`']"/>

### 价格更新（限免）

<Route author="HenryQW" example="/appstore/price/cn/mac/id1152443474" path="/appstore/price/:country/:type/:id" :paramsDesc="['App Store 国家, 如 Squash 的链接为 https://apps.apple.com/cn/app/id1152443474, 则 country 为 `cn`', 'App 类型, `iOS` 或 `mac`', 'App Store app id, 必选, 如 Squash 的链接为 https://apps.apple.com/cn/app/id1152443474, 则 id 为 `id115244347`']"/>

### 内购价格更新（限免）

<Route author="HenryQW" example="/appstore/iap/cn/id953286746" path="/appstore/iap/:country/:id" :paramsDesc="['App Store 国家, 必选, 如 Darkroom – Photo Editor 的链接为 https://apps.apple.com/cn/app/id953286746, 则 country 为 `cn`', 'App Store app id, 必选, 如 Darkroom – Photo Editor 的链接为 https://apps.apple.com/cn/app/id953286746, 则 id 为 `id953286746`']"/>

### 每日精品限免 / 促销应用（鲜面连线 by AppSo）

<Route author="Andiedie" example="/appstore/xianmian" path="/appstore/xianmian"/>

### 最新限免（GoFans）

<Route author="HenryQW" example="/appstore/gofans" path="/appstore/gofans"/>

## aptonic

### 新的 Dropzone 动作

<Route author="HenryQW" example="/aptonic/action" path="/aptonic/action/:untested?" :paramsDesc="['填写任意值，将会同时包括非官方的 Dropzone 动作']"/>

## Bandisoft

### 更新记录

<Route author="nczitzk" example="/bandisoft/bandizip" path="/bandisoft/:id?/:lang?" :paramsDesc="['软件 id，见下表，默认为 Bandizip', '语言，见下表，默认为英语']">

软件 id

| Bandizip (Win) | Bandizip (Mac) | Honeycam | Honeyview |
| -------------- | -------------- | -------- | --------- |
| bandizip       | bandizip.mac   | honeycam | honeyview |

语言

| English | 中文 (简体) | 中文 (繁體) | 日本語 | Русский | Español | Français | Deutsch | Italiano | Slovenčina | Українська | Беларуская | Dansk | Polski | Português Brasileiro | Čeština | Nederlands | Slovenščina | Türkçe | ภาษาไทย | 한국어 |
| ------- | ------- | ------- | --- | ------- | ------- | -------- | ------- | -------- | ---------- | ---------- | ---------- | ----- | ------ | -------------------- | ------- | ---------- | ----------- | ------ | ------- | --- |
| en      | cn      | tw      | jp  | ru      | es      | fr       | de      | it       | sk         | uk         | be         | da    | pl     | br                   | cs      | nl         | sl          | tr     | th      | kr  |

</Route>

## Bilibili

### 更新情报

<Route author="nczitzk" example="/bilibili/app/android" path="/bilibili/app/:id?" :paramsDesc="['客户端 id，见下表，默认为安卓版']">

| 安卓版     | iPhone 版 | iPad HD 版 | UWP 版 | TV 版           |
| ------- | -------- | --------- | ----- | -------------- |
| android | iphone   | ipad      | win   | android_tv_yst |

## Bugly SDK

### 更新日志

<Route author="cielpy" example="/bugly/changelog/1" path="/bugly/changelog/:platform" :paramsDesc="['平台类型, 必选, 1 为 Android, 2 为 iOS']"/>

## Cent Browser

### 更新日志

<Route author="hoilc" example="/centbrowser/history" path="/centbrowser/history"/>

## Checkra1n

### 新版本发布

<Route author="ntzyz" example="/checkra1n/releases" path="/checkra1n/releases"/>

## Chocolatey

### 软件更新

<Route author="woodgear" example="/chocolatey/software/GoogleChrome" path="/chocolatey/software"/>

## Chrome 网上应用店

### 扩展程序更新

<Route author="DIYgod" example="/chrome/webstore/extensions/kefjpfngnndepjbopdmoebkipbgkggaa" path="/chrome/webstore/extensions/:id" :paramsDesc="['扩展程序 id, 可在应用页 URL 中找到']" />

## cpython

### 正式版本发布

<Route author="trim21" example="/cpython" path="/cpython" />

### 所有版本发布

<Route author="trim21" example="/cpython/pre" path="/cpython/pre" />

## CurseForge

### 文件更新

<Route author="junfengP" example="/curseforge/sc2/assets/taylor-mouses-stuff/files" path="/curseforge/:gameid/:catalogid/:projectid/files" :paramsDesc="['游戏名，以`https://www.curseforge.com/sc2/assets/taylor-mouses-stuff/files`为例，`sc2`代表星际2', '分类名，紧跟在游戏名后，如示例中`assets`', '项目名，紧跟在分类名后，如示例中`taylor-mouses-stuff`']"/>

例如：`https://www.curseforge.com/sc2/assets/taylor-mouses-stuff/files` 对应 `/curseforge/sc2/assets/taylor-mouses-stuff/files`

</Route>

## Ditto clipboard manager

### Changes

<Route author="nczitzk" example="/ditto/changes" path="/ditto/changes/:type?" :paramsDesc="['类型，可选 `beta`']"/>

## Docker Hub

### 镜像有新 Build

<Route author="HenryQW" example="/dockerhub/build/wangqiru/ttrss" path="/dockerhub/build/:owner/:image/:tag?" :paramsDesc="['镜像作者', '镜像名称', '镜像标签，默认 latest']" radar="1" rssbud="1">

::: warning 注意

官方镜像的 owner 填写 library, 如: <https://rsshub.app/dockerhub/build/library/mysql>

:::

</Route>

### 镜像有新 Tag

<Route author="outloudvi" example="/dockerhub/tag/library/mariadb" path="/dockerhub/tag/:owner/:image/:limits?" :paramsDesc="['镜像作者', '镜像名称', 'tag 数量，默认为 10']" radar="1" rssbud="1">

::: warning 注意

官方镜像的 owner 填写 library, 如: <https://rsshub.app/dockerhub/tag/library/mysql>

:::

</Route>

## Eagle

### 更新日志

<Route author="tigercubden" example="/eagle/changelog" path="/eagle/changelog/:language?" :paramsDesc="['语言，选项见下表，默认为 `cn`']" radar="1">

语言

| 简体中文 | 繁体中文 | 英文 |
| ---- | ---- | -- |
| cn   | tw   | en |

</Route>

## Everything

### Changes

<Route author="nczitzk" example="/everything/changes" path="/everything/changes"/>

## F-Droid

### App 更新

<Route author="garywill" example="/fdroid/apprelease/com.termux" path="/fdroid/apprelease/:app" :paramsDesc="['App包名']" />

## fir.im 应用

### 更新

<Route author="cielpy" example="/fir/update/xcz" path="/fir/update/:id" :paramsDesc="['fir app id, 必选, 如 fir 生成的链接地址为 https://fir.im/xcz, 则 id 为 `xcz`']"/>

## Firefox

### 新版本发布

<Route author="fengkx" example="/firefox/release/desktop" path="/firefox/release/:platform" :paramsDesc="['操作平台']">

| 桌面      | Android | Beta | Nightly | Android Beta | ESR           |
| ------- | ------- | ---- | ------- | ------------ | ------------- |
| desktop | android | beta | nightly | android-beta | organizations |

</Route>

### 附加组件 (Add-ons) 更新

<Route author="DIYgod" example="/firefox/addons/rsshub-radar" path="/firefox/addons/:id" :paramsDesc="['附加组件 id, 可在应用页 URL 中找到']" />

## Greasy Fork

### 脚本更新

<Route author="imlonghao" example="/greasyfork/zh-CN/bilibili.com" path="/greasyfork/:language/:domain?" :paramsDesc="['语言, 可在网站右上角找到, `all` 为所有语言', '按脚本生效域名过滤, 可选']"/>

## Hugo

### 更新日志

<Route author="maokwen" example="/hugo/releases" path="/hugo/releases"/>

## IPSW\.me

### 苹果固件更新 - IPSWs/OTAs 版本

<Route author="Jeason0228" example="/ipsw/index/ipsws/iPhone11,8" path="/ipsw/index/:ptype/:pname/" :paramsDesc="['填写ipsws或otas,得到不同版本的固件','产品名, `http://rsshub.app/ipsw/index/ipsws/iPod`如填写iPad则关注iPad整个系列(ptype选填为ipsws).`http://rsshub.app/ipsw/index/ipsws/iPhone11,8`如果填写具体的iPhone11,8则关注这个机型的ipsws固件信息']"/>

## Logseq

### Changelog

<Route author="nczitzk" example="/logseq/changelog" path="/logseq/changelog"/>

## MacKed

### 应用更新

<Route author="HXHL" example="/macked/app/cleanmymac-x" path="/macked/app/:name" :paramsDesc="['应用名, 可在应用页 URL 中找到']"/>

## MacWk

### 应用更新

<Route author="f48vj" example="/macwk/soft/sublime-text" path="/macwk/soft/:name" :paramsDesc="['应用名, 可在应用页 URL 中找到']" radar="1" rssbud="1"/>

## ManicTime

<Route author="nczitzk" example="/manictime/releases" path="/manictime/releases"/>

## Mathpix

<Route author="nczitzk" example="/mathpix/blog" path="/mathpix/blog"/>

## Microsoft Edge

### 外接程序更新

<Route author="hoilc" example="/edge/addon/gangkeiaobmjcjokiofpkfpcobpbmnln" path="/edge/addon/:crxid" :paramsDesc="['扩展 id, 可在扩展页 URL 中找到']" />

## Microsoft Store

### Updates

<Route author="hellodword" example="/microsoft-store/updates/9WZDNCRFHVN5/CN" path="/microsoft-store/updates/:productid/:market?" :paramsDesc="['在 Store 中点击 `分享` - `复制链接` 即可获得', '默认为 `CN`']" />

## Minecraft

见 [#minecraft](/game.html#minecraft)

## MIUI

### MIUI 新版本发布

<Route author="Indexyz" example="/miui/aries" path="/miui/:device/:type?/:region?" :paramsDesc="['设备的 `codename` 例如 小米 2s 为 `aries`. 国际版的 `codename` 一般以 `_global` 结尾. 可查阅 MIUI 线刷包下载页面', '类型', '地区, 默认为 `cn`']">

| 类型  | type    |
| --- | ------- |
| 稳定版 | release |
| 开发版 | dev     |

| 地区  | region |
| --- | ------ |
| 国内版 | cn     |
| 国际版 | global |

</Route>

## Nintendo Switch

### Switch 本体更新情报（日本）

见 [#nintendo](/game.html#nintendo)

## NPM

### 包

<Route author="Fatpandac" example="/npm/package/rsshub" path="/npm/package/:name" :paramsDesc="['包名']"/>

## Nvidia Web Driver

### 更新日志

<Route author="cielpy" example="/nvidia/webdriverupdate" path="/nvidia/webdriverupdate"/>

## Obsidian

### Announcements

<Route author="nczitzk" example="/obsidian/announcements" path="/obsidian/announcements"/>

## OneNote Gem Add-Ins

### Release History

<Route author="nczitzk" example="/onenotegem/release" path="/onenotegem/release"/>

## PlayStation

### PlayStation 4 系统更新纪录

见 [#playstation](/game.html#playstation)

## Potplayer

### 版本历史

<Route author="nczitzk" example="/potplayer/update" path="/potplayer/update/:language?" :paramsDesc="['语言，见下表，默认为英语']">

| 한국어 | 中文 (简体) | 中文 (繁体) | ENGLISH | Українська | РУССКИЙ | Polski |
| --- | ------- | ------- | ------- | ---------- | ------- | ------ |
| ko  | zh_CN   | zh_TW   | en      | uk         | ru      | pl     |

</Route>

## qBittorrent

### 消息

<Route author="TonyRL" example="/qbittorrent/news" path="/qbittorrent/news" radar="1" rssbud="1"/>

## QNAP

### Release Notes

<Route author="nczitzk" example="/qnap/release-notes/qts" path="/qnap/release-notes/:id" :paramsDesc="['OS id，见下表']">

| QTS | QuTS hero | QuTScloud | QuWAN Orchestrator | QES | TAS | AfoBot |
| --- | --------- | --------- | ------------------ | --- | --- | ------ |
| qts | quts_hero | qutscloud | quwan_orchestrator | qes | tas | afobot |

</Route>

## QQ 互联 SDK

### 更新日志

<Route author="nuomi1" example="/tencent/qq/sdk/changelog/iOS" path="/tencent/qq/sdk/changelog/:platform" :paramsDesc="['平台，iOS / Android']"/>

## QTTabBar

### Change Log

<Route author="nczitzk" example="/qttabbar/change-log" path="/qttabbar/change-log"/>

## Quicker

### 版本更新

<Route author="Cesaryuan nczitzk" example="/quicker/versions" path="/quicker/versions"/>

## RescueTime

### Release Notes

<Route author="nczitzk" example="/rescuetime/release-notes" path="/rescuetime/release-notes/:os?" :paramsDesc="['OS id，见下表']">

| Mac OS | Windows |
| ------ | ------- |
| mac    | windows |

</Route>

## RSSHub

### 有新路由啦

<Route author="DIYgod" example="/rsshub/routes" path="/rsshub/routes/:lang?" radar="1" rssbud="1" :paramsDesc="['语言，`en` 为英文路由，其他值或留空则为中文路由，预设为中文路由']"/>

### 有新赞助商啦

<Route author="DIYgod" example="/rsshub/sponsors" path="/rsshub/sponsors" radar="1" rssbud="1"/>

## Sesame

### Release Notes

<Route author="nczitzk" example="/sesame/release_notes" path="/sesame/release_notes"/>

## Shuax

### Project

<Route author="nczitzk" example="/shuax/project/chrome" path="/shuax/project"  :paramsDesc="['项目名，见下表，默认为 MouseInc']">

| MouseInc | Chrome | Edge |
| -------- | ------ | ---- |
| mouseinc | chrome | edge |

</Route>

## simpread

### 消息通知

<Route author="zytomorrow" example="/simpread/notice" path="/simpread/notice"/>

### 更新日志

<Route author="zytomorrow" example="/simpread/changelog" path="/simpread/changelog"/>

## sketch.com

### beta 更新

<Route author="Jeason0228" example="/sketch/beta" path="/sketch/beta"  />

### Release 更新

<Route author="Jeason0228" example="/sketch/updates" path="/sketch/updates"  />

## Thunderbird

### 更新日志

<Route author="garywill" example="/thunderbird/release" path="/thunderbird/release"/>

## Total Commander

### What's New

<Route author="nczitzk" example="/totalcommander/whatsnew" path="/totalcommander/whatsnew"/>

## Typora

### Changelog

<Route author="cnzgray" example="/typora/changelog" path="/typora/changelog"/>

### Dev Release Changelog

<Route author="nczitzk" example="/typora/changelog-dev/macOS" path="/typora/changelog-dev/:os" :paramsDesc="['操作系统类型, 可选 `macOS` 或 `Windows` 与 `Linux`，默认为 `macOS`']"/>

## X410

### News

<Route author="nczitzk" example="/x410/news" path="/x410/news"/>

## xclient.info

### 应用更新

<Route author="DIYgod" example="/xclient/app/sketch" path="/xclient/app/:name" :paramsDesc="['应用名, 可在应用页 URL 中找到']"/>

## Xiaomi.eu

### ROM Releases

<Route author="maple3142" example="/xiaomieu/releases" path="/xiaomieu/releases"/>

## Xposed Module Repository

### Module 更新

<Route author="nczitzk" example="/xposed/module/com.ext.star.wars" path="/xposed/module/:mod" :paramsDesc="['模块包名, 模块页中的 Package 字段']"/>

## XYplorer

### What's New

<Route author="nczitzk" example="/xyplorer/whatsnew" path="/xyplorer/whatsnew"/>

## 怪物猎人世界

### 更新

见 [#怪物猎人世界](/game.html#guai-wu-lie-ren-shi-jie)

## 华硕

### 固件

<Route author="Fatpandac" example="/asus/bios/RT-AX88U" path="/asus/bios/:model" :paramsDesc="['产品型号，可在产品页面找到']"/>

## 蒲公英应用分发

### app 更新

<Route author="zytomorrow" example="/pgyer/:app" path="/pgyer/kz-test" :paramsDesc="['app为下载页最后的路径']" radar="1" rssbud="1"/>

## 特斯拉系统更新

### 版本详细信息

<Route author="mrbruce516" example="/tesla" path="/tesla/update"/>

## 腾讯云移动直播 SDK

### 更新日志

<Route author="cielpy" example="/qcloud/mlvb/changelog" path="/qcloud/mlvb/changelog"/>

## 小米应用商店

### 金米奖

<Route author="nczitzk" example="/mi/golden" path="/mi/golden"/>

## 猿料

### 标签

<Route author="nczitzk" example="/yuanliao" path="/yuanliao/:tag/:sort?" :paramsDesc="['标签，见下表，默认为 `utools`', '排序，见下表，默认为最新回复']">

标签

| uTools | 插件发布    |
| ------ | ------- |
| utools | plugins |

排序

| 最新回复 | 热门回复          | 新鲜出炉       | 陈年旧贴      |
| ---- | ------------- | ---------- | --------- |
|      | -commentCount | -createdAt | createdAt |

</Route>
