# 🎨️ Design

## 1x.com <Site url="1x.com"/>

1x.com • In Pursuit of the Sublime. Browse 200,000 curated photos from photographers all over the world.

### Gallery <Site url="1x.com" size="sm" />

<Route namespace="1x" :data='{"path":"/:category{.+}?","name":"Gallery","url":"1x.com","maintainers":["nczitzk"],"example":"/1x/latest/awarded","parameters":{"category":"Category, Latest Awarded by default"},"description":"::: tip\nFill in the field in the path with the part of the corresponding page URL after `https://1x.com/gallery/` or `https://1x.com/photo/`. Here are the examples:\n\nIf you subscribe to [Abstract Awarded](https://1x.com/gallery/abstract/awarded), you should fill in the path with the part `abstract/awarded` from the page URL `https://1x.com/gallery/abstract/awarded`. In this case, the route will be [`/1x/abstract/awarded`](https://rsshub.app/1x/abstract/awarded).\n    \nIf you subscribe to [Wildlife Published](https://1x.com/gallery/wildlife/published), you should fill in the path with the part `wildlife/published` from the page URL `https://1x.com/gallery/wildlife/published`. In this case, the route will be [`/1x/wildlife/published`](https://rsshub.app/1x/wildlife/published).\n:::","categories":["design","picture"],"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportRadar":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["/gallery/:category*","/photos/:category*"],"target":"/1x/:category"}],"location":"index.ts"}' :test='undefined' />

::: tip
Fill in the field in the path with the part of the corresponding page URL after `https://1x.com/gallery/` or `https://1x.com/photo/`. Here are the examples:

If you subscribe to [Abstract Awarded](https://1x.com/gallery/abstract/awarded), you should fill in the path with the part `abstract/awarded` from the page URL `https://1x.com/gallery/abstract/awarded`. In this case, the route will be [`/1x/abstract/awarded`](https://rsshub.app/1x/abstract/awarded).
    
If you subscribe to [Wildlife Published](https://1x.com/gallery/wildlife/published), you should fill in the path with the part `wildlife/published` from the page URL `https://1x.com/gallery/wildlife/published`. In this case, the route will be [`/1x/wildlife/published`](https://rsshub.app/1x/wildlife/published).
:::

## Behance <Site url="www.behance.net"/>

### User Works <Site url="www.behance.net" size="sm" />

<Route namespace="behance" :data='{"path":"/:user/:type?","categories":["design"],"example":"/behance/mishapetrick","parameters":{"user":"username","type":"type, `projects` or `appreciated`, `projects` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"User Works","maintainers":["MisteryMonster"],"description":"Behance user&#39;s profile URL, like [https://www.behance.net/mishapetrick](https://www.behance.net/mishapetrick) the username will be `mishapetrick`。","location":"user.ts"}' :test='{"code":0}' />

Behance user's profile URL, like [https://www.behance.net/mishapetrick](https://www.behance.net/mishapetrick) the username will be `mishapetrick`。

## Boss 设计 <Site url="bossdesign.cn"/>

### 分类 <Site url="bossdesign.cn" size="sm" />

<Route namespace="bossdesign" :data='{"path":"/:category?","categories":["design"],"example":"/bossdesign","parameters":{"category":"分类，可在对应分类页 URL 中找到，留空为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"分类","maintainers":["TonyRL"],"description":"| Boss 笔记 | 电脑日志        | 素材资源         | 设计师神器      | 设计教程        | 设计资讯            |\n  | --------- | --------------- | ---------------- | --------------- | --------------- | ------------------- |\n  | note      | computer-skills | design-resources | design-software | design-tutorial | design_information |","location":"index.ts"}' :test='{"code":0}' />

| Boss 笔记 | 电脑日志        | 素材资源         | 设计师神器      | 设计教程        | 设计资讯            |
  | --------- | --------------- | ---------------- | --------------- | --------------- | ------------------- |
  | note      | computer-skills | design-resources | design-software | design-tutorial | design_information |

## Dribbble <Site url="dribbble.com"/>

### Keyword <Site url="dribbble.com" size="sm" />

<Route namespace="dribbble" :data='{"path":"/keyword/:keyword","categories":["design"],"example":"/dribbble/keyword/player","parameters":{"keyword":"desired keyword"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Keyword","maintainers":["DIYgod","loganrockmore"],"location":"keyword.ts"}' :test='{"code":0}' />

### Popular <Site url="dribbble.com/" size="sm" />

<Route namespace="dribbble" :data='{"path":"/popular/:timeframe?","categories":["design"],"example":"/dribbble/popular","parameters":{"timeframe":"support the following values: week, month, year and ever"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["dribbble.com/"],"target":"/popular"}],"name":"Popular","maintainers":["DIYgod","loganrockmore"],"url":"dribbble.com/","location":"popular.ts"}' :test='{"code":0}' />

### User (or team) <Site url="dribbble.com" size="sm" />

<Route namespace="dribbble" :data='{"path":"/user/:name","categories":["design"],"example":"/dribbble/user/google","parameters":{"name":"username, available in user&#39;s homepage URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["dribbble.com/:name"]}],"name":"User (or team)","maintainers":["DIYgod","loganrockmore"],"location":"user.ts"}' :test='{"code":0}' />

## Eagle <Site url="cn.eagle.cool"/>

### Blog <Site url="cn.eagle.cool/blog" size="sm" />

<Route namespace="eagle" :data='{"path":"/blog/:cate?/:language?","categories":["design"],"example":"/eagle/blog/en","parameters":{"cate":"Category, get by URL, `all` by default","language":"Language, `cn`, `tw`, `en`, `en` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["cn.eagle.cool/blog"],"target":"/blog"}],"name":"Blog","maintainers":["Fatpandac"],"url":"cn.eagle.cool/blog","location":"blog.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

## Google <Site url="www.google.com"/>

### Google Fonts <Site url="www.google.com" size="sm" />

<Route namespace="google" :data='{"path":"/fonts/:sort?","categories":["design"],"example":"/google/fonts/date","parameters":{"sort":"Sorting type, see below, default to `date`"},"features":{"requireConfig":[{"name":"GOOGLE_FONTS_API_KEY","description":""}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Google Fonts","maintainers":["Fatpandac"],"description":"| Newest | Trending | Most popular |  Name | Number of styles |\n  | :----: | :------: | :----------: | :---: | :--------------: |\n  |  date  | trending |  popularity  | alpha |       style      |\n\n  :::warning\n  This route requires API key, therefore it&#39;s only available when self-hosting, refer to the [Deploy Guide](https://docs.rsshub.app/install/#configuration-route-specific-configurations) for route-specific configurations.\n  :::","location":"fonts.ts"}' :test='undefined' />

| Newest | Trending | Most popular |  Name | Number of styles |
  | :----: | :------: | :----------: | :---: | :--------------: |
  |  date  | trending |  popularity  | alpha |       style      |

  :::warning
  This route requires API key, therefore it's only available when self-hosting, refer to the [Deploy Guide](https://docs.rsshub.app/install/#configuration-route-specific-configurations) for route-specific configurations.
  :::

## Notefolio <Site url="notefolio.net"/>

### Works <Site url="notefolio.net/search" size="sm" />

<Route namespace="notefolio" :data='{"path":"/search/:category?/:order?/:time?/:query?","categories":["design"],"example":"/notefolio/search/1/pick/all/life","parameters":{"category":"Category, see below, `all` by default","order":"Order, `pick` as Notefolio Pick, `published` as Newest, `like` as like, `pick` by default","time":"Time, `all` as All the time, `one-day` as Latest 24 hours, `week` as Latest week, `month` as Latest month, `three-month` as Latest 3 months, `all` by default","query":"Keyword, empty by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["notefolio.net/search"]}],"name":"Works","maintainers":["BianTan"],"url":"notefolio.net/search","description":"| Category | Name in Korean     | Name in English         |\n  | -------- | ------------------ | ----------------------- |\n  | all      | 전체               | All                     |\n  | 1        | 영상/모션그래픽    | Video / Motion Graphics |\n  | 2        | 그래픽 디자인      | Graphic Design          |\n  | 3        | 브랜딩/편집        | Branding / Editing      |\n  | 4        | UI/UX              | UI/UX                   |\n  | 5        | 일러스트레이션     | Illustration            |\n  | 6        | 디지털 아트        | Digital Art             |\n  | 7        | 캐릭터 디자인      | Character Design        |\n  | 8        | 제품/패키지 디자인 | Product Package Design  |\n  | 9        | 포토그래피         | Photography             |\n  | 10       | 타이포그래피       | Typography              |\n  | 11       | 공예               | Crafts                  |\n  | 12       | 파인아트           | Fine Art                |","location":"search.ts"}' :test='{"code":0}' />

| Category | Name in Korean     | Name in English         |
  | -------- | ------------------ | ----------------------- |
  | all      | 전체               | All                     |
  | 1        | 영상/모션그래픽    | Video / Motion Graphics |
  | 2        | 그래픽 디자인      | Graphic Design          |
  | 3        | 브랜딩/편집        | Branding / Editing      |
  | 4        | UI/UX              | UI/UX                   |
  | 5        | 일러스트레이션     | Illustration            |
  | 6        | 디지털 아트        | Digital Art             |
  | 7        | 캐릭터 디자인      | Character Design        |
  | 8        | 제품/패키지 디자인 | Product Package Design  |
  | 9        | 포토그래피         | Photography             |
  | 10       | 타이포그래피       | Typography              |
  | 11       | 공예               | Crafts                  |
  | 12       | 파인아트           | Fine Art                |

## Shopping Design <Site url="www.shoppingdesign.com.tw"/>

### 文章列表 <Site url="www.shoppingdesign.com.tw/post" size="sm" />

<Route namespace="shoppingdesign" :data='{"path":"/posts","categories":["design"],"example":"/shoppingdesign/posts","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.shoppingdesign.com.tw/post"]}],"name":"文章列表","maintainers":["miles170"],"url":"www.shoppingdesign.com.tw/post","location":"posts.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

## 爱果果 <Site url="iguoguo.net"/>

### 最新 H5 <Site url="iguoguo.net" size="sm" />

<Route namespace="iguoguo" :data='{"path":"/html5","categories":["design"],"example":"/iguoguo/html5","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"最新 H5","maintainers":["yuxinliu-alex"],"location":"index.ts"}' :test='{"code":0}' />

## 站酷 <Site url="www.zcool.com.cn"/>

### 发现 <Site url="www.zcool.com.cn" size="sm" />

<Route namespace="zcool" :data='{"path":"/discover/:query?/:subCate?/:hasVideo?/:city?/:college?/:recommendLevel?/:sort?","categories":["design"],"example":"/zcool/discover","parameters":{"query":"查询参数或分类，若填写分类见下表，默认为空 或 `0` 即精选","subCate":"子分类，见下表，默认为 `0` 即该父分类下全部","hasVideo":"是否含视频，默认为 `0` 即全部，亦可选 `1` 即含视频","city":"地区代码，填入发现页中 `选择城市` 中的各级地名，如 `亚洲`、`中国`、`北京`、`纽约`、`巴黎`等","college":"学校，默认为 `0` 即全部","recommendLevel":"推荐等级，见下表，默认为 `2` 即编辑精选","sort":"排序方式，可选 `0` 即最新发布 或 `9` 即默认排序，默认为 `9`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"发现","maintainers":["nczitzk"],"description":"查看 **精选** 分类下的全部内容，其他参数选择默认，可直接使用路由 [`/zcool/discover/0`](https://rsshub.app/zcool/discover/0)\n\n  查看 **精选** 分类下的 **运营设计** 子分类全部内容，其他参数选择默认，可直接使用路由 [`/zcool/discover/0/617`](https://rsshub.app/zcool/discover/0/617)\n\n  在 **精选** 分类下的 **运营设计** 子分类全部内容基础上，筛选出有 **视频**，可直接使用路由 [`/zcool/discover/0/617/1`](https://rsshub.app/zcool/discover/0/617/1)\n\n  在 **精选** 分类下的 **运营设计** 子分类全部内容基础上，筛选出有 **视频**，且城市选择 **北京**，可直接使用路由 [`/zcool/discover/0/617/1/北京`](https://rsshub.app/zcool/discover/0/617/1/北京)\n\n  :::tip\n  下方仅提供 **分类及其子分类** 参数的代码。**学校** 参数的代码可以在 [站酷发现页](https://www.zcool.com.cn/discover) 中选择跳转后，从浏览器地址栏中找到。\n  :::\n\n  分类 cate\n\n  | 精选 | 平面 | 插画 | UI | 网页 | 摄影 | 三维 | 影视 | 空间 | 工业 / 产品 | 动漫 | 纯艺术 | 手工艺 | 服装 | 其他 |\n  | ---- | ---- | ---- | -- | ---- | ---- | ---- | ---- | ---- | ----------- | ---- | ------ | ------ | ---- | ---- |\n  | 0    | 8    | 1    | 17 | 607  | 33   | 24   | 610  | 609  | 499         | 608  | 612    | 611    | 613  | 44   |\n\n  子分类 subCate\n\n  精选 0\n\n  | 运营设计 | 包装 | 动画 / 影视 | 人像摄影 | 商业插画 | 电商 | APP 界面 | 艺术插画 | 家装设计 | 海报 | 文章   |\n  | -------- | ---- | ----------- | -------- | -------- | ---- | -------- | -------- | -------- | ---- | ------ |\n  | 617      | 9    | 30          | 34       | 2        | 616  | 757      | 292      | 637      | 10   | 809824 |\n\n  平面 8\n\n  | 包装 | 海报 | 品牌 | IP 形象 | 字体 / 字形 | Logo | 书籍 / 画册 | 宣传物料 | 图案 | 信息图表 | PPT/Keynote | 其他平面 | 文章 |\n  | ---- | ---- | ---- | ------- | ----------- | ---- | ----------- | -------- | ---- | -------- | ----------- | -------- | ---- |\n  | 9    | 10   | 15   | 779     | 14          | 13   | 12          | 534      | 624  | 625      | 626         | 11       | 809  |\n\n  插画 1\n\n  | 商业插画 | 概念设定 | 游戏原画 | 绘本 | 儿童插画 | 艺术插画 | 创作习作 | 新锐潮流插画 | 像素画 | 文章 |\n  | -------- | -------- | -------- | ---- | -------- | -------- | -------- | ------------ | ------ | ---- |\n  | 2        | 5        | 685      | 631  | 684      | 292      | 7        | 3            | 4      | 819  |\n\n  UI 17\n\n  | APP 界面 | 游戏 UI | 软件界面 | 图标 | 主题 / 皮肤 | 交互 / UE | 动效设计 | 闪屏 / 壁纸 | 其他 UI | 文章 |\n  | -------- | ------- | -------- | ---- | ----------- | --------- | -------- | ----------- | ------- | ---- |\n  | 757      | 692     | 621      | 20   | 19          | 623       | 797      | 21          | 23      | 822  |\n\n  网页 607\n\n  | 电商 | 企业官网 | 游戏 / 娱乐 | 运营设计 | 移动端网页 | 门户网站 | 个人网站 | 其他网页 | 文章 |\n  | ---- | -------- | ----------- | -------- | ---------- | -------- | -------- | -------- | ---- |\n  | 616  | 614      | 693         | 617      | 777        | 615      | 618      | 620      | 823  |\n\n  摄影 33\n\n  | 人像摄影 | 风光摄影 | 人文 / 纪实摄影 | 美食摄影 | 产品摄影 | 环境 / 建筑摄影 | 时尚 / 艺术摄影 | 修图 / 后期 | 宠物摄影 | 婚礼摄影 | 其他摄影 | 文章 |\n  | -------- | -------- | --------------- | -------- | -------- | --------------- | --------------- | ----------- | -------- | -------- | -------- | ---- |\n  | 34       | 35       | 36              | 825      | 686      | 38              | 800             | 687         | 40       | 808      | 43       | 810  |\n\n  三维 24\n\n  | 动画 / 影视 | 机械 / 交通 | 人物 / 生物 | 产品 | 场景 | 建筑 / 空间 | 其他三维 | 文章 |\n  | ----------- | ----------- | ----------- | ---- | ---- | ----------- | -------- | ---- |\n  | 30          | 25          | 27          | 807  | 26   | 29          | 32       | 818  |\n\n  影视 610\n\n  | 短片 | Motion Graphic | 宣传片 | 影视后期 | 栏目片头 | MV  | 设定 / 分镜 | 其他影视 | 文章 |\n  | ---- | -------------- | ------ | -------- | -------- | --- | ----------- | -------- | ---- |\n  | 645  | 649            | 804    | 646      | 647      | 644 | 650         | 651      | 817  |\n\n  空间 609\n\n  | 家装设计 | 酒店餐饮设计 | 商业空间设计 | 建筑设计 | 舞台美术 | 展陈设计 | 景观设计 | 其他空间 | 文章 |\n  | -------- | ------------ | ------------ | -------- | -------- | -------- | -------- | -------- | ---- |\n  | 637      | 811          | 641          | 636      | 638      | 639      | 640      | 642      | 812  |\n\n  工业 / 产品 499\n\n  | 生活用品 | 电子产品 | 交通工具 | 工业用品 / 机械 | 人机交互 | 玩具 | 其他工业 / 产品 | 文章 |\n  | -------- | -------- | -------- | --------------- | -------- | ---- | --------------- | ---- |\n  | 508      | 506      | 509      | 511             | 510      | 689  | 514             | 813  |\n\n  动漫 608\n\n  | 短篇 / 格漫 | 中 / 长篇漫画 | 网络表情 | 单幅漫画 | 动画片 | 其他动漫 | 文章 |\n  | ----------- | ------------- | -------- | -------- | ------ | -------- | ---- |\n  | 628         | 629           | 632      | 627      | 633    | 635      | 820  |\n\n  纯艺术 612\n\n  | 绘画 | 雕塑 | 书法 | 实验艺术 | 文章 |\n  | ---- | ---- | ---- | -------- | ---- |\n  | 659  | 662  | 668  | 657      | 821  |\n\n  手工艺 611\n\n  | 工艺品设计 | 手办 / 模玩 | 首饰设计 | 其他手工艺 | 文章 |\n  | ---------- | ----------- | -------- | ---------- | ---- |\n  | 654        | 656         | 756      | 658        | 816  |\n\n  服装 613\n\n  | 休闲 / 流行服饰 | 正装 / 礼服 | 传统 / 民族服饰 | 配饰 | 鞋履设计 | 儿童服饰 | 其他服装 | 文章 |\n  | --------------- | ----------- | --------------- | ---- | -------- | -------- | -------- | ---- |\n  | 672             | 671         | 814             | 677  | 676      | 673      | 680      | 815  |\n\n  其他 44\n\n  | 文案 / 策划 | VR 设计 | 独立游戏 | 其他 | 文章 |\n  | ----------- | ------- | -------- | ---- | ---- |\n  | 417         | 798     | 683      | 45   | 824  |\n\n  推荐等级 recommendLevel\n\n  | 全部 | 编辑精选 | 首页推荐 | 全部推荐 |\n  | ---- | -------- | -------- | -------- |\n  | 0    | 2        | 3        | 1        |","location":"discover.ts"}' :test='{"code":0}' />

查看 **精选** 分类下的全部内容，其他参数选择默认，可直接使用路由 [`/zcool/discover/0`](https://rsshub.app/zcool/discover/0)

  查看 **精选** 分类下的 **运营设计** 子分类全部内容，其他参数选择默认，可直接使用路由 [`/zcool/discover/0/617`](https://rsshub.app/zcool/discover/0/617)

  在 **精选** 分类下的 **运营设计** 子分类全部内容基础上，筛选出有 **视频**，可直接使用路由 [`/zcool/discover/0/617/1`](https://rsshub.app/zcool/discover/0/617/1)

  在 **精选** 分类下的 **运营设计** 子分类全部内容基础上，筛选出有 **视频**，且城市选择 **北京**，可直接使用路由 [`/zcool/discover/0/617/1/北京`](https://rsshub.app/zcool/discover/0/617/1/北京)

  :::tip
  下方仅提供 **分类及其子分类** 参数的代码。**学校** 参数的代码可以在 [站酷发现页](https://www.zcool.com.cn/discover) 中选择跳转后，从浏览器地址栏中找到。
  :::

  分类 cate

  | 精选 | 平面 | 插画 | UI | 网页 | 摄影 | 三维 | 影视 | 空间 | 工业 / 产品 | 动漫 | 纯艺术 | 手工艺 | 服装 | 其他 |
  | ---- | ---- | ---- | -- | ---- | ---- | ---- | ---- | ---- | ----------- | ---- | ------ | ------ | ---- | ---- |
  | 0    | 8    | 1    | 17 | 607  | 33   | 24   | 610  | 609  | 499         | 608  | 612    | 611    | 613  | 44   |

  子分类 subCate

  精选 0

  | 运营设计 | 包装 | 动画 / 影视 | 人像摄影 | 商业插画 | 电商 | APP 界面 | 艺术插画 | 家装设计 | 海报 | 文章   |
  | -------- | ---- | ----------- | -------- | -------- | ---- | -------- | -------- | -------- | ---- | ------ |
  | 617      | 9    | 30          | 34       | 2        | 616  | 757      | 292      | 637      | 10   | 809824 |

  平面 8

  | 包装 | 海报 | 品牌 | IP 形象 | 字体 / 字形 | Logo | 书籍 / 画册 | 宣传物料 | 图案 | 信息图表 | PPT/Keynote | 其他平面 | 文章 |
  | ---- | ---- | ---- | ------- | ----------- | ---- | ----------- | -------- | ---- | -------- | ----------- | -------- | ---- |
  | 9    | 10   | 15   | 779     | 14          | 13   | 12          | 534      | 624  | 625      | 626         | 11       | 809  |

  插画 1

  | 商业插画 | 概念设定 | 游戏原画 | 绘本 | 儿童插画 | 艺术插画 | 创作习作 | 新锐潮流插画 | 像素画 | 文章 |
  | -------- | -------- | -------- | ---- | -------- | -------- | -------- | ------------ | ------ | ---- |
  | 2        | 5        | 685      | 631  | 684      | 292      | 7        | 3            | 4      | 819  |

  UI 17

  | APP 界面 | 游戏 UI | 软件界面 | 图标 | 主题 / 皮肤 | 交互 / UE | 动效设计 | 闪屏 / 壁纸 | 其他 UI | 文章 |
  | -------- | ------- | -------- | ---- | ----------- | --------- | -------- | ----------- | ------- | ---- |
  | 757      | 692     | 621      | 20   | 19          | 623       | 797      | 21          | 23      | 822  |

  网页 607

  | 电商 | 企业官网 | 游戏 / 娱乐 | 运营设计 | 移动端网页 | 门户网站 | 个人网站 | 其他网页 | 文章 |
  | ---- | -------- | ----------- | -------- | ---------- | -------- | -------- | -------- | ---- |
  | 616  | 614      | 693         | 617      | 777        | 615      | 618      | 620      | 823  |

  摄影 33

  | 人像摄影 | 风光摄影 | 人文 / 纪实摄影 | 美食摄影 | 产品摄影 | 环境 / 建筑摄影 | 时尚 / 艺术摄影 | 修图 / 后期 | 宠物摄影 | 婚礼摄影 | 其他摄影 | 文章 |
  | -------- | -------- | --------------- | -------- | -------- | --------------- | --------------- | ----------- | -------- | -------- | -------- | ---- |
  | 34       | 35       | 36              | 825      | 686      | 38              | 800             | 687         | 40       | 808      | 43       | 810  |

  三维 24

  | 动画 / 影视 | 机械 / 交通 | 人物 / 生物 | 产品 | 场景 | 建筑 / 空间 | 其他三维 | 文章 |
  | ----------- | ----------- | ----------- | ---- | ---- | ----------- | -------- | ---- |
  | 30          | 25          | 27          | 807  | 26   | 29          | 32       | 818  |

  影视 610

  | 短片 | Motion Graphic | 宣传片 | 影视后期 | 栏目片头 | MV  | 设定 / 分镜 | 其他影视 | 文章 |
  | ---- | -------------- | ------ | -------- | -------- | --- | ----------- | -------- | ---- |
  | 645  | 649            | 804    | 646      | 647      | 644 | 650         | 651      | 817  |

  空间 609

  | 家装设计 | 酒店餐饮设计 | 商业空间设计 | 建筑设计 | 舞台美术 | 展陈设计 | 景观设计 | 其他空间 | 文章 |
  | -------- | ------------ | ------------ | -------- | -------- | -------- | -------- | -------- | ---- |
  | 637      | 811          | 641          | 636      | 638      | 639      | 640      | 642      | 812  |

  工业 / 产品 499

  | 生活用品 | 电子产品 | 交通工具 | 工业用品 / 机械 | 人机交互 | 玩具 | 其他工业 / 产品 | 文章 |
  | -------- | -------- | -------- | --------------- | -------- | ---- | --------------- | ---- |
  | 508      | 506      | 509      | 511             | 510      | 689  | 514             | 813  |

  动漫 608

  | 短篇 / 格漫 | 中 / 长篇漫画 | 网络表情 | 单幅漫画 | 动画片 | 其他动漫 | 文章 |
  | ----------- | ------------- | -------- | -------- | ------ | -------- | ---- |
  | 628         | 629           | 632      | 627      | 633    | 635      | 820  |

  纯艺术 612

  | 绘画 | 雕塑 | 书法 | 实验艺术 | 文章 |
  | ---- | ---- | ---- | -------- | ---- |
  | 659  | 662  | 668  | 657      | 821  |

  手工艺 611

  | 工艺品设计 | 手办 / 模玩 | 首饰设计 | 其他手工艺 | 文章 |
  | ---------- | ----------- | -------- | ---------- | ---- |
  | 654        | 656         | 756      | 658        | 816  |

  服装 613

  | 休闲 / 流行服饰 | 正装 / 礼服 | 传统 / 民族服饰 | 配饰 | 鞋履设计 | 儿童服饰 | 其他服装 | 文章 |
  | --------------- | ----------- | --------------- | ---- | -------- | -------- | -------- | ---- |
  | 672             | 671         | 814             | 677  | 676      | 673      | 680      | 815  |

  其他 44

  | 文案 / 策划 | VR 设计 | 独立游戏 | 其他 | 文章 |
  | ----------- | ------- | -------- | ---- | ---- |
  | 417         | 798     | 683      | 45   | 824  |

  推荐等级 recommendLevel

  | 全部 | 编辑精选 | 首页推荐 | 全部推荐 |
  | ---- | -------- | -------- | -------- |
  | 0    | 2        | 3        | 1        |

### 用户作品 <Site url="www.zcool.com.cn" size="sm" />

<Route namespace="zcool" :data='{"path":"/user/:uid","categories":["design"],"example":"/zcool/user/baiyong","parameters":{"uid":"个性域名前缀或者用户ID"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.zcool.com.cn/u/:id"],"target":"/user/:id"}],"name":"用户作品","description":"  例如:\n\n    站酷的个人主页 `https://baiyong.zcool.com.cn` 对应 rss 路径 `/zcool/user/baiyong`\n\n    站酷的个人主页 `https://www.zcool.com.cn/u/568339` 对应 rss 路径 `/zcool/user/568339`","maintainers":["junbaor"],"location":"user.ts"}' :test='{"code":0}' />

  例如:

    站酷的个人主页 `https://baiyong.zcool.com.cn` 对应 rss 路径 `/zcool/user/baiyong`

    站酷的个人主页 `https://www.zcool.com.cn/u/568339` 对应 rss 路径 `/zcool/user/568339`

### 作品总榜单 <Site url="www.zcool.com.cn" size="sm" />

<Route namespace="zcool" :data='{"path":"/top/:type","categories":["design"],"example":"/zcool/top/design","parameters":{"type":"推荐类型,详见下面的表格"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"作品总榜单","maintainers":["yuuow"],"description":"榜单类型\n\n  | design   | article  |\n  | -------- | -------- |\n  | 作品榜单 | 文章榜单 |","location":"top.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

榜单类型

  | design   | article  |
  | -------- | -------- |
  | 作品榜单 | 文章榜单 |

