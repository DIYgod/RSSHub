---
pageClass: routes
---

# 程序更新

## Apkpure

### Versions

<Route author="maple3142" example="/apkpure/versions/jp/jp.co.craftegg.band" path="/apkpure/versions/:region/:pkg" :paramsDesc="['區域代號', 'package name']"/>

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

<Route author="HenryQW" example="/aptonic/action" path="/aptonic/action"/>

## Bugly SDK

### 更新日志

<Route author="cielpy" example="/bugly/changelog/1" path="/bugly/changelog/:platform" :paramsDesc="['平台类型, 必选, 1 为 Android, 2 为 iOS']"/>

## Cent Browser

### 更新日志

<Route author="hoilc" example="/centbrowser/history" path="/centbrowser/history"/>

## Chocolatey

### 软件更新

<Route author="woodgear" example="/chocolatey/software/GoogleChrome" path="/chocolatey/software"/>

## Chrome 网上应用店

### 扩展程序更新

<Route author="DIYgod" example="/chrome/webstore/extensions/kefjpfngnndepjbopdmoebkipbgkggaa" path="/chrome/webstore/extensions/:id" :paramsDesc="['扩展程序 id, 可在应用页 URL 中找到']" />

## CurseForge

### 文件更新

<Route author="junfengP" example="/curseforge/sc2/assets/taylor-mouses-stuff/files" path="/curseforge/:gameid/:catalogid/:projectid/files" :paramsDesc="['游戏名，以`https://www.curseforge.com/sc2/assets/taylor-mouses-stuff/files`为例，`sc2`代表星际2', '分类名，紧跟在游戏名后，如示例中`assets`', '项目名，紧跟在分类名后，如示例中`taylor-mouses-stuff`']"/>

例如：`https://www.curseforge.com/sc2/assets/taylor-mouses-stuff/files` 对应 `/curseforge/sc2/assets/taylor-mouses-stuff/files`

</Route>

## Docker Hub

### 镜像有新 Build

<Route author="HenryQW" example="/dockerhub/build/wangqiru/ttrss" path="/dockerhub/build/:owner/:image/:tag?" :paramsDesc="['镜像作者', '镜像名称', '镜像标签，默认 latest']" radar="1"/>

::: warning 注意

官方镜像的 owner 填写 library, 如: https://rsshub.app/dockerhub/build/library/mysql

:::

## F-Droid

### App 更新

<Route author="garywill" example="/fdroid/apprelease/com.termux" path="/fdroid/apprelease/:app" :paramsDesc="['App包名']" />

## fir.im 应用

### 更新

<Route author="cielpy" example="/fir/update/xcz" path="/fir/update/:id" :paramsDesc="['fir app id, 必选, 如 fir 生成的链接地址为 https://fir.im/xcz, 则 id 为 `xcz`']"/>

## Firefox

### 新版本发布

<Route author="fengkx" example="/firefox/release/desktop" path="/firefox/release/:platform" :paramsDesc="['操作平台']">

| 桌面    | Android | Beta | Nightly | Android Beta | ESR           |
| ------- | ------- | ---- | ------- | ------------ | ------------- |
| desktop | android | beta | nightly | android-beta | organizations |

</Route>

### 附加组件(Add-ons)更新

<Route author="DIYgod" example="/firefox/addons/rsshub-radar" path="/firefox/addons/:id" :paramsDesc="['附加组件 id, 可在应用页 URL 中找到']/>

## Greasy Fork

### 脚本更新

<Route author="imlonghao" example="/greasyfork/zh-CN/bilibili.com" path="/greasyfork/:language/:domain?" :paramsDesc="['语言, 可在网站右上角找到, `all` 为所有语言', '按脚本生效域名过滤, 可选']"/>

## IPSW.me

### 苹果固件更新-IPSWs/OTAs 版本

<Route author="Jeason0228" example="/ipsw/index/ipsws/iPhone11,8" path="/ipsw/index/:ptype/:pname/" :paramsDesc="['填写ipsws或otas,得到不同版本的固件','产品名, `http://rsshub.app/ipsw/index/ipsws/iPod`如填写iPad则关注iPad整个系列(ptype选填为ipsws).`http://rsshub.app/ipsw/index/ipsws/iPhone11,8`如果填写具体的iPhone11,8则关注这个机型的ipsws固件信息']"/>

## Minecraft

见 [#minecraft](/game.html#minecraft)

## MIUI

### MIUI 新版本发布

<Route author="Indexyz" example="/miui/aries" path="/miui/:device/:type?/:region?" :paramsDesc="['设备的 `codename` 例如 小米 2s 为 `aries`. 国际版的 `codename` 一般以 `_global` 结尾. 可查阅 MIUI 线刷包下载页面', '类型', '地区, 默认为 `cn`']">

| 类型   | type    |
| ------ | ------- |
| 稳定版 | release |
| 开发版 | dev     |

| 地区   | region |
| ------ | ------ |
| 国内版 | cn     |
| 国际版 | global |

</Route>

## Nintendo Switch

### Switch 本体更新情报（日本）

见 [#nintendo](/game.html#nintendo)

## Nvidia Web Driver

### 更新日志

<Route author="cielpy" example="/nvidia/webdriverupdate" path="/nvidia/webdriverupdate"/>

## PlayStation

### PlayStation 4 系统更新纪录

见 [#playstation](/game.html#playstation)

## RSSHub

### 有新路由啦

<Route author="DIYgod" example="/rsshub/routes" path="/rsshub/routes" radar="1"/>

### 有新赞助商啦

<Route author="DIYgod" example="/rsshub/sponsors" path="/rsshub/sponsors" radar="1"/>

## sketch.com

### beta 更新

<Route author="Jeason0228" example="/sketch/beta" path="/sketch/beta"  />

### Release 更新

<Route author="Jeason0228" example="/sketch/updates" path="/sketch/updates"  />

## Thunderbird

### 更新日志

<Route author="garywill" example="/thunderbird/release" path="/thunderbird/release"/>

## Typora

### Changelog

<Route author="cnzgray" example="/typora/changelog" path="/typora/changelog"/>

## xclient.info

### 应用更新

<Route author="DIYgod" example="/xclient/app/sketch" path="/xclient/app/:name" :paramsDesc="['应用名, 可在应用页 URL 中找到']"/>

## Xiaomi.eu

### ROM Releases

<Route author="maple3142" example="/xiaomieu/releases" path="/xiaomieu/releases"/>

## 怪物猎人世界

### 更新

见 [#怪物猎人世界](/game.html#guai-wu-lie-ren-shi-jie)

## 厚墨

### 书源更新

<Route author="AngUOI" example="/houmo/9251" path="/houmo/:code?" :paramsDesc="['不填则默认获取全部']">

| 1212 | 2000 | 2333 | 6666   | 9251 | 9713 |
| ---- | ---- | ---- | ------ | ---- | ---- |
| 沚水 | 楚观 | 纯二 | 张小晚 | 归谜 | 旧人 |

</Route>

## 蒲公英应用分发

### app 更新

<Route author="zytomorrow" example="/pgyer/:app" path="/pgyer/kz-test" :paramsDesc="['app为下载页最后的路径']" radar="1"/>

## 腾讯云移动直播 SDK

### 更新日志

<Route author="cielpy" example="/qcloud/mlvb/changelog" path="/qcloud/mlvb/changelog"/>
