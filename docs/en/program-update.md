---
pageClass: routes
---

# Application Updates

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

<RouteEn author="HenryQW" example="/aptonic/action" path="/aptonic/action"/>

## Chocolatey

### Software Update

<RouteEn author="woodgear" example="/chocolatey/software/GoogleChrome" path="/chocolatey/software"/>

## Chrome Web Store

### Extensions Update

<RouteEn author="DIYgod" example="/chrome/webstore/extensions/kefjpfngnndepjbopdmoebkipbgkggaa" path="/chrome/webstore/extensions/:id" :paramsDesc="['Extension id, can be found in extension url']/>

## CurseForge

### File Update

<RouteEn author="junfengP" example="/curseforge/sc2/assets/taylor-mouses-stuff/files" path="/curseforge/:gameid/:catalogid/:projectid/files" :paramsDesc="['Game name', 'Catalog name', 'Progect name']"/>

For example: `https://www.curseforge.com/sc2/assets/taylor-mouses-stuff/files` to `/curseforge/sc2/assets/taylor-mouses-stuff/files`

</RouteEn>

## Docker Hub

### Image New Build

<RouteEn author="HenryQW" example="/dockerhub/build/wangqiru/ttrss" path="/dockerhub/build/:owner/:image/:tag?" :paramsDesc="['Image owner', 'Image name', 'Image tag，default to latest']"/>

::: warning

The owner of the official image fills in the library, for example: https://rsshub.app/dockerhub/build/library/mysql

:::

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

<RouteEn author="DIYgod" example="/firefox/addons/rsshub-radar" path="/firefox/addons/:id" :paramsDesc="['Add-ons id, can be found in add-ons url']/>

## Greasy Fork

### Script Update

<RouteEn author="imlonghao" path="/greasyfork/:language/:domain?" example="/greasyfork/en/google.com" :paramsDesc="['language, located on the top right corner of Greasy Fork\'s search page, set to `all` for including all languages', 'the script\'s target domain']" />

## IPSW.me

### Apple Firmware Update-IPSWs/OTAs version

<RouteEn author="Jeason0228" example="/ipsw/index/ipsws/iPhone11,8" path="/ipsw/index/:ptype/:pname/" :paramsDesc="['Fill in ipsws or otas to get different versions of firmware','Product name, `http://rsshub.app/ipsw/index/ipsws/iPod`, if you fill in the iPad, follow the entire iPad series(ptype default to ipsws).`http://rsshub.app/ipsw/index/ipsws/iPhone11,8`, if you fill in the specific iPhone11,8, submit to the ipsws firmware information of this model']"/>

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

## PlayStation

### PlayStation 4 System Update

见 [#playstation](/game.html#playstation)

## RSSHub

### New routes

<RouteEn path="/rsshub/routes" example="/rsshub/routes" />

### New sponsors

<Route author="DIYgod" example="/rsshub/sponsors" path="/rsshub/sponsors" radar="1"/>

## sketch.com

### Beta update

<RouteEn author="Jeason0228" example="/sketch/beta" path="/sketch/beta"  />

### Release update

<RouteEn author="Jeason0228" example="/sketch/updates" path="/sketch/updates"  />

## Thunderbird

### Changelog

<RouteEn author="garywill" example="/thunderbird/release" path="/thunderbird/release"/>

## Typora

### Changelog

<RouteEn author="cnzgray" example="/typora/changelog" path="/typora/changelog"/>

## Xiaomi.eu

### ROM Releases

<RouteEn author="maple3142" example="/xiaomieu/releases" path="/xiaomieu/releases"/>
