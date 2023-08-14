# 开始食用

## 生成订阅源

比如我希望订阅 Twitter 上一个名为 DIYgod 的用户的时间线

根据 [Twitter 用户时间线路由](/social-media.html#twitter)的文档，路由为 `/twitter/user/:id`，把 `:id` 替换为用户名，得到路径为 `/twitter/user/DIYgod`，再加上域名 `https://rsshub.app`，一个订阅源就生成了：<https://rsshub.app/twitter/user/DIYgod>

然后我们可以把 <https://rsshub.app/twitter/user/DIYgod> 添加到任意 RSS 阅读器里来使用

其中域名 `https://rsshub.app` 可以替换为你[自部署](/install/)的域名

另外 RSSHub 支持很多实用的参数，比如内容过滤、全文输出等，可以在 [通用参数](/parameter.html) 文档了解具体使用方法

## 编写订阅源

RSSHub 的发展离不开社区的力量，欢迎编写你感兴趣的订阅源[参与我们](/joinus/quick-start.html)

## 作为 npm 包使用

除了作为订阅源，RSSHub 还支持作为 npm 包在你的 Node.js 项目中使用

### 安装

<code-group>
<code-block title="pnpm" active>

```bash
pnpm add rsshub
```

</code-block>
<code-block title="yarnv1">

```bash
yarn add rsshub
```

</code-block>
<code-block title="npm">

```bash
npm install rsshub --save
```

</code-block>
</code-group>

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

支持的 config 见 [配置](/install/#配置) 文档，比如想禁用缓存，config 可以这样写：

```js
{
    CACHE_TYPE: null,
}
```
