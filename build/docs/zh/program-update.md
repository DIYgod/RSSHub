# 🔄 程序更新

## Amazon <Site url="amazon.com"/>

### Kindle Software Updates <Site url="amazon.com" size="sm" />

<Route namespace="amazon" :data='{"path":"/kindle/software-updates","categories":["program-update"],"example":"/amazon/kindle/software-updates","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Kindle Software Updates","maintainers":["EthanWng97"],"location":"kindle-software-updates.ts"}' />

### Unknown <Site url="amazon.com" size="sm" />

<Route namespace="amazon" :data='{"path":"/awsblogs/:locale?","name":"Unknown","maintainers":["HankChow"],"location":"awsblogs.ts"}' />

## Android <Site url="developer.android.com"/>

### SDK Platform Tools release notes <Site url="developer.android.com/studio/releases/platform-tools" size="sm" />

<Route namespace="android" :data='{"path":"/platform-tools-releases","categories":["program-update"],"example":"/android/platform-tools-releases","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["developer.android.com/studio/releases/platform-tools","developer.android.com/"]}],"name":"SDK Platform Tools release notes","maintainers":["nczitzk"],"url":"developer.android.com/studio/releases/platform-tools","location":"platform-tools-releases.ts"}' />

## APKPure <Site url="apkpure.com"/>

### Versions <Site url="apkpure.com" size="sm" />

<Route namespace="apkpure" :data='{"path":"/versions/:pkg/:region?","categories":["program-update"],"example":"/apkpure/versions/jp.co.craftegg.band/jp","parameters":{"pkg":"Package name","region":"Region code, `en` by default"},"features":{"requireConfig":false,"requirePuppeteer":true,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Versions","maintainers":["maple3142"],"location":"versions.ts"}' />

## App Center <Site url="install.appcenter.ms"/>

### Release <Site url="install.appcenter.ms" size="sm" />

<Route namespace="app-center" :data='{"path":"/release/:user/:app/:distribution_group","categories":["program-update"],"example":"/app-center/release/cloudflare/1.1.1.1-windows/beta","parameters":{"user":"User","app":"App name","distribution_group":"Distribution group"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["install.appcenter.ms/users/:user/apps/:app/distribution_groups/:distribution_group","install.appcenter.ms/orgs/:user/apps/:app/distribution_groups/:distribution_group"]}],"name":"Release","maintainers":["Rongronggg9"],"description":":::tip\n  The parameters can be extracted from the Release page URL: `https://install.appcenter.ms/users/:user/apps/:app/distribution_groups/:distribution_group`\n  :::","location":"release.ts"}' />

:::tip
  The parameters can be extracted from the Release page URL: `https://install.appcenter.ms/users/:user/apps/:app/distribution_groups/:distribution_group`
  :::

## Apple <Site url="apps.apple.com"/>

### App Update <Site url="apps.apple.com" size="sm" />

<Route namespace="apple" :data='{"path":"/apps/update/:country/:id/:platform?","categories":["program-update"],"example":"/apple/apps/update/us/id408709785","parameters":{"country":"App Store Country, obtain from the app URL, see below","id":"App id, obtain from the app URL","platform":"App Platform, see below, all by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["apps.apple.com/:country/app/:appSlug/:id","apps.apple.com/:country/app/:id"],"target":"/apps/update/:country/:id"}],"name":"App Update","maintainers":["EkkoG","nczitzk"],"description":"| All | iOS | macOS | tvOS |\n  | --- | --- | ----- | ---- |\n  |     | iOS | macOS | tvOS |\n\n  :::tip\n  For example, the URL of [GarageBand](https://apps.apple.com/us/app/messages/id408709785) in the App Store is `https://apps.apple.com/us/app/messages/id408709785`. In this case, the `App Store Country` parameter for the route is `us`, and the `App id` parameter is `id1146560473`. So the route should be [`/apple/apps/update/us/id408709785`](https://rsshub.app/apple/apps/update/us/id408709785).\n  :::","location":"apps.ts"}' />

| All | iOS | macOS | tvOS |
  | --- | --- | ----- | ---- |
  |     | iOS | macOS | tvOS |

  :::tip
  For example, the URL of [GarageBand](https://apps.apple.com/us/app/messages/id408709785) in the App Store is `https://apps.apple.com/us/app/messages/id408709785`. In this case, the `App Store Country` parameter for the route is `us`, and the `App id` parameter is `id1146560473`. So the route should be [`/apple/apps/update/us/id408709785`](https://rsshub.app/apple/apps/update/us/id408709785).
  :::

## App Store/Mac App Store <Site url="apps.apple.com"/>

### In-App-Purchase Price Drop Alert <Site url="apps.apple.com" size="sm" />

<Route namespace="appstore" :data='{"path":"/iap/:country/:id","categories":["program-update"],"example":"/appstore/iap/us/id953286746","parameters":{"country":"App Store Country, obtain from the app URL https://apps.apple.com/us/app/id953286746, in this case, `us`","id":"App Store app id, obtain from the app URL https://apps.apple.com/us/app/id953286746, in this case, `id953286746`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"In-App-Purchase Price Drop Alert","maintainers":["HenryQW"],"location":"in-app-purchase.ts"}' />

### Price Drop <Site url="apps.apple.com/" size="sm" />

<Route namespace="appstore" :data='{"path":"/price/:country/:type/:id","categories":["program-update"],"example":"/appstore/price/us/mac/id1152443474","parameters":{"country":"App Store Country, obtain from the app URL https://apps.apple.com/us/app/id1152443474, in this case, `us`","type":"App type，either `iOS` or `mac`","id":"App Store app id, obtain from the app URL https://apps.apple.com/us/app/id1152443474, in this case, `id1152443474`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["apps.apple.com/"]}],"name":"Price Drop","maintainers":["HenryQW"],"url":"apps.apple.com/","location":"price.ts"}' />

### 每日精品限免 / 促销应用（鲜面连线 by AppSo） <Site url="app.so/xianmian" size="sm" />

<Route namespace="appstore" :data='{"path":"/xianmian","categories":["program-update"],"example":"/appstore/xianmian","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["app.so/xianmian"]}],"name":"每日精品限免 / 促销应用（鲜面连线 by AppSo）","maintainers":["Andiedie"],"url":"app.so/xianmian","location":"xianmian.ts"}' />

## ASUS <Site url="asus.com.cn"/>

### BIOS <Site url="asus.com.cn/" size="sm" />

<Route namespace="asus" :data='{"path":"/bios/:model","categories":["program-update"],"example":"/asus/bios/RT-AX88U","parameters":{"model":"Model, can be found in product page"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["asus.com.cn/"]}],"name":"BIOS","maintainers":["Fatpandac"],"url":"asus.com.cn/","location":"bios.ts"}' />

### GPU Tweak <Site url="asus.com/campaign/GPU-Tweak-III/*" size="sm" />

<Route namespace="asus" :data='{"path":"/gpu-tweak","categories":["program-update"],"example":"/asus/gpu-tweak","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["asus.com/campaign/GPU-Tweak-III/*","asus.com/"]}],"name":"GPU Tweak","maintainers":["TonyRL"],"url":"asus.com/campaign/GPU-Tweak-III/*","location":"gpu-tweak.ts"}' />

## Bilibili <Site url="www.bilibili.com"/>

### 更新情报 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/app/:id?","categories":["program-update"],"example":"/bilibili/app/android","parameters":{"id":"客户端 id，见下表，默认为安卓版"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"更新情报","maintainers":["nczitzk"],"description":"| 安卓版  | iPhone 版 | iPad HD 版 | UWP 版 | TV 版            |\n| ------- | --------- | ---------- | ------ | ---------------- |\n| android | iphone    | ipad       | win    | android_tv_yst |","location":"app.ts"}' />

| 安卓版  | iPhone 版 | iPad HD 版 | UWP 版 | TV 版            |
| ------- | --------- | ---------- | ------ | ---------------- |
| android | iphone    | ipad       | win    | android_tv_yst |

## BlueStacks <Site url="bluestacks.com"/>

### BlueStacks 5 Release Notes <Site url="bluestacks.com/hc/en-us/articles/360056960211-Release-Notes-BlueStacks-5" size="sm" />

<Route namespace="bluestacks" :data='{"path":"/release/5","categories":["program-update"],"example":"/bluestacks/release/5","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":true,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["bluestacks.com/hc/en-us/articles/360056960211-Release-Notes-BlueStacks-5","bluestacks.com/"]}],"name":"BlueStacks 5 Release Notes","maintainers":["TonyRL"],"url":"bluestacks.com/hc/en-us/articles/360056960211-Release-Notes-BlueStacks-5","location":"release.ts"}' />

## Brave <Site url="brave.com"/>

### Release Notes <Site url="brave.com/latest" size="sm" />

<Route namespace="brave" :data='{"path":"/latest","categories":["program-update"],"example":"/brave/latest","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["brave.com/latest","brave.com/"]}],"name":"Release Notes","maintainers":["nczitzk"],"url":"brave.com/latest","location":"latest.ts"}' />

## Civitai <Site url="civitai.com"/>

### Latest models <Site url="civitai.com/" size="sm" />

<Route namespace="civitai" :data='{"path":"/models","categories":["program-update"],"example":"/civitai/models","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["civitai.com/"]}],"name":"Latest models","maintainers":["DIYgod"],"url":"civitai.com/","location":"models.ts"}' />

### Model discussions <Site url="civitai.com" size="sm" />

<Route namespace="civitai" :data='{"path":"/discussions/:modelId","categories":["program-update"],"example":"/civitai/discussions/4384","parameters":{"modelId":"N"},"features":{"requireConfig":[{"name":"CIVITAI_COOKIE","description":""}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["civitai.com/models/:modelId"]}],"name":"Model discussions","maintainers":["DIYgod"],"description":":::warning\nNeed to configure `CIVITAI_COOKIE` to obtain image information of NSFW models.\n:::","location":"discussions.ts"}' />

:::warning
Need to configure `CIVITAI_COOKIE` to obtain image information of NSFW models.
:::

## CPUID <Site url="cpuid.com"/>

### News <Site url="cpuid.com/news.html" size="sm" />

<Route namespace="cpuid" :data='{"path":"/news","categories":["program-update"],"example":"/cpuid/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["cpuid.com/news.html","cpuid.com/"]}],"name":"News","maintainers":[],"url":"cpuid.com/news.html","location":"news.ts"}' />

## Docker Hub <Site url="hub.docker.com"/>

### Image New Build <Site url="hub.docker.com" size="sm" />

<Route namespace="dockerhub" :data='{"path":"/build/:owner/:image/:tag?","categories":["program-update"],"example":"/dockerhub/build/wangqiru/ttrss","parameters":{"owner":"Image owner","image":"Image name","tag":"Image tag，default to latest"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Image New Build","maintainers":["HenryQW"],"description":":::warning\n  The owner of the official image fills in the library, for example: [https://rsshub.app/dockerhub/build/library/mysql](https://rsshub.app/dockerhub/build/library/mysql)\n  :::","location":"build.ts"}' />

:::warning
  The owner of the official image fills in the library, for example: [https://rsshub.app/dockerhub/build/library/mysql](https://rsshub.app/dockerhub/build/library/mysql)
  :::

### Image New Tag <Site url="hub.docker.com" size="sm" />

<Route namespace="dockerhub" :data='{"path":"/tag/:owner/:image/:limits?","categories":["program-update"],"example":"/dockerhub/tag/library/mariadb","parameters":{"owner":"Image owner","image":"Image name","limits":"Tag count, 10 by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Image New Tag","maintainers":[],"description":":::warning\n  Use `library` as the `owner` for official images, such as [https://rsshub.app/dockerhub/tag/library/mysql](https://rsshub.app/dockerhub/tag/library/mysql)\n  :::","location":"tag.ts"}' />

:::warning
  Use `library` as the `owner` for official images, such as [https://rsshub.app/dockerhub/tag/library/mysql](https://rsshub.app/dockerhub/tag/library/mysql)
  :::

## Eagle <Site url="cn.eagle.cool"/>

### Changelog <Site url="cn.eagle.cool" size="sm" />

<Route namespace="eagle" :data='{"path":"/changelog/:language?","categories":["program-update"],"example":"/eagle/changelog/en","parameters":{"language":"Language, see list, default to be `cn`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Changelog","maintainers":["tigercubden"],"description":"Language\n\n  | Simplified Chinese | Traditional Chinese | English |\n  | ------------------ | ------------------- | ------- |\n  | cn                 | tw                  | en      |","location":"changelog.ts"}' />

Language

  | Simplified Chinese | Traditional Chinese | English |
  | ------------------ | ------------------- | ------- |
  | cn                 | tw                  | en      |

## F-Droid <Site url="f-droid.org"/>

### App Update <Site url="f-droid.org" size="sm" />

<Route namespace="f-droid" :data='{"path":"/apprelease/:app","categories":["program-update"],"example":"/f-droid/apprelease/com.termux","parameters":{"app":"App&#39;s package name"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["f-droid.org/en/packages/:app/"]}],"name":"App Update","maintainers":["garywill"],"location":"apprelease.ts"}' />

## FossHub <Site url="fosshub.com"/>

### Software Update <Site url="fosshub.com" size="sm" />

<Route namespace="fosshub" :data='{"path":"/:id","categories":["program-update"],"example":"/fosshub/qBittorrent","parameters":{"id":"Software id, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Software Update","maintainers":["nczitzk"],"location":"index.ts"}' />

## GoFans <Site url="gofans.cn"/>

### 最新限免 / 促销应用 <Site url="gofans.cn" size="sm" />

<Route namespace="gofans" :data='{"path":"/:kind?","categories":["program-update"],"example":"/gofans","parameters":{"kind":"Platform, either `macos` or `ios`, empty means both (default)"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"最新限免 / 促销应用","maintainers":["HenryQW"],"location":"index.ts"}' />

## Google <Site url="www.google.com"/>

### Extension Update <Site url="www.google.com" size="sm" />

<Route namespace="google" :data='{"path":"/chrome/extension/:id","categories":["program-update"],"example":"/google/chrome/extension/kefjpfngnndepjbopdmoebkipbgkggaa","parameters":{"id":"Extension id, can be found in extension url"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["chromewebstore.google.com/detail/:name/:id"]}],"name":"Extension Update","maintainers":["DIYgod"],"location":"extension.ts"}' />

## Greasy Fork <Site url="greasyfork.org"/>

### Script Feedback <Site url="greasyfork.org" size="sm" />

<Route namespace="greasyfork" :data='{"path":"/scripts/:script/feedback","categories":["program-update"],"example":"/greasyfork/scripts/431691-bypass-all-shortlinks/feedback","parameters":{"script":"Script id, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["greasyfork.org/:language/scripts/:script/feedback"]}],"name":"Script Feedback","maintainers":["miles170"],"location":"feedback.ts"}' />

### Script Update <Site url="greasyfork.org" size="sm" />

<Route namespace="greasyfork" :data='{"path":["/:language/:domain?","/scripts/sort/:sort/:language?"],"categories":["program-update"],"example":"/greasyfork/en/google.com","parameters":{"language":"language, located on the top right corner of Greasy Fork&#39;s search page, set to `all` for including all languages","domain":"the script&#39;s target domain"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["greasyfork.org/:language","greasyfork.org/:language/scripts/by-site/:domain?"]}],"name":"Script Update","maintainers":["imlonghao","miles170"],"description":"| Sort            | Description    |\n| --------------- | -------------- |\n| today           | Daily installs |\n| total_installs | Total installs |\n| ratings         | Ratings        |\n| created         | Created date   |\n| updated         | Updated date   |\n| name            | Name           |","location":"scripts.ts"}' />

| Sort            | Description    |
| --------------- | -------------- |
| today           | Daily installs |
| total_installs | Total installs |
| ratings         | Ratings        |
| created         | Created date   |
| updated         | Updated date   |
| name            | Name           |

### Script Update <Site url="greasyfork.org" size="sm" />

<Route namespace="greasyfork" :data='{"path":["/:language/:domain?","/scripts/sort/:sort/:language?"],"categories":["program-update"],"example":"/greasyfork/en/google.com","parameters":{"language":"language, located on the top right corner of Greasy Fork&#39;s search page, set to `all` for including all languages","domain":"the script&#39;s target domain"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["greasyfork.org/:language","greasyfork.org/:language/scripts/by-site/:domain?"]}],"name":"Script Update","maintainers":["imlonghao","miles170"],"description":"| Sort            | Description    |\n| --------------- | -------------- |\n| today           | Daily installs |\n| total_installs | Total installs |\n| ratings         | Ratings        |\n| created         | Created date   |\n| updated         | Updated date   |\n| name            | Name           |","location":"scripts.ts"}' />

| Sort            | Description    |
| --------------- | -------------- |
| today           | Daily installs |
| total_installs | Total installs |
| ratings         | Ratings        |
| created         | Created date   |
| updated         | Updated date   |
| name            | Name           |

### Script Version History <Site url="greasyfork.org" size="sm" />

<Route namespace="greasyfork" :data='{"path":"/scripts/:script/versions","categories":["program-update"],"example":"/greasyfork/scripts/431691-bypass-all-shortlinks/versions","parameters":{"script":"Script id, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["greasyfork.org/:language/scripts/:script/versions"]}],"name":"Script Version History","maintainers":["miles170"],"location":"versions.ts"}' />

## Infuse <Site url="firecore.com"/>

### Release Notes <Site url="firecore.com" size="sm" />

<Route namespace="firecore" :data='{"path":"/:os","categories":["program-update"],"example":"/firecore/ios","parameters":{"os":"`ios`,`tvos`,`macos`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Release Notes","maintainers":["NathanDai"],"location":"index.ts"}' />

## iFi audio <Site url="ifi-audio.com"/>

### Download Hub <Site url="ifi-audio.com" size="sm" />

<Route namespace="ifi-audio" :data='{"path":"/download/:val/:id","categories":["program-update"],"example":"/ifi-audio/download/1503007035/44472","parameters":{"val":"product val","id":"product id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Download Hub","maintainers":["EthanWng97"],"description":":::warning\n1.  Open [https://ifi-audio.com/download-hub](https://ifi-audio.com/download-hub) and the Network panel\n2.  Select the device and the corresponding serial number in the website and click Search\n3.  Find the last request named `https://ifi-audio.com/wp-admin/admin-ajax.php` in the Network panel, find out the val and id in the Payload panel, and fill in the url\n:::","location":"download.ts"}' />

:::warning
1.  Open [https://ifi-audio.com/download-hub](https://ifi-audio.com/download-hub) and the Network panel
2.  Select the device and the corresponding serial number in the website and click Search
3.  Find the last request named `https://ifi-audio.com/wp-admin/admin-ajax.php` in the Network panel, find out the val and id in the Payload panel, and fill in the url
:::

## ImageMagick <Site url="imagemagick.org"/>

### Changelog <Site url="imagemagick.org/script/download.php" size="sm" />

<Route namespace="imagemagick" :data='{"path":"/changelog","categories":["program-update"],"example":"/imagemagick/changelog","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["imagemagick.org/script/download.php","imagemagick.org/script","imagemagick.org/"]}],"name":"Changelog","maintainers":["nczitzk"],"url":"imagemagick.org/script/download.php","location":"changelog.ts"}' />

## IPSW.me <Site url="ipsw.me"/>

### Apple Firmware Update-IPSWs/OTAs version <Site url="ipsw.me" size="sm" />

<Route namespace="ipsw" :data='{"path":"/index/:ptype/:pname","categories":["program-update"],"example":"/ipsw/index/ipsws/iPad8,11","parameters":{"ptype":"Fill in ipsws or otas to get different versions of firmware","pname":"Product name, `http://rsshub.app/ipsw/index/ipsws/iPod`, if you fill in the iPad, follow the entire iPad series(ptype default to ipsws).`http://rsshub.app/ipsw/index/ipsws/iPhone11,8`, if you fill in the specific iPhone11,8, submit to the ipsws firmware information of this model"},"name":"Apple Firmware Update-IPSWs/OTAs version","maintainers":["Jeason0228"],"location":"index.ts"}' />

## Mozilla <Site url="monitor.firefox.com"/>

### Add-ons Update <Site url="monitor.firefox.com" size="sm" />

<Route namespace="firefox" :data='{"path":"/addons/:id","categories":["program-update"],"example":"/firefox/addons/rsshub-radar","parameters":{"id":"Add-ons id, can be found in add-ons url"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["addons.mozilla.org/:lang/firefox/addon/:id/versions","addons.mozilla.org/:lang/firefox/addon/:id"]}],"name":"Add-ons Update","maintainers":["DIYgod"],"location":"addons.ts"}' />

### Unknown <Site url="monitor.firefox.com" size="sm" />

<Route namespace="firefox" :data='{"path":"/release/:platform?","name":"Unknown","maintainers":[],"location":"release.ts"}' />

## MacUpdate <Site url="macupdate.com"/>

### Update <Site url="macupdate.com" size="sm" />

<Route namespace="macupdate" :data='{"path":"/app/:appId/:appSlug?","categories":["program-update"],"example":"/macupdate/app/11942","parameters":{"appId":"Application unique ID, can be found in URL","appSlug":"Application slug, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["macupdate.com/app/mac/:appId/:appSlug"]}],"name":"Update","maintainers":["TonyRL"],"location":"app.ts"}' />

## Microsoft Edge <Site url="microsoftedge.microsoft.com"/>

### Addons Update <Site url="microsoftedge.microsoft.com" size="sm" />

<Route namespace="microsoft" :data='{"path":"/edge/addon/:crxid","categories":["program-update"],"example":"/microsoft/edge/addon/gangkeiaobmjcjokiofpkfpcobpbmnln","parameters":{"crxid":"Addon id, can be found in addon url"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["microsoftedge.microsoft.com/addons/detail/:name/:crxid"]}],"name":"Addons Update","maintainers":["hoilc","DIYgod"],"location":"addon.ts"}' />

## MIUI <Site url="miui.com"/>

### New firmware <Site url="miui.com" size="sm" />

<Route namespace="miui" :data='{"path":"/:device/:type?/:region?","categories":["program-update"],"example":"/miui/aries","parameters":{"device":"the device `codename` eg. `aries` for Mi 2S","type":"type","region":"Region, default to `cn`"},"name":"New firmware","maintainers":["Indexyz"],"description":"  | stable  | development |\n    | ------- | ----------- |\n    | release | dev         |\n  \n    | region | region |\n    | ------ | ------ |\n    | China  | cn     |\n    | Global | global |","location":"index.ts"}' />

  | stable  | development |
    | ------- | ----------- |
    | release | dev         |
  
    | region | region |
    | ------ | ------ |
    | China  | cn     |
    | Global | global |

## Neat Download Manager <Site url="neatdownloadmanager.com"/>

### Download <Site url="neatdownloadmanager.com/index.php" size="sm" />

<Route namespace="neatdownloadmanager" :data='{"path":"/download/:os?","categories":["program-update"],"example":"/neatdownloadmanager/download","parameters":{"os":"Operating system, windows or macos, all by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["neatdownloadmanager.com/index.php","neatdownloadmanager.com/"]}],"name":"Download","maintainers":["nczitzk"],"url":"neatdownloadmanager.com/index.php","location":"download.ts"}' />

## Not a Tesla App <Site url="notateslaapp.com"/>

### Tesla Software Updates <Site url="notateslaapp.com/software-updates/history" size="sm" />

<Route namespace="notateslaapp" :data='{"path":"/ota","categories":["program-update"],"example":"/notateslaapp/ota","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["notateslaapp.com/software-updates/history","notateslaapp.com/software-updates","notateslaapp.com/"]}],"name":"Tesla Software Updates","maintainers":["mrbruce516"],"url":"notateslaapp.com/software-updates/history","location":"update.ts"}' />

## O&O Software <Site url="oo-software.com"/>

### Changelog <Site url="oo-software.com" size="sm" />

<Route namespace="oo-software" :data='{"path":"/changelog/:id","categories":["program-update"],"example":"/oo-software/changelog/shutup10","parameters":{"id":"Software id, see below, shutup10 by default, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Changelog","maintainers":["nczitzk"],"description":"| Software        | Id          |\n  | --------------- | ----------- |\n  | O&O ShutUp10++ | shutup10    |\n  | O&O AppBuster  | ooappbuster |\n  | O&O Lanytix    | oolanytix   |\n  | O&O DeskInfo   | oodeskinfo  |","location":"changelog.ts"}' />

| Software        | Id          |
  | --------------- | ----------- |
  | O&O ShutUp10++ | shutup10    |
  | O&O AppBuster  | ooappbuster |
  | O&O Lanytix    | oolanytix   |
  | O&O DeskInfo   | oodeskinfo  |

## Postman <Site url="postman.com"/>

### Release Notes <Site url="postman.com/downloads/release-notes" size="sm" />

<Route namespace="postman" :data='{"path":"/release-notes","categories":["program-update"],"example":"/postman/release-notes","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["postman.com/downloads/release-notes","postman.com/"]}],"name":"Release Notes","maintainers":["nczitzk"],"url":"postman.com/downloads/release-notes","location":"release-notes.ts"}' />

## PuTTY <Site url="www.chiark.greenend.org.uk"/>

### Change Log <Site url="www.chiark.greenend.org.uk/~sgtatham/putty/changes.html" size="sm" />

<Route namespace="putty" :data='{"path":"/changes","categories":["program-update"],"example":"/putty/changes","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.chiark.greenend.org.uk/~sgtatham/putty/changes.html","www.chiark.greenend.org.uk/"]}],"name":"Change Log","maintainers":["nczitzk"],"url":"www.chiark.greenend.org.uk/~sgtatham/putty/changes.html","location":"changes.ts"}' />

## qBittorrent <Site url="qbittorrent.org"/>

### News <Site url="qbittorrent.org/news.php" size="sm" />

<Route namespace="qbittorrent" :data='{"path":"/news","categories":["program-update"],"example":"/qbittorrent/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["qbittorrent.org/news.php","qbittorrent.org/"]}],"name":"News","maintainers":["TonyRL"],"url":"qbittorrent.org/news.php","location":"news.ts"}' />

## RemNote <Site url="remnote.com"/>

### Changelog <Site url="remnote.com/changelog" size="sm" />

<Route namespace="remnote" :data='{"path":"/changelog","categories":["program-update"],"example":"/remnote/changelog","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["remnote.com/changelog","remnote.com/"]}],"name":"Changelog","maintainers":["TonyRL","amakerlife"],"url":"remnote.com/changelog","location":"changelog.ts"}' />

## RSSHub <Site url="docs.rsshub.app"/>

### New routes <Site url="docs.rsshub.app/*" size="sm" />

<Route namespace="rsshub" :data='{"path":"/routes/:lang?","categories":["program-update"],"example":"/rsshub/routes/en","parameters":{"lang":"Language, `zh` means Chinese docs, other values or null means English docs, `en` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["docs.rsshub.app/*"],"target":"/routes"}],"name":"New routes","maintainers":["DIYgod"],"url":"docs.rsshub.app/*","location":"routes.ts"}' />

### Unknown <Site url="docs.rsshub.app" size="sm" />

<Route namespace="rsshub" :data='{"path":"/transform/sitemap/:url/:routeParams?","name":"Unknown","maintainers":["flrngel"],"location":"transform/sitemap.ts"}' />

## Sony <Site url="sony.com"/>

### Software Downloads <Site url="sony.com" size="sm" />

<Route namespace="sony" :data='{"path":"/downloads/:productType/:productId","categories":["program-update"],"example":"/sony/downloads/product/nw-wm1am2","parameters":{"productType":"product type","productId":"product id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["sony.com/electronics/support/:productType/:productId/downloads"]}],"name":"Software Downloads","maintainers":["EthanWng97"],"description":":::tip\n  Open `https://www.sony.com/electronics/support` and search for the corresponding product, such as `Sony A7M4`, the website corresponding to which is `https://www.sony.com/electronics/support/e-mount-body-ilce-7-series/ilce-7m4/downloads`, where `productType` is `e-mount-body-ilce-7-series` and `productId` is `ilce-7m4`.\n  :::","location":"downloads.ts"}' />

:::tip
  Open `https://www.sony.com/electronics/support` and search for the corresponding product, such as `Sony A7M4`, the website corresponding to which is `https://www.sony.com/electronics/support/e-mount-body-ilce-7-series/ilce-7m4/downloads`, where `productType` is `e-mount-body-ilce-7-series` and `productId` is `ilce-7m4`.
  :::

## SourceForge <Site url="www.sourceforge.net"/>

### Software <Site url="www.sourceforge.net" size="sm" />

<Route namespace="sourceforge" :data='{"path":"/:routeParams?","categories":["program-update"],"example":"/sourceforge/topic=artificial-intelligence&os=windows","parameters":{"routeParams":"route params, see below"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Software","maintainers":["JimenezLi"],"description":"For some URL like [https://sourceforge.net/directory/artificial-intelligence/windows/](https://sourceforge.net/directory/artificial-intelligence/windows/), it is equal to [https://sourceforge.net/directory/?topic=artificial-intelligence&os=windows\"](https://sourceforge.net/directory/?topic=artificial-intelligence&os=windows), thus subscribing to `/sourceforge/topic=artificial-intelligence&os=windows`.\n\n  URL params can duplicate, such as `/sourceforge/topic=artificial-intelligence&os=windows&os=linux`.","location":"index.ts"}' />

For some URL like [https://sourceforge.net/directory/artificial-intelligence/windows/](https://sourceforge.net/directory/artificial-intelligence/windows/), it is equal to [https://sourceforge.net/directory/?topic=artificial-intelligence&os=windows"](https://sourceforge.net/directory/?topic=artificial-intelligence&os=windows), thus subscribing to `/sourceforge/topic=artificial-intelligence&os=windows`.

  URL params can duplicate, such as `/sourceforge/topic=artificial-intelligence&os=windows&os=linux`.

## TradingView <Site url="tradingview.com"/>

### Desktop releases and release notes <Site url="tradingview.com/support/solutions/43000673888-tradingview-desktop-releases-and-release-notes/" size="sm" />

<Route namespace="tradingview" :data='{"path":"/desktop","categories":["program-update"],"example":"/tradingview/desktop","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["tradingview.com/support/solutions/43000673888-tradingview-desktop-releases-and-release-notes/"]}],"name":"Desktop releases and release notes","maintainers":["nczitzk"],"url":"tradingview.com/support/solutions/43000673888-tradingview-desktop-releases-and-release-notes/","location":"desktop.ts"}' />

### Unknown <Site url="tradingview.com" size="sm" />

<Route namespace="tradingview" :data='{"path":"/blog/:category{.+}?","name":"Unknown","maintainers":[],"location":"blog.ts"}' />

### Unknown <Site url="tradingview.com" size="sm" />

<Route namespace="tradingview" :data='{"path":"/pine/:version?","radar":[{"source":["tradingview.com/pine-script-docs/en/:version/Release_notes.html"],"target":"/pine/:version"}],"name":"Unknown","maintainers":[],"location":"pine.ts"}' />

## Typora <Site url="typora.io"/>

### Changelog <Site url="support.typora.io/" size="sm" />

<Route namespace="typora" :data='{"path":"/changelog","categories":["program-update"],"example":"/typora/changelog","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["support.typora.io/"]}],"name":"Changelog","maintainers":["cnzgray"],"url":"support.typora.io/","location":"changelog.ts"}' />

### Dev Release Changelog <Site url="support.typora.io/" size="sm" />

<Route namespace="typora" :data='{"path":"/changelog/dev","categories":["program-update"],"example":"/typora/changelog/dev","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["support.typora.io/"],"target":"/changelog"}],"name":"Dev Release Changelog","maintainers":["nczitzk"],"url":"support.typora.io/","location":"changelog-dev.ts"}' />

## Unraid <Site url="unraid.net"/>

### Community Apps <Site url="unraid.net/community/apps" size="sm" />

<Route namespace="unraid" :data='{"path":"/community-apps","categories":["program-update"],"example":"/unraid/community-apps","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["unraid.net/community/apps"]}],"name":"Community Apps","maintainers":["KTachibanaM"],"url":"unraid.net/community/apps","location":"community-apps.ts"}' />

## WizTree <Site url="diskanalyzer.com"/>

### What's New <Site url="diskanalyzer.com/whats-new" size="sm" />

<Route namespace="diskanalyzer" :data='{"path":"/whats-new","categories":["program-update"],"example":"/diskanalyzer/whats-new","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["diskanalyzer.com/whats-new","diskanalyzer.com/"]}],"name":"What&#39;s New","maintainers":["nczitzk"],"url":"diskanalyzer.com/whats-new","location":"whats-new.ts"}' />

## Western Digital <Site url="support.wdc.com"/>

### Download <Site url="support.wdc.com" size="sm" />

<Route namespace="wdc" :data='{"path":"/download/:id?","categories":["program-update"],"example":"/wdc/download/279","parameters":{"id":"Software id, can be found in URL, 279 as Western Digital Dashboard by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Download","maintainers":[],"location":"download.ts"}' />

## winstall <Site url="winstall.app"/>

### Apps Update <Site url="winstall.app" size="sm" />

<Route namespace="winstall" :data='{"path":"/:appId","categories":["program-update"],"example":"/winstall/Mozilla.Firefox","parameters":{"appId":"Application ID"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["winstall.app/apps/:appId"]}],"name":"Apps Update","maintainers":["TonyRL"],"location":"update.ts"}' />

## WziFile <Site url="antibody-software.com"/>

### Version History <Site url="antibody-software.com/wizfile/download" size="sm" />

<Route namespace="wizfile" :data='{"path":"/updates","categories":["program-update"],"example":"/wizfile/updates","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["antibody-software.com/wizfile/download"]}],"name":"Version History","maintainers":["Fatpandac"],"url":"antibody-software.com/wizfile/download","location":"index.ts"}' />

## Zotero <Site url="zotero.org"/>

### Version History <Site url="zotero.org/" size="sm" />

<Route namespace="zotero" :data='{"path":"/versions","categories":["program-update"],"example":"/zotero/versions","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["zotero.org/","zotero.org/support/changelog"]}],"name":"Version History","maintainers":["jasongzy"],"url":"zotero.org/","location":"versions.ts"}' />

## 王者荣耀 <Site url="mp.weixin.qq.com"/>

### 更新日志 <Site url="mp.weixin.qq.com" size="sm" />

<Route namespace="tencent" :data='{"path":"/qq/sdk/changelog/:platform","categories":["program-update"],"example":"/tencent/qq/sdk/changelog/iOS","parameters":{"platform":"平台，iOS / Android"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"更新日志","maintainers":["nuomi1"],"location":"qq/sdk/changelog.ts"}' />

## 小米 <Site url="mi.com"/>

### 小米应用商店金米奖 <Site url="mi.com" size="sm" />

<Route namespace="mi" :data='{"path":"/golden","categories":["program-update"],"example":"/mi/golden","name":"小米应用商店金米奖","maintainers":["nczitzk"],"location":"golden.ts"}' />

