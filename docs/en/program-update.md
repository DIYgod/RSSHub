---
pageClass: routes
---

# Application Updates

## App Store/Mac App Store

### App Update

<RouteEn author="cielpy" example="/appstore/update/us/id697846300" path="/appstore/update/:country/:id" :paramsDesc="['App Store Country, obtain from the app URL `https://apps.apple.com/us/app/reeder-3/id697846300?mt=8`, in this case, `us`', 'App Store app id, obtain from the app URL `https://apps.apple.com/us/app/reeder-3/id697846300?mt=8`, in this case, `id697846300`']" />

### Price Drop

<RouteEn author="HenryQW" example="/appstore/price/us/mac/id1152443474" path="/appstore/price/:country/:type/:id" :paramsDesc="['App Store Country, obtain from the app URL https://apps.apple.com/us/app/id1152443474, in this case, `us`', 'App type，either `iOS` or `mac`', 'App Store app id, obtain from the app URL https://apps.apple.com/us/app/id1152443474, in this case, `id1152443474`']" />

### In-App-Purchase Price Drop Alert

<RouteEn author="HenryQW" example="/appstore/iap/us/id953286746" path="/appstore/iap/:country/:id" :paramsDesc="['App Store Country, obtain from the app URL https://apps.apple.com/us/app/id953286746, in this case, `us`', 'App Store app id, obtain from the app URL https://apps.apple.com/us/app/id953286746, in this case, `id953286746`']" />

## Docker Hub

### Image New Build

<RouteEn author="HenryQW" example="/dockerhub/build/wangqiru/ttrss" path="/dockerhub/build/:owner/:image/:tag?" :paramsDesc="['Image owner', 'Image name', 'Image tag，default to latest']"/>

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

## Greasy Fork

### Script Update

<RouteEn author="imlonghao" path="/greasyfork/:language/:domain?" example="/greasyfork/en/google.com" :paramsDesc="['language, located on the top right corner of Greasy Fork\'s search page, set to `all` for including all languages', 'the script\'s target domain']" />

## MIUI

### New firmware

<RouteEn author="Indexyz" example="/miui/aries/" path="/miui/:device/:type?" :paramsDesc="['the device `codename` eg. `aries` for Mi 2S','type']" >

| stable  | development |
| ------- | ----------- |
| release | dev         |

</RouteEn>

## Nvidia Web Driver

### Changelog

<RouteEn author="cielpy" example="/nvidia/webdriverupdate" path="/nvidia/webdriverupdate"/>

## RSSHub

### Update

<RouteEn path="/rsshub/rss" example="/rsshub/rss" />

## Thunderbird

### Changelog

<RouteEn author="garywill" example="/thunderbird/release" path="/thunderbird/release"/>
