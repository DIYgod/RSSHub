---
pageClass: routes
---

# Application Updates

## Amazon

### Kindle Software Updates

<RouteEn author="NavePnow" example="/amazon/kindle/software-updates" path="/amazon/kindle/software-updates" radar="1"/>

## Android

### SDK Platform Tools release notes

<RouteEn author="nczitzk" example="/android/platform-tools-releases" path="/android/platform-tools-releases"/>

## Anki

### Changes

<RouteEn author="nczitzk" example="/anki/changes" path="/anki/changes"/>

## AnyTXT

### Release Notes

<RouteEn author="nczitzk" example="/anytxt/release-notes" path="/anytxt/release-notes"/>

## APKPure

### Versions

<RouteEn author="maple3142" example="/apkpure/versions/jp.co.craftegg.band/jp" path="/apkpure/versions/:pkg/:region?" :paramsDesc="['Package name', 'Region code, `en` by default']" radar="1" anticrawler="1" puppeteer="1"/>

## App Center

### Release

<RouteEn author="Rongronggg9" example="/app-center/release/cloudflare/1.1.1.1-windows/beta" path="/app-center/release/:user/:app/:distribution_group" :paramsDesc="['User', 'App name', 'Distribution group']" radar="1" rssbud="1">

::: tip

The parameters can be extracted from the Release page URL: `https://install.appcenter.ms/users/:user/apps/:app/distribution_groups/:distribution_group`

:::

</RouteEn>

## App Store/Mac App Store

### App Update

<RouteEn author="cielpy" example="/appstore/update/us/id697846300" path="/appstore/update/:country/:id" :paramsDesc="['App Store Country, obtain from the app URL `https://apps.apple.com/us/app/reeder-3/id697846300?mt=8`, in this case, `us`', 'App Store app id, obtain from the app URL `https://apps.apple.com/us/app/reeder-3/id697846300?mt=8`, in this case, `id697846300`']" />

### Price Drop

<RouteEn author="HenryQW" example="/appstore/price/us/mac/id1152443474" path="/appstore/price/:country/:type/:id" :paramsDesc="['App Store Country, obtain from the app URL https://apps.apple.com/us/app/id1152443474, in this case, `us`', 'App type，either `iOS` or `mac`', 'App Store app id, obtain from the app URL https://apps.apple.com/us/app/id1152443474, in this case, `id1152443474`']" />

### In-App-Purchase Price Drop Alert

<RouteEn author="HenryQW" example="/appstore/iap/us/id953286746" path="/appstore/iap/:country/:id" :paramsDesc="['App Store Country, obtain from the app URL https://apps.apple.com/us/app/id953286746, in this case, `us`', 'App Store app id, obtain from the app URL https://apps.apple.com/us/app/id953286746, in this case, `id953286746`']" />

## aptonic

### New Dropzone Actions

<RouteEn author="HenryQW" example="/aptonic/action" path="/aptonic/action/:untested?" :paramsDesc="['Set any value to include untested actions.']"/>

## ASUS

### BIOS

<RouteEn author="Fatpandac" example="/asus/bios/RT-AX88U" path="/asus/bios/:model" :paramsDesc="['Model, can be found in product page']"/>

### GPU Tweak

<RouteEn author="TonyRL" example="/asus/gpu-tweak" path="/asus/gpu-tweak" radar="1" rssbud="1"/>

## Bandisoft

### History

<RouteEn author="nczitzk" example="/bandisoft/bandizip" path="/bandisoft/:id?/:lang?" :paramsDesc="['Software id, see below, Bandizip by default', 'Language, see below, English by default']">

Software id

| Bandizip (Win) | Bandizip (Mac) | Honeycam | Honeyview |
| -------------- | -------------- | -------- | --------- |
| bandizip       | bandizip.mac   | honeycam | honeyview |

Language

| Language             | key |
| -------------------- | --- |
| English              | en  |
| 中文 (简体)          | cn  |
| 中文 (繁體)          | tw  |
| 日本語               | jp  |
| Русский              | ru  |
| Español              | es  |
| Français             | fr  |
| Deutsch              | de  |
| Italiano             | it  |
| Slovenčina           | sk  |
| Українська           | uk  |
| Беларуская           | be  |
| Dansk                | da  |
| Polski               | pl  |
| Português Brasileiro | br  |
| Čeština              | cs  |
| Nederlands           | nl  |
| Slovenščina          | sl  |
| Türkçe               | tr  |
| ภาษาไทย              | th  |
| 한국어               | kr  |

</RouteEn>

## BlueStacks

### BlueStacks 5 Release Notes

<RouteEn author="TonyRL" example="/bluestacks/release/5" path="/bluestacks/release/5" radar="1" anticrawler="1" puppeteer="1"/>

## Brave

### Release Notes

<Route author="nczitzk" example="/brave/latest" path="/brave/latest"/>

## Chocolatey

### Software Update

<RouteEn author="woodgear" example="/chocolatey/software/GoogleChrome" path="/chocolatey/software"/>

## Chrome Web Store

### Extensions Update

<RouteEn author="DIYgod" example="/chrome/webstore/extensions/kefjpfngnndepjbopdmoebkipbgkggaa" path="/chrome/webstore/extensions/:id" :paramsDesc="['Extension id, can be found in extension url']"/>

## Clash

### Premium Releases

<RouteEn author="ttttmr" example="/clash/premium" path="/clash/premium" radar="1" />

## CPUID

### News

<RouteEn author="TonyRL" example="/cpuid/news" path="/cpuid/news" radar="1" rssbud="1"/>

## CurseForge

### File Update

<RouteEn author="junfengP" example="/curseforge/sc2/assets/taylor-mouses-stuff/files" path="/curseforge/:gameid/:catalogid/:projectid/files" :paramsDesc="['Game name', 'Catalog name', 'Progect name']">

For example: `https://www.curseforge.com/sc2/assets/taylor-mouses-stuff/files` to `/curseforge/sc2/assets/taylor-mouses-stuff/files`

</RouteEn>

## Ditto clipboard manager

### Changes

<RouteEn author="nczitzk" example="/ditto/changes" path="/ditto/changes/:type?" :paramsDesc="['Type, `beta` is an option']"/>

## Docker Hub

### Image New Build

<RouteEn author="HenryQW" example="/dockerhub/build/wangqiru/ttrss" path="/dockerhub/build/:owner/:image/:tag?" :paramsDesc="['Image owner', 'Image name', 'Image tag，default to latest']">

::: warning

The owner of the official image fills in the library, for example: <https://rsshub.app/dockerhub/build/library/mysql>

:::

</RouteEn>

### Image New Tag

<RouteEn author="outloudvi" example="/dockerhub/tag/library/mariadb" path="/dockerhub/tag/:owner/:image/:limits?" :paramsDesc="['Image owner', 'Image name', 'Tag count, 10 by default']">

::: warning

Use `library` as the `owner` for official images, such as <https://rsshub.app/dockerhub/tag/library/mysql>

:::

</RouteEn>

## Eagle

### Changelog

<RouteEn author="tigercubden" example="/eagle/changelog/en" path="/eagle/changelog/:language?" :paramsDesc="['Language, see list, default to be `cn`']" radar="1">
  
Language

| Simplified Chinese | Traditional Chinese | English |
| ------------------ | ------------------- | ------- |
| cn                 | tw                  | en      |

</RouteEn>

## Everything

### Changes

<RouteEn author="nczitzk" example="/everything/changes" path="/everything/changes"/>

## F-Droid

### App Update

<RouteEn author="garywill" example="/fdroid/apprelease/com.termux" path="/fdroid/apprelease/:app" :paramsDesc="['App\'s package name']" />

## Firefox

### New Release

<RouteEn author="fengkx" example="/firefox/release/desktop" path="/firefox/release/:platform" :paramsDesc="['the platform']" >

| Desktop | Android | Beta | Nightly | Android Beta | ESR           |
| ------- | ------- | ---- | ------- | ------------ | ------------- |
| desktop | android | beta | nightly | android-beta | organizations |

</RouteEn>

### Add-ons Update

<RouteEn author="DIYgod" example="/firefox/addons/rsshub-radar" path="/firefox/addons/:id" :paramsDesc="['Add-ons id, can be found in add-ons url']"/>

## fish shell

### Release Notes

<RouteEn author="x2cf" example="/fishshell" path="/fishshell" radar="1" />

## FossHub

### Software Update

<RouteEn author="nczitzk" example="/fosshub/qBittorrent" path="/fosshub/:id" :paramsDesc="['Software id, can be found in URL']"/>

## Greasy Fork

### Script Update

<RouteEn author="imlonghao" path="/greasyfork/:language/:domain?" example="/greasyfork/en/google.com" :paramsDesc="['language, located on the top right corner of Greasy Fork\'s search page, set to `all` for including all languages', 'the script\'s target domain']" radar="1" />

### Script Version History

<RouteEn author="miles170" example="/greasyfork/scripts/431691-bypass-all-shortlinks/versions" path="/greasyfork/scripts/:script/versions" :paramsDesc="['Script id, can be found in URL']" radar="1" />

### Script Feedback

<RouteEn author="miles170" example="/greasyfork/scripts/431691-bypass-all-shortlinks/feedback" path="/greasyfork/scripts/:script/feedback" :paramsDesc="['Script id, can be found in URL']" radar="1" />

## Hugo

### Release News

<RouteEn author="maokwen" example="/hugo/releases" path="/hugo/releases"/>

## iFi audio

### Download Hub

<RouteEn author="NavePnow" example="/ifi-audio/download/1503007035/44472" path="/ifi-audio/download/:val/:id" :paramsDesc="['product val', 'product id']"/>

::: warning

1.  Open <https://ifi-audio.com/download-hub> and the Network panel
2.  Select the device and the corresponding serial number in the website and click Search
3.  Find the last request named <https://ifi-audio.com/wp-admin/admin-ajax.php> in the Network panel, find out the val and id in the Payload panel, and fill in the url

:::

## ImageMagick

### Changelog

<RouteEn author="nczitzk" example="/imagemagick/changelog" path="/imagemagick/changelog"/>

## IPSW.me

### Apple Firmware Update-IPSWs/OTAs version

<RouteEn author="Jeason0228" example="/ipsw/index/ipsws/iPhone11,8" path="/ipsw/index/:ptype/:pname/" :paramsDesc="['Fill in ipsws or otas to get different versions of firmware','Product name, `http://rsshub.app/ipsw/index/ipsws/iPod`, if you fill in the iPad, follow the entire iPad series(ptype default to ipsws).`http://rsshub.app/ipsw/index/ipsws/iPhone11,8`, if you fill in the specific iPhone11,8, submit to the ipsws firmware information of this model']"/>

## Logseq

::: warning
Logseq dev team has abandoned the [old website](https://logseq.com/blog).
Please use <https://github.com/logseq/logseq/releases.atom> instead.
:::

## MacKed

### APP Update

<RouteEn author="HXHL" example="/macked/app/cleanmymac-x" path="/macked/app/:name" :paramsDesc="['app name, can be find in URL']"/>

## ManicTime

<RouteEn author="nczitzk" example="/manictime/releases" path="/manictime/releases"/>

## Microsoft Edge

### Addons Update

<RouteEn author="hoilc" example="/edge/addon/gangkeiaobmjcjokiofpkfpcobpbmnln" path="/edge/addon/:crxid" :paramsDesc="['Addon id, can be found in addon url']"/>

## Microsoft Store

### Updates

<RouteEn author="hellodword" example="/microsoft-store/updates/9WZDNCRFHVN5/CN" path="/microsoft-store/updates/:productid/:market?" :paramsDesc="['`Share` - `Copy Link` in the Store', '`CN` as default']" />

## Minecraft

Refer to [#minecraft](/en/game.html#minecraft)

## MIUI

### New firmware

<RouteEn author="Indexyz" example="/miui/aries/" path="/miui/:device/:type?/:region?" :paramsDesc="['the device `codename` eg. `aries` for Mi 2S','type', 'Region, default to `cn`']" >

| stable  | development |
| ------- | ----------- |
| release | dev         |

| region | region |
| ------ | ------ |
| China  | cn     |
| Global | global |

</RouteEn>

## Monster Hunter World

### Update

See [#Monster Hunter World](/en/game.html#monster-hunter-world)

## Neat Download Manager

### Download

<RouteEn author="nczitzk" example="/neatdownloadmanager/download" path="/neatdownloadmanager/download/:os?" :paramsDesc="['Operating system, windows or macos, all by default']"/>

## Nintendo Switch

### Switch System Update（Japan）

See [#nintendo](/game.html#nintendo)

## NPM

### Package

<RouteEn author="Fatpandac" example="/npm/package/rsshub" path="/npm/package/:name" :paramsDesc="['Package name']"/>

## Nvidia Web Driver

### Changelog

<RouteEn author="cielpy" example="/nvidia/webdriverupdate" path="/nvidia/webdriverupdate"/>

## O\&O Software

### Changelog

<RouteEn author="nczitzk" example="/oo-software/changelog/shutup10" path="/oo-software/changelog/:id" :paramsDesc="['Software id, see below, shutup10 by default, can be found in URL']">

| Software       | Id          |
| -------------- | ----------- |
| O&O ShutUp10++ | shutup10    |
| O&O AppBuster  | ooappbuster |
| O&O Lanytix    | oolanytix   |
| O&O DeskInfo   | oodeskinfo  |

</RouteEn>

## Obsidian

### Announcements

<RouteEn author="nczitzk" example="/obsidian/announcements" path="/obsidian/announcements"/>

## OpenWrt

### Releases

<RouteEn author="DIYgod" example="/openwrt/releases/xiaomi/xiaomi_redmi_router_ac2100" path="/releases/:brand/:model" :paramsDesc="['Device Model, can be found in url of `Table of Hardware` -> `Device Page`', 'Same as above']"/>

## PlayStation

### PlayStation 4 System Update

见 [#playstation](/game.html#playstation)

## Postman

### Release Notes

<RouteEn author="nczitzk" example="/postman/release-notes" path="/postman/release-notes"/>

## Potplayer

### Version History

<RouteEn author="nczitzk" example="/potplayer/update" path="/potplayer/update/:language?" :paramsDesc="['Language, see below, English by default']">

| 한국어 | 中文 (简体) | 中文 (繁体) | ENGLISH | Українська | РУССКИЙ | Polski |
| ------ | ----------- | ----------- | ------- | ---------- | ------- | ------ |
| ko     | zh_CN       | zh_TW       | en      | uk         | ru      | pl     |

</RouteEn>

## PuTTY

### Change Log

<RouteEn author="nczitzk" example="/putty/changes" path="/putty/changes"/>

## qBittorrent

### News

<RouteEn author="TonyRL" example="/qbittorrent/news" path="/qbittorrent/news" radar="1" rssbud="1"/>

## QNAP

### Release Notes

<RouteEn author="nczitzk" example="/qnap/release-notes/qts" path="/qnap/release-notes/:id" :paramsDesc="['OS id, see below']">

| QTS | QuTS hero | QuTScloud | QuWAN Orchestrator | QES | TAS | AfoBot |
| --- | --------- | --------- | ------------------ | --- | --- | ------ |
| qts | quts_hero | qutscloud | quwan_orchestrator | qes | tas | afobot |

</RouteEn>

## QTTabBar

### Change Log

<RouteEn author="nczitzk" example="/qttabbar/change-log" path="/qttabbar/change-log"/>

## RemNote

### Changelog

<RouteEn author="TonyRL" example="/remnote/changelog" path="/remnote/changelog" radar="1" rssbud="1"/>

## RescueTime

### Release Notes

<RouteEn author="nczitzk" example="/rescuetime/release-notes" path="/rescuetime/release-notes/:os?" :paramsDesc="['OS id, see below']">

| Mac OS | Windows |
| ------ | ------- |
| mac    | windows |

</RouteEn>

## RSSHub

### New routes

<RouteEn author="DIYgod" path="/rsshub/routes/:lang?" example="/rsshub/routes/en" :paramsDesc="['Language, `en` means English routes, other values or null means Chinese routes']"/>

### New sponsors

<RouteEn author="DIYgod" example="/rsshub/sponsors" path="/rsshub/sponsors" radar="1" rssbud="1"/>

## sketch.com

### Beta update

<RouteEn author="Jeason0228" example="/sketch/beta" path="/sketch/beta"  />

### Release update

<RouteEn author="Jeason0228" example="/sketch/updates" path="/sketch/updates"  />

## Sony

### Software Downloads

<RouteEn author="NavePnow" example="/sony/downloads/product/nw-wm1am2" path="/sony/downloads/:productType/:productId" :paramsDesc="['product type', 'product id']">

::: tip

Open `https://www.sony.com/electronics/support` and search for the corresponding product, such as `Sony A7M4`, the website corresponding to which is `https://www.sony.com/electronics/support/e-mount-body-ilce-7-series/ilce-7m4/downloads`, where `productType` is `e-mount-body-ilce-7-series` and `productId` is `ilce-7m4`.

:::

</RouteEn>


## Thunderbird

### Changelog

<RouteEn author="garywill" example="/thunderbird/release" path="/thunderbird/release"/>

## Total Commander

### What's New

<RouteEn author="nczitzk" example="/totalcommander/whatsnew" path="/totalcommander/whatsnew"/>

## TradingView

### Blog

<RouteEn author="nczitzk" example="/tradingview/blog/en" path="/tradingview/blog/:language?" :paramsDesc="['Language, see below, `en` as English by default']">

Language

| Id  | Language            |
| --- | ------------------- |
| en  | English             |
| ru  | Русский             |
| ja  | 日本語              |
| es  | Español             |
| tr  | Türkçe              |
| ko  | 한국어              |
| it  | Italiano            |
| pt  | Português do Brasil |
| de  | Deutsch             |
| fr  | Français            |
| pl  | Polski              |
| id  | Bahasa Indonesia    |
| my  | Bahasa Malaysia     |
| tw  | 繁體                |
| cn  | 简体                |
| vi  | Tiếng Việt          |
| th  | ภาษาไทย             |
| sv  | Svenska             |
| ar  | العربية             |
| il  | Hebrew              |

</RouteEn>

## Typora

### Changelog

<RouteEn author="cnzgray" example="/typora/changelog" path="/typora/changelog" radar="1"/>

### Dev Release Changelog

<RouteEn author="nczitzk" example="/typora/changelog/dev" path="/typora/changelog/dev" radar="1"/>

## VMware

### Flings

<RouteEn author="nczitzk" example="/vmware/flings" path="/vmware/flings"/>

## Western Digital

### Download

<RouteEn author="nczitzk" example="/wdc/download/279" path="/wdc/download/:id?" :paramsDesc="['Software id, can be found in URL, 279 as Western Digital Dashboard by default']"/>

## WizTree

### What's New

<RouteEn author="nczitzk" example="/diskanalyzer/whats-new" path="/diskanalyzer/whats-new"/>

## WziFile

### Version History

<RouteEn author="Fatpandac" example="/wizfile/updates" path="/wizfile/updates"/>

## X410

### News

<RouteEn author="nczitzk" example="/x410/news" path="/x410/news"/>

## Xiaomi.eu

### ROM Releases

<RouteEn author="maple3142" example="/xiaomieu/releases" path="/xiaomieu/releases"/>

## Xposed Module Repository

### Module Update

<RouteEn author="nczitzk" example="/xposed/module/com.ext.star.wars" path="/xposed/module/:mod" :paramsDesc="['module package name']"/>

## XYplorer

### What's New

<RouteEn author="nczitzk" example="/xyplorer/whatsnew" path="/xyplorer/whatsnew"/>

## Zotero

### Version History

<RouteEn author="jasongzy" example="/zotero/versions" path="/zotero/versions"/>
