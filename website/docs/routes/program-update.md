
# 🔄 Application Updates

## Amazon {#amazon}

### Kindle Software Updates {#amazon-kindle-software-updates}

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

### Versions {#apkpure-versions}

<Route author="maple3142" example="/apkpure/versions/jp.co.craftegg.band/jp" path="/apkpure/versions/:pkg/:region?" paramsDesc={['Package name', 'Region code, `en` by default']} radar="1" anticrawler="1" puppeteer="1"/>

## App Center {#app-center}

### Release {#app-center-release}

<Route author="Rongronggg9" example="/app-center/release/cloudflare/1.1.1.1-windows/beta" path="/app-center/release/:user/:app/:distribution_group" paramsDesc={['User', 'App name', 'Distribution group']} radar="1" rssbud="1">

:::tip

The parameters can be extracted from the Release page URL: `https://install.appcenter.ms/users/:user/apps/:app/distribution_groups/:distribution_group`

:::

</Route>

## App Store/Mac App Store {#app-store-mac-app-store}

### App Update {#app-store-mac-app-store-app-update}

<Route author="EkkoG nczitzk" example="/apple/apps/update/us/id408709785" path="/apple/apps/update/:country/:id/:platform?" paramsDesc={['App Store Country, obtain from the app URL, see below', 'App id, obtain from the app URL', 'App Platform, see below, all by default']} radar="1" rssbud="1">

| All | iOS | macOS | tvOS |
| --- | --- | ----- | ---- |
|     | iOS | macOS | tvOS |

:::tip

For example, the URL of [GarageBand](https://apps.apple.com/us/app/messages/id408709785) in the App Store is <https://apps.apple.com/us/app/messages/id408709785>. In this case, the `App Store Country` parameter for the route is `us`, and the `App id` parameter is `id1146560473`. So the route should be [`/apple/apps/update/us/id408709785`](https://rsshub.app/apple/apps/update/us/id408709785).

:::

</Route>

### Price Drop {#app-store-mac-app-store-price-drop}

<Route author="HenryQW" example="/appstore/price/us/mac/id1152443474" path="/appstore/price/:country/:type/:id" paramsDesc={['App Store Country, obtain from the app URL https://apps.apple.com/us/app/id1152443474, in this case, `us`', 'App type，either `iOS` or `mac`', 'App Store app id, obtain from the app URL https://apps.apple.com/us/app/id1152443474, in this case, `id1152443474`']} />

### In-App-Purchase Price Drop Alert {#app-store-mac-app-store-in-app-purchase-price-drop-alert}

<Route author="HenryQW" example="/appstore/iap/us/id953286746" path="/appstore/iap/:country/:id" paramsDesc={['App Store Country, obtain from the app URL https://apps.apple.com/us/app/id953286746, in this case, `us`', 'App Store app id, obtain from the app URL https://apps.apple.com/us/app/id953286746, in this case, `id953286746`']} />

### 每日精品限免 / 促销应用（鲜面连线 by AppSo） {#app-store-mac-app-store-mei-ri-jing-pin-xian-mian-cu-xiao-ying-yong-xian-mian-lian-xian-by-appso}

<Route author="Andiedie" example="/appstore/xianmian" path="/appstore/xianmian"/>

### 最新限免（GoFans） {#app-store-mac-app-store-zui-xin-xian-mian-gofans}

<Route author="HenryQW" example="/appstore/gofans" path="/appstore/gofans"/>

## aptonic {#aptonic}

### New Dropzone Actions {#aptonic-new-dropzone-actions}

<Route author="HenryQW" example="/aptonic/action" path="/aptonic/action/:untested?" paramsDesc={['Set any value to include untested actions.']}/>

## ASUS {#asus}

### BIOS {#asus-bios}

<Route author="Fatpandac" example="/asus/bios/RT-AX88U" path="/asus/bios/:model" paramsDesc={['Model, can be found in product page']}/>

### GPU Tweak {#asus-gpu-tweak}

<Route author="TonyRL" example="/asus/gpu-tweak" path="/asus/gpu-tweak" radar="1" rssbud="1"/>

## Bandisoft {#bandisoft}

### History {#bandisoft-history}

<Route author="nczitzk" example="/bandisoft/bandizip" path="/bandisoft/:id?/:lang?" paramsDesc={['Software id, see below, Bandizip by default', 'Language, see below, English by default']}>

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

</Route>

## Bilibili {#bilibili}

### 更新情报 {#bilibili-geng-xin-qing-bao}

<Route author="nczitzk" example="/bilibili/app/android" path="/bilibili/app/:id?" paramsDesc={['客户端 id，见下表，默认为安卓版']} />

| 安卓版  | iPhone 版 | iPad HD 版 | UWP 版 | TV 版          |
| ------- | --------- | ---------- | ------ | -------------- |
| android | iphone    | ipad       | win    | android_tv_yst |

## BlueStacks {#bluestacks}

### BlueStacks 5 Release Notes {#bluestacks-bluestacks-5-release-notes}

<Route author="TonyRL" example="/bluestacks/release/5" path="/bluestacks/release/5" radar="1" anticrawler="1" puppeteer="1"/>

## Brave {#brave}

### Release Notes {#brave-release-notes}

<Route author="nczitzk" example="/brave/latest" path="/brave/latest"/>

## Bugly SDK {#bugly-sdk}

### 更新日志 {#bugly-sdk-geng-xin-ri-zhi}

<Route author="EkkoG" example="/bugly/changelog/1" path="/bugly/changelog/:platform" paramsDesc={['平台类型, 必选, 1 为 Android, 2 为 iOS']}/>

## Cent Browser {#cent-browser}

### 更新日志 {#cent-browser-geng-xin-ri-zhi}

<Route author="hoilc" example="/centbrowser/history" path="/centbrowser/history"/>

## Checkra1n {#checkra1n}

### 新版本发布 {#checkra1n-xin-ban-ben-fa-bu}

<Route author="ntzyz" example="/checkra1n/releases" path="/checkra1n/releases"/>

## Chocolatey {#chocolatey}

### Software Update {#chocolatey-software-update}

<Route author="woodgear" example="/chocolatey/software/GoogleChrome" path="/chocolatey/software"/>

## Chrome Web Store {#chrome-web-store}

### Extensions Update {#chrome-web-store-extensions-update}

<Route author="DIYgod" example="/chrome/webstore/extensions/kefjpfngnndepjbopdmoebkipbgkggaa" path="/chrome/webstore/extensions/:id" paramsDesc={['Extension id, can be found in extension url']}/>

## Civitai {#civitai}

### Latest models {#civitai-latest-models}

<Route author="DIYgod" example="/civitai/models" path="/civitai/models"/>

### Model discussions {#civitai-model-discussions}

:::caution

Need to configure `CIVITAI_COOKIE` to obtain image information of NSFW models.

:::

<Route author="DIYgod" example="/civitai/discussions/4384" path="/civitai/discussions/:modelId"/>

## Clash {#clash}

### Premium Releases {#clash-premium-releases}

<Route author="ttttmr" example="/clash/premium" path="/clash/premium" radar="1" />

## CPUID {#cpuid}

### News {#cpuid-news}

<Route author="TonyRL" example="/cpuid/news" path="/cpuid/news" radar="1" rssbud="1"/>

## cpython {#cpython}

### 正式版本发布 {#cpython-zheng-shi-ban-ben-fa-bu}

<Route author="trim21" example="/cpython" path="/cpython" />

### 所有版本发布 {#cpython-suo-you-ban-ben-fa-bu}

<Route author="trim21" example="/cpython/pre" path="/cpython/pre" />

## CurseForge {#curseforge}

### File Update {#curseforge-file-update}

<Route author="junfengP" example="/curseforge/sc2/assets/taylor-mouses-stuff/files" path="/curseforge/:gameid/:catalogid/:projectid/files" paramsDesc={['Game name', 'Catalog name', 'Progect name']}>

For example: `https://www.curseforge.com/sc2/assets/taylor-mouses-stuff/files` to `/curseforge/sc2/assets/taylor-mouses-stuff/files`

</Route>

## Ditto clipboard manager {#ditto-clipboard-manager}

### Changes {#ditto-clipboard-manager-changes}

<Route author="nczitzk" example="/ditto/changes" path="/ditto/changes/:type?" paramsDesc={['Type, `beta` is an option']}/>

## Docker Hub {#docker-hub}

### Image New Build {#docker-hub-image-new-build}

<Route author="HenryQW" example="/dockerhub/build/wangqiru/ttrss" path="/dockerhub/build/:owner/:image/:tag?" paramsDesc={['Image owner', 'Image name', 'Image tag，default to latest']}>

:::caution

The owner of the official image fills in the library, for example: <https://rsshub.app/dockerhub/build/library/mysql>

:::

</Route>

### Image New Tag {#docker-hub-image-new-tag}

<Route author="outloudvi" example="/dockerhub/tag/library/mariadb" path="/dockerhub/tag/:owner/:image/:limits?" paramsDesc={['Image owner', 'Image name', 'Tag count, 10 by default']}>

:::caution

Use `library` as the `owner` for official images, such as <https://rsshub.app/dockerhub/tag/library/mysql>

:::

</Route>

## Eagle {#eagle}

### Changelog {#eagle-changelog}

<Route author="tigercubden" example="/eagle/changelog/en" path="/eagle/changelog/:language?" paramsDesc={['Language, see list, default to be `cn`']} radar="1">

Language

| Simplified Chinese | Traditional Chinese | English |
| ------------------ | ------------------- | ------- |
| cn                 | tw                  | en      |

</Route>

## Everything {#everything}

### Changes {#everything-changes}

<Route author="nczitzk" example="/everything/changes" path="/everything/changes"/>

## F-Droid {#f-droid}

### App Update {#f-droid-app-update}

<Route author="garywill" example="/fdroid/apprelease/com.termux" path="/fdroid/apprelease/:app" paramsDesc={['App\'s package name']} />

## fir.im 应用 {#fir.im-ying-yong}

### 更新 {#fir.im-ying-yong-geng-xin}

<Route author="EkkoG" example="/fir/update/xcz" path="/fir/update/:id" paramsDesc={['fir app id, 必选, 如 fir 生成的链接地址为 https://fir.im/xcz, 则 id 为 `xcz`']}/>

## Firefox {#firefox}

### New Release {#firefox-new-release}

<Route author="fengkx" example="/firefox/release/desktop" path="/firefox/release/:platform" paramsDesc={['the platform']} >

| Desktop | Android | Beta | Nightly | Android Beta | ESR           |
| ------- | ------- | ---- | ------- | ------------ | ------------- |
| desktop | android | beta | nightly | android-beta | organizations |

</Route>

### Add-ons Update {#firefox-add-ons-update}

<Route author="DIYgod" example="/firefox/addons/rsshub-radar" path="/firefox/addons/:id" paramsDesc={['Add-ons id, can be found in add-ons url']}/>

## fish shell {#fish-shell}

### Release Notes {#fish-shell-release-notes}

<Route author="x2cf" example="/fishshell" path="/fishshell" radar="1" />

## FossHub {#fosshub}

### Software Update {#fosshub-software-update}

<Route author="nczitzk" example="/fosshub/qBittorrent" path="/fosshub/:id" paramsDesc={['Software id, can be found in URL']}/>

## Greasy Fork {#greasy-fork}

### Script Update {#greasy-fork-script-update}

<Route author="imlonghao" path="/greasyfork/:language/:domain?" example="/greasyfork/en/google.com" paramsDesc={['language, located on the top right corner of Greasy Fork\'s search page, set to `all` for including all languages', 'the script\'s target domain']} radar="1" />

### Script Version History {#greasy-fork-script-version-history}

<Route author="miles170" example="/greasyfork/scripts/431691-bypass-all-shortlinks/versions" path="/greasyfork/scripts/:script/versions" paramsDesc={['Script id, can be found in URL']} radar="1" />

### Script Feedback {#greasy-fork-script-feedback}

<Route author="miles170" example="/greasyfork/scripts/431691-bypass-all-shortlinks/feedback" path="/greasyfork/scripts/:script/feedback" paramsDesc={['Script id, can be found in URL']} radar="1" />

## Hugo {#hugo}

### Release News {#hugo-release-news}

<Route author="maokwen" example="/hugo/releases" path="/hugo/releases"/>

## iFi audio {#ifi-audio}

### Download Hub {#ifi-audio-download-hub}

<Route author="NavePnow" example="/ifi-audio/download/1503007035/44472" path="/ifi-audio/download/:val/:id" paramsDesc={['product val', 'product id']}/>

:::caution

1.  Open <https://ifi-audio.com/download-hub> and the Network panel
2.  Select the device and the corresponding serial number in the website and click Search
3.  Find the last request named <https://ifi-audio.com/wp-admin/admin-ajax.php> in the Network panel, find out the val and id in the Payload panel, and fill in the url

:::

## ImageMagick {#imagemagick}

### Changelog {#imagemagick-changelog}

<Route author="nczitzk" example="/imagemagick/changelog" path="/imagemagick/changelog"/>

## Infuse {#infuse}

### Release Notes {#infuse-release-notes}

<Route author="NathanDai" example="/firecore/ios" path="/firecore/:os" paramsDesc={['`ios`,`tvos`,`macos`']}/>

## IPSW.me {#ipsw.me}

### Apple Firmware Update-IPSWs/OTAs version {#ipsw.me-apple-firmware-update-ipsws-otas-version}

<Route author="Jeason0228" example="/ipsw/index/ipsws/iPhone11,8" path="/ipsw/index/:ptype/:pname/" paramsDesc={['Fill in ipsws or otas to get different versions of firmware','Product name, `http://rsshub.app/ipsw/index/ipsws/iPod`, if you fill in the iPad, follow the entire iPad series(ptype default to ipsws).`http://rsshub.app/ipsw/index/ipsws/iPhone11,8`, if you fill in the specific iPhone11,8, submit to the ipsws firmware information of this model']}/>

## Logseq {#logseq}

:::caution

Logseq 开发团队已经放弃了 [旧网站](https://logseq.com/blog)。
请使用 <https://github.com/logseq/logseq/releases.atom> 代替。

:::

## MacKed {#macked}

### APP Update {#macked-app-update}

<Route author="HXHL" example="/macked/app/cleanmymac-x" path="/macked/app/:name" paramsDesc={['app name, can be found in URL']}/>

## MacUpdate {#macupdate}

### Update {#macupdate-update}

<Route author="TonyRL" example="/macupdate/app/11942" path="/macupdate/app/:appId/:appSlug?" paramsDesc={['Application unique ID, can be found in URL', 'Application slug, can be found in URL']} radar="1"/>

## MacWk {#macwk}

### 应用更新 {#macwk-ying-yong-geng-xin}

<Route author="f48vj" example="/macwk/soft/sublime-text" path="/macwk/soft/:name" paramsDesc={['应用名，可在应用页 URL 中找到']} radar="1" rssbud="1"/>

## ManicTime {#manictime}

<Route author="nczitzk" example="/manictime/releases" path="/manictime/releases"/>

## Mathpix {#mathpix}

<Route author="nczitzk" example="/mathpix/blog" path="/mathpix/blog"/>

## Microsoft Edge {#microsoft-edge}

### Addons Update {#microsoft-edge-addons-update}

<Route author="hoilc" example="/edge/addon/gangkeiaobmjcjokiofpkfpcobpbmnln" path="/edge/addon/:crxid" paramsDesc={['Addon id, can be found in addon url']}/>

## Microsoft Store {#microsoft-store}

### Updates {#microsoft-store-updates}

<Route author="hellodword" example="/microsoft-store/updates/9WZDNCRFHVN5/CN" path="/microsoft-store/updates/:productid/:market?" paramsDesc={['`Share` - `Copy Link` in the Store', '`CN` as default']} />

## MIUI {#miui}

### New firmware {#miui-new-firmware}

<Route author="Indexyz" example="/miui/aries/" path="/miui/:device/:type?/:region?" paramsDesc={['the device `codename` eg. `aries` for Mi 2S','type', 'Region, default to `cn`']} >

| stable  | development |
| ------- | ----------- |
| release | dev         |

| region | region |
| ------ | ------ |
| China  | cn     |
| Global | global |

</Route>

## Neat Download Manager {#neat-download-manager}

### Download {#neat-download-manager-download}

<Route author="nczitzk" example="/neatdownloadmanager/download" path="/neatdownloadmanager/download/:os?" paramsDesc={['Operating system, windows or macos, all by default']}/>

## Not a Tesla App {#not-a-tesla-app}

### Tesla Software Updates {#not-a-tesla-app-tesla-software-updates}

<Route author="mrbruce516" example="/notateslaapp/ota" path="/notateslaapp/ota" radar="1"/>

## NPM {#npm}

### Package {#npm-package}

<Route author="Fatpandac" example="/npm/package/rsshub" path="/npm/package/:name" paramsDesc={['Package name']}/>

## Nvidia Web Driver {#nvidia-web-driver}

### Changelog {#nvidia-web-driver-changelog}

<Route author="EkkoG" example="/nvidia/webdriverupdate" path="/nvidia/webdriverupdate"/>

## O&O Software {#o-o-software}

### Changelog {#o-o-software-changelog}

<Route author="nczitzk" example="/oo-software/changelog/shutup10" path="/oo-software/changelog/:id" paramsDesc={['Software id, see below, shutup10 by default, can be found in URL']}>

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

<Route author="DIYgod" example="/openwrt/releases/xiaomi/xiaomi_redmi_router_ac2100" path="/releases/:brand/:model" paramsDesc={['Device Model, can be found in url of `Table of Hardware` -> `Device Page`', 'Same as above']}/>

## Postman {#postman}

### Release Notes {#postman-release-notes}

<Route author="nczitzk" example="/postman/release-notes" path="/postman/release-notes"/>

## Potplayer {#potplayer}

### Version History {#potplayer-version-history}

<Route author="nczitzk" example="/potplayer/update" path="/potplayer/update/:language?" paramsDesc={['Language, see below, English by default']}>

| 한국어 | 中文 (简体) | 中文 (繁体) | ENGLISH | Українська | РУССКИЙ | Polski |
| ------ | ----------- | ----------- | ------- | ---------- | ------- | ------ |
| ko     | zh_CN       | zh_TW       | en      | uk         | ru      | pl     |

</Route>

## PuTTY {#putty}

### Change Log {#putty-change-log}

<Route author="nczitzk" example="/putty/changes" path="/putty/changes"/>

## qBittorrent {#qbittorrent}

### News {#qbittorrent-news}

<Route author="TonyRL" example="/qbittorrent/news" path="/qbittorrent/news" radar="1" rssbud="1"/>

## QNAP {#qnap}

### Release Notes {#qnap-release-notes}

<Route author="nczitzk" example="/qnap/release-notes/qts" path="/qnap/release-notes/:id" paramsDesc={['OS id, see below']}>

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

### Changelog {#remnote-changelog}

<Route author="TonyRL" example="/remnote/changelog" path="/remnote/changelog" radar="1" rssbud="1"/>

## RescueTime {#rescuetime}

### Release Notes {#rescuetime-release-notes}

<Route author="nczitzk" example="/rescuetime/release-notes" path="/rescuetime/release-notes/:os?" paramsDesc={['OS id, see below']}>

| Mac OS | Windows |
| ------ | ------- |
| mac    | windows |

</Route>

## RSSHub {#rsshub}

### New routes {#rsshub-new-routes}

<Route author="DIYgod" path="/rsshub/routes/:lang?" example="/rsshub/routes/en" paramsDesc={['Language, `zh` means Chinese docs, other values or null means English docs, `en` by default']}/>

### New sponsors {#rsshub-new-sponsors}

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

### Beta update {#sketch.com-beta-update}

<Route author="Jeason0228" example="/sketch/beta" path="/sketch/beta"  />

### Release update {#sketch.com-release-update}

<Route author="Jeason0228" example="/sketch/updates" path="/sketch/updates"  />

## Sony {#sony}

### Software Downloads {#sony-software-downloads}

<Route author="NavePnow" example="/sony/downloads/product/nw-wm1am2" path="/sony/downloads/:productType/:productId" paramsDesc={['product type', 'product id']}>

:::tip

Open `https://www.sony.com/electronics/support` and search for the corresponding product, such as `Sony A7M4`, the website corresponding to which is `https://www.sony.com/electronics/support/e-mount-body-ilce-7-series/ilce-7m4/downloads`, where `productType` is `e-mount-body-ilce-7-series` and `productId` is `ilce-7m4`.

:::

</Route>

## SourceForge {#sourceforge}

<Route author="JimenezLi" example="/sourceforge/topic=artificial-intelligence&os=windows" path="/sourceforge/:routeParams?" paramsDesc={['route params, see below']}>

For some URL like [https://sourceforge.net/directory/artificial-intelligence/windows/](https://sourceforge.net/directory/artificial-intelligence/windows/), it is equal to [https://sourceforge.net/directory/?topic=artificial-intelligence&os=windows"](https://sourceforge.net/directory/?topic=artificial-intelligence&os=windows), thus subscribing to `/sourceforge/topic=artificial-intelligence&os=windows`.

URL params can duplicate, such as `/sourceforge/topic=artificial-intelligence&os=windows&os=linux`.

</Route>

## Thunderbird {#thunderbird}

### Changelog {#thunderbird-changelog}

<Route author="garywill" example="/thunderbird/release" path="/thunderbird/release"/>

## Total Commander {#total-commander}

### What's New {#total-commander-what-s-new}

<Route author="nczitzk" example="/totalcommander/whatsnew" path="/totalcommander/whatsnew"/>

## TradingView {#tradingview}

### Blog {#tradingview-blog}

<Route author="nczitzk" example="/tradingview/blog/en" path="/tradingview/blog/:language?" paramsDesc={['Language, see below, `en` as English by default']}>

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

<Route author="nczitzk" example="/wdc/download/279" path="/wdc/download/:id?" paramsDesc={['Software id, can be found in URL, 279 as Western Digital Dashboard by default']}/>

## winstall {#winstall}

### Apps Update {#winstall-apps-update}

<Route author="TonyRL" example="/winstall/Mozilla.Firefox" path="/winstall/:appId" paramsDesc={['Application ID']} radar="1"/>

## WizTree {#wiztree}

### What's New {#wiztree-what-s-new}

<Route author="nczitzk" example="/diskanalyzer/whats-new" path="/diskanalyzer/whats-new"/>

## WziFile {#wzifile}

### Version History {#wzifile-version-history}

<Route author="Fatpandac" example="/wizfile/updates" path="/wizfile/updates"/>

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

### Module Update {#xposed-module-repository-module-update}

<Route author="nczitzk" example="/xposed/module/com.ext.star.wars" path="/xposed/module/:mod" paramsDesc={['module package name']}/>

## XYplorer {#xyplorer}

### What's New {#xyplorer-what-s-new}

<Route author="nczitzk" example="/xyplorer/whatsnew" path="/xyplorer/whatsnew"/>

## Zotero {#zotero}

### Version History {#zotero-version-history}

<Route author="jasongzy" example="/zotero/versions" path="/zotero/versions"/>

## 蒲公英应用分发 {#pu-gong-ying-ying-yong-fen-fa}

### app 更新 {#pu-gong-ying-ying-yong-fen-fa-app-geng-xin}

<Route author="zytomorrow" example="/pgyer/:app" path="/pgyer/kz-test" paramsDesc={['app为下载页最后的路径']} radar="1" rssbud="1"/>

## 腾讯云移动直播 SDK {#teng-xun-yun-yi-dong-zhi-bo-sdk}

### 更新日志 {#teng-xun-yun-yi-dong-zhi-bo-sdk-geng-xin-ri-zhi}

<Route author="EkkoG" example="/qcloud/mlvb/changelog" path="/qcloud/mlvb/changelog"/>

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

