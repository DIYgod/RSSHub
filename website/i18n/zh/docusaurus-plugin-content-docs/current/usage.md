# 开始食用

## 生成订阅源

比如我希望订阅 Twitter 上一个名为 DIYgod 的用户的时间线

根据 [Twitter 用户时间线路由](/zh/routes/social-media#twitter)的文档，路由为 `/twitter/user/:id`，把 `:id` 替换为用户名，得到路径为 `/twitter/user/DIYgod`，再加上域名 `https://rsshub.app`，一个订阅源就生成了：`https://rsshub.app/twitter/user/DIYgod`

然后我们可以把 `https://rsshub.app/twitter/user/DIYgod` 添加到任意 RSS 阅读器里来使用

其中域名 `https://rsshub.app` 可以替换为你[自部署](/zh/install)或任意[公共实例](/zh/instances)的域名

另外 RSSHub 支持很多实用的参数，比如内容过滤、全文输出等，可以在 [通用参数](/zh/parameter) 文档了解具体使用方法

## 编写订阅源

RSSHub 的发展离不开社区的力量，欢迎编写你感兴趣的订阅源[参与我们](/zh/joinus/quick-start)

## 作为 npm 包使用

除了作为订阅源，RSSHub 还支持作为 npm 包在你的 Node.js 项目中使用

### 安装

<Tabs groupId="package-manager">
<TabItem value="pnpm" label="pnpm" default>

```bash
pnpm add rsshub
```

</TabItem>
<TabItem value="yarn" label="yarnv1">

```bash
yarn add rsshub
```

</TabItem>
<TabItem value="npm" label="npm">

```bash
npm install rsshub --save
```

</TabItem>
</Tabs>

### 使用

```js
const RSSHub = require('rsshub');

RSSHub.init({
    // config
});

RSSHub.request('/bilibili/bangumi/media/9192')
    .then((data) => {
        console.log(data);
    })
    .catch((e) => {
        console.log(e);
    });
```

支持的 config 见 [配置](/zh/install/config) 文档，比如想禁用缓存，config 可以这样写：

```js
{
    CACHE_TYPE: null,
}
```

## Radar

除了生成 RSS 和获取数据两个功能之外，RSSHub 还提供了一个 Radar 功能，用于将网站地址映射到 RSSHub 地址

### 配置文件

Radar 有两种配置文件，一种是全功能的 [js 文件](https://github.com/DIYgod/RSSHub/blob/gh-pages/build/radar-rules.js)，一种是简化的 [json 文件](https://github.com/DIYgod/RSSHub/blob/gh-pages/build/radar-rules.json)

### 使用

你需要借助支持此功能的浏览器插件、手机应用、RSS 阅读器等工具来使用 Radar 功能，具体使用方法请参考对应工具的文档

- 浏览器插件: [RSSHub Radar](https://github.com/DIYgod/RSSHub-Radar)
- iOS 应用: [RSSBud](https://github.com/Cay-Zhang/RSSBud)
- Android 应用: [RSSAid](https://github.com/LeetaoGoooo/RSSAid)
- RSS 阅读器: Coming soon
