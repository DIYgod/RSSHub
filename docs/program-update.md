# 程序更新

## RSSHub

<Route name="有新路由啦" author="DIYgod" example="/rsshub/rss" path="/rsshub/rss"/>

## MIUI

<Route name="MIUI 新版本发布" author="Indexyz" example="/miui/aries" path="/miui/:device/:type?/:region?" :paramsDesc="['设备的 `codename` 例如 小米 2s 为 `aries`. 国际版的 `codename` 一般以 `_global` 结尾. 可查阅 MIUI 线刷包下载页面', '类型, 可选参数', '地区, 默认为 `cn`']">

| 类型   | type    |
| ------ | ------- |
| 稳定版 | release |
| 开发版 | dev     |

| 地区   | region |
| ------ | ------ |
| 国内版 | cn     |
| 国际版 | global |

</Route>

## Firefox

<Route name="新版本发布" author="fengkx" example="/firefox/release/desktop" path="/firefox/release/:platform" :paramsDesc="['操作平台']">

| 桌面    | Android | Beta | Nightly | Android Beta | ESR           |
| ------- | ------- | ---- | ------- | ------------ | ------------- |
| desktop | android | beta | nightly | android-beta | organizations |

</Route>

## Thunderbird

<Route name="更新日志" author="garywill" example="/thunderbird/release" path="/thunderbird/release"/>

## 腾讯云移动直播 SDK

<Route name="更新日志" author="cielpy" example="/qcloud/mlvb/changelog" path="/qcloud/mlvb/changelog"/>

## Bugly SDK

<Route name="更新日志" author="cielpy" example="/bugly/changelog/1" path="/bugly/changelog/:platform" :paramsDesc="['平台类型, 必选, 1 为 Android, 2 为 iOS']"/>

## fir.im 应用

<Route name="更新" author="cielpy" example="/fir/update/xcz" path="/fir/update/:id" :paramsDesc="['fir app id, 必选, 如 fir 生成的链接地址为 https://fir.im/xcz, 则 id 为 `xcz`']"/>

## Nvidia Web Driver

<Route name="更新日志" author="cielpy" example="/nvidia/webdriverupdate" path="/nvidia/webdriverupdate"/>

## App Store/Mac App Store

<Route name="应用更新" author="HenryQW" example="/appstore/update/cn/id444934666" path="/appstore/update/:country/:id" :paramsDesc="['App Store 国家, 如 QQ 的链接为 https://itunes.apple.com/cn/app/qq/id444934666?mt=8, 则 country 为 `cn`', 'App Store app id, 如 QQ 的链接为 https://itunes.apple.com/cn/app/qq/id444934666?mt=8, 则 id 为 `id444934666`']"/>

<Route name="价格更新（限免）" author="HenryQW" example="/appstore/price/cn/mac/id1152443474" path="/appstore/price/:country/:type/:id" :paramsDesc="['App Store 国家, 如 Squash 的链接为 https://itunes.apple.com/cn/app/id1152443474, 则 country 为 `cn`', 'App 类型, `iOS` 或 `mac`', 'App Store app id, 必选, 如 Squash 的链接为 https://itunes.apple.com/cn/app/id1152443474, 则 id 为 `id115244347`']"/>

<Route name="内购价格更新（限免）" author="HenryQW" example="/appstore/iap/cn/id953286746" path="/appstore/iap/:country/:id" :paramsDesc="['App Store 国家, 必选, 如 Darkroom – Photo Editor 的链接为 https://itunes.apple.com/cn/app/id953286746, 则 country 为 `cn`', 'App Store app id, 必选, 如 Darkroom – Photo Editor 的链接为 https://itunes.apple.com/cn/app/id953286746, 则 id 为 `id953286746`']"/>

<Route name="每日精品限免 / 促销应用（鲜面连线 by AppSo）" author="Andiedie" example="/appstore/xianmian" path="/appstore/xianmian"/>

## F-Droid

<Route name="App更新" author="garywill" example="/fdroid/apprelease/com.termux" path="/fdroid/apprelease/:app" :paramsDesc="['App包名']" />

## Greasy Fork

<Route name="脚本更新" author="imlonghao" example="/greasyfork/zh-CN/bilibili.com" path="/greasyfork/:language/:domain?" :paramsDesc="['语言, 可在网站右上角找到, `all` 为所有语言', '按脚本生效域名过滤, 可选']"/>

## Minecraft CurseForge

<Route name="Mod 更新" author="Indexyz" example="/curseforge/files/jei" path="/curseforge/files/:project" :paramsDesc="['项目的短名或者 `Project ID`. 项目的短名可以在地址栏获取到, 例如地址为 `https://minecraft.curseforge.com/projects/non-update`, 短名就为 `non-update`. `Project ID` 可在 `Overview` 中的 `About This Project` 中找到']"/>

## xclient.info

<Route name="应用更新" author="DIYgod" example="/xclient/app/sketch" path="/xclient/app/:name" :paramsDesc="['应用名, 可在应用页 URL 中找到']"/>

## Typora

<Route name="Changelog" author="cnzgray" example="/typora/changelog" path="/typora/changelog"/>

## Apkpure

<Route name="Versions" author="maple3142" example="/apkpure/versions/jp/jp.co.craftegg.band" path="/apkpure/versions/:region/:pkg" :paramsDesc="['區域代號', 'package name']"/>

## Docker Hub

<Route name="镜像有新 Build" author="HenryQW" example="/dockerhub/build/wangqiru/ttrss" path="/dockerhub/build/:owner/:image/:tag?" :paramsDesc="['镜像作者', '镜像名称', '镜像标签，默认 latest']"/>

## Xiaomi.eu

<Route name="ROM Releases" author="maple3142" example="/xiaomieu/releases" path="/xiaomieu/releases"/>
