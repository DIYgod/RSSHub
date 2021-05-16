---
pageClass: routes
---

# Application Updates

## Anki

### Changes

<Route author="nczitzk" example="/anki/changes" path="/anki/changes"/>

## AnyTXT

### Release Notes

<Route author="nczitzk" example="/anytxt/release-notes" path="/anytxt/release-notes"/>

## Apkpure

### Versions

<RouteEn author="maple3142" example="/apkpure/versions/jp/jp.co.craftegg.band" path="/apkpure/versions/:region/:pkg" :paramsDesc="['Region code', 'package name']"/>

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

## Bandisoft

### History

<RouteEn author="nczitzk" example="/bandisoft/bandizip" path="/bandisoft/:id?/:lang?" :paramsDesc="['Software id, see below, Bandizip by default', 'Language, see below, English by default']">

Software id

| Bandizip (Win) | Bandizip (Mac) | Honeycam | Honeyview |
| -------------- | -------------- | -------- | --------- |
| bandizip       | bandizip.mac   | honeycam | honeyview |

Language

| English | en |
| 中文 (简体) | cn |
| 中文 (繁體) | tw |
| 日本語 | jp |
| Русский | ru |
| Español | es |
| Français | fr |
| Deutsch | de |
| Italiano | it |
| Slovenčina | sk |
| Українська | uk |
| Беларуская | be |
| Dansk | da |
| Polski | pl |
| Português Brasileiro | br |
| Čeština | cs |
| Nederlands | nl |
| Slovenščina| sl |
| Türkçe| tr  |
| ภาษาไทย | th |
| 한국어 | kr |

</RouteEn>

## Chocolatey

### Software Update

<RouteEn author="woodgear" example="/chocolatey/software/GoogleChrome" path="/chocolatey/software"/>

## Chrome Web Store

### Extensions Update

<RouteEn author="DIYgod" example="/chrome/webstore/extensions/kefjpfngnndepjbopdmoebkipbgkggaa" path="/chrome/webstore/extensions/:id" :paramsDesc="['Extension id, can be found in extension url']"/>

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

<RouteEn author="HenryQW" example="/dockerhub/build/wangqiru/ttrss" path="/dockerhub/build/:owner/:image/:tag?" :paramsDesc="['Image owner', 'Image name', 'Image tag，default to latest']"/>

::: warning

The owner of the official image fills in the library, for example: https://rsshub.app/dockerhub/build/library/mysql

:::

## Eagle

### Changelog

<RouteEn author="tigercubden" example="/eagle/changelog/en" path="/eagle/changelog/:language?" :paramsDesc="['Language, see list, default to be `cn`']" radar="1">
  
Language

| Simplified Chinese | Traditional Chinese | English |
| ------ | -------- | -------- |
|  cn  |  tw  |  en  |
    
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

## Greasy Fork

### Script Update

<RouteEn author="imlonghao" path="/greasyfork/:language/:domain?" example="/greasyfork/en/google.com" :paramsDesc="['language, located on the top right corner of Greasy Fork\'s search page, set to `all` for including all languages', 'the script\'s target domain']" />

## Hugo

### Release News

<Route author="maokwen" example="/hugo/releases" path="/hugo/releases"/>

## IPSW.me

### Apple Firmware Update-IPSWs/OTAs version

<RouteEn author="Jeason0228" example="/ipsw/index/ipsws/iPhone11,8" path="/ipsw/index/:ptype/:pname/" :paramsDesc="['Fill in ipsws or otas to get different versions of firmware','Product name, `http://rsshub.app/ipsw/index/ipsws/iPod`, if you fill in the iPad, follow the entire iPad series(ptype default to ipsws).`http://rsshub.app/ipsw/index/ipsws/iPhone11,8`, if you fill in the specific iPhone11,8, submit to the ipsws firmware information of this model']"/>

## Logseq

### Changelog

<RouteEn author="nczitzk" example="/logseq/changelog" path="/logseq/changelog"/>

## MacKed

### APP Update

<Route author="HXHL" example="/macked/app/cleanmymac-x" path="/macked/app/:name" :paramsDesc="['app name, can be find in URL']"/>

## ManicTime

<RouteEn author="nczitzk" example="/manictime/releases" path="/manictime/releases"/>

## Microsoft Edge

### Addons Update

<RouteEn author="hoilc" example="/edge/addon/gangkeiaobmjcjokiofpkfpcobpbmnln" path="/edge/addon/:crxid" :paramsDesc="['Addon id, can be found in addon url']"/>

## Microsoft Store

### Updates

<Route author="hellodword" example="/microsoft-store/updates/9WZDNCRFHVN5/CN" path="/microsoft-store/updates/:productid/:market?" :paramsDesc="['`Share` - `Copy Link` in the Store', '`CN` as default']" />

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

见 [#Monster Hunter World](/en/game.html#monster-hunter-world)

## Nintendo Switch

### Switch System Update（Japan）

见 [#nintendo](/game.html#nintendo)

## Nvidia Web Driver

### Changelog

<RouteEn author="cielpy" example="/nvidia/webdriverupdate" path="/nvidia/webdriverupdate"/>

## Obsidian

### Announcements

<RouteEn author="nczitzk" example="/obsidian/announcements" path="/obsidian/announcements"/>

## PlayStation

### PlayStation 4 System Update

见 [#playstation](/game.html#playstation)

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

## RescueTime

### Release Notes

<RouteEn author="nczitzk" example="/rescuetime/release-notes" path="/rescuetime/release-notes/:os?" :paramsDesc="['OS id, see below']">

| Mac OS | Windows |
| - | - |
| mac | windows |

</RouteEn>

## RSSHub

### New routes

<RouteEn path="/rsshub/routes" example="/rsshub/routes" />

### New sponsors

<RouteEn author="DIYgod" example="/rsshub/sponsors" path="/rsshub/sponsors" radar="1" rssbud="1"/>

## sketch.com

### Beta update

<RouteEn author="Jeason0228" example="/sketch/beta" path="/sketch/beta"  />

### Release update

<RouteEn author="Jeason0228" example="/sketch/updates" path="/sketch/updates"  />

## Thunderbird

### Changelog

<RouteEn author="garywill" example="/thunderbird/release" path="/thunderbird/release"/>

## Total Commander

### What's New

<RouteEn author="nczitzk" example="/totalcommander/whatsnew" path="/totalcommander/whatsnew"/>

## Typora

### Changelog

<RouteEn author="cnzgray" example="/typora/changelog" path="/typora/changelog"/>

## Xiaomi.eu

### ROM Releases

<RouteEn author="maple3142" example="/xiaomieu/releases" path="/xiaomieu/releases"/>

## Xposed Module Repository

### Module Update

<RouteEn author="nczitzk" example="/xposed/module/com.ext.star.wars" path="/xposed/module/:mod" :paramsDesc="['module package name']"/>

## XYplorer

### What's New

<RouteEn author="nczitzk" example="/xyplorer/whatsnew" path="/xyplorer/whatsnew"/>

