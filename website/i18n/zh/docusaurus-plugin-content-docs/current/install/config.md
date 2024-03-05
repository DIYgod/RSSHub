# 配置

通过设置环境变量来配置 RSSHub

## 网络配置

`PORT`: 监听端口，默认为 `1200`

`SOCKET`: 监听 Unix Socket，默认 `null`

`LISTEN_INADDR_ANY`: 是否允许公网连接，默认 `1`

`REQUEST_RETRY`: 请求失败重试次数，默认 `2`

`REQUEST_TIMEOUT`: 请求超时毫秒数，默认 `3000`

`UA`: 用户代理，默认为随机用户代理用户代理（macOS 上的 Chrome）

`NO_RANDOM_UA`: 是否禁用随机用户代理，默认 `null`

## 跨域请求

RSSHub 默认对跨域请求限制为当前连接所在的域名，即不允许跨域。可以通过 `ALLOW_ORIGIN: *` 或者 `ALLOW_ORIGIN: www.example.com` 以对跨域访问进行修改。

## 缓存配置

RSSHub 支持 `memory` 和 `redis` 两种缓存方式

`CACHE_TYPE`: 缓存类型，可为 `memory` 和 `redis`，设为空可以禁止缓存，默认为 `memory`

`CACHE_EXPIRE`: 路由缓存过期时间，单位为秒，默认 `5 * 60`

`CACHE_CONTENT_EXPIRE`: 内容缓存过期时间，每次访问会重新计算过期时间，单位为秒，默认 `1 * 60 * 60`

`REDIS_URL`: Redis 连接地址（redis 缓存类型时有效），默认为 `redis://localhost:6379/`

`MEMORY_MAX`: 最大缓存数量（memory 缓存类型时有效），默认 `256`

## 代理配置

部分路由反爬严格，可以配置使用代理抓取。

可通过**代理 URI** 或**代理选项**或**代理自动配置文件 (PAC)** 或**反向代理**等方式来配置代理。

### 代理 URI

`PROXY_URI`: 代理 URI，支持 socks4, socks5（本地查询域名的 SOCKS5，不推荐使用）, socks5h（传域名的 SOCKS5，推荐使用，以防止 DNS 污染或 DNS 泄露）, http, https，具体以 [socks-proxy-agent](https://www.npmjs.com/package/socks-proxy-agent) NPM 包的支持为准，也可参考 [curl 中 SOCKS 代理协议的用法](https://daniel.haxx.se/blog/2020/05/26/curl-ootw-socks5/)。

> 代理 URI 的格式为：
>
> -   `{protocol}://{host}:{port}`
> -   `{protocol}://{username}:{password}@{host}:{port}` （带身份凭证）
>
> 一些示例：
>
> -   `socks4://127.0.0.1:1080`
> -   `socks5h://user:pass@127.0.0.1:1080` （用户名为 `user`, 密码为 `pass`）
> -   `socks://127.0.0.1:1080` （protocol 为 socks 时表示 `socks5h`）
> -   `http://127.0.0.1:8080`
> -   `http://user:pass@127.0.0.1:8080`
> -   `https://127.0.0.1:8443`

### 代理选项

`PROXY_PROTOCOL`: 使用代理，支持 socks，http，https

`PROXY_HOST`: 代理服务器域名或 IP

`PROXY_PORT`: 代理服务器端口

`PROXY_AUTH`: 给代理服务器的身份验证凭证，`Proxy-Authorization: Basic ${process.env.PROXY_AUTH}`

`PROXY_URL_REGEX`: 启用代理的 URL 正则表达式，默认全部开启 `.*`

### 代理自动配置文件 (PAC)

:::warning

该方法会覆盖 `PROXY_URI`, `PROXY_PROTOCOL`, `PROXY_HOST` 以及 `PROXY_PORT`。

:::

关于代理自动配置文件 (PAC)，请查看[代理自动配置文件（PAC）文件](https://developer.mozilla.org/docs/Web/HTTP/Proxy_servers_and_tunneling/Proxy_Auto-Configuration_PAC_file)。

`PAC_URI`: PAC 文件 URI，支持 http, https, ftp, file, data。具体以 [pac-proxy-agent](https://www.npmjs.com/package/pac-proxy-agent) NPM 包的支持为准。

`PAC_SCRIPT`: 硬编码的 PAC 脚本字符串。覆盖 `PAC_URI`。

### 反向代理

:::warning

这种代理方式无法代理包含 cookie 的请求。

:::

`REVERSE_PROXY_URL`: 反向代理地址，RSSHub 将会使用该地址作为前缀来发起请求，例如 `https://proxy.example.com/?target=`，对 `https://google.com` 发起的请求将被自动转换为 `https://proxy.example.com/?target=https%3A%2F%2Fgoogle.com`

你可以使用 Cloudflare Workers 来搭建一个简易的反向代理，例如：

```js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  let target = url.searchParams.get('target')

  if (!target) {
    return new Response('Hello, this is Cloudflare Proxy Service. To proxy your requests, please use the "target" URL parameter.')
  } else {
    target = decodeURIComponent(target)
    const newRequest = new Request(target, {
      headers: request.headers,
      method: request.method,
      body: request.body
    })
    return await fetch(newRequest)
  }
}
```

## 访问控制配置

RSSHub 支持使用访问密钥 / 码进行访问控制。开启将会激活全局访问控制，没有访问权限将会导致访问被拒绝。
### 允许清单/拒绝清单

此配置已被移除，建议使用类似 Nginx 或 Cloudflare 的代理服务器进行访问控制。

### 访问密钥 / 码

-   `ACCESS_KEY`: 访问密钥，用于直接访问所有路由或者生成访问码

访问码为 访问密钥 + 路由 共同生成的 md5，例如：

| 访问密钥    | 路由              | 生成过程                                 | 访问码                           |
| ----------- | ----------------- | ---------------------------------------- | -------------------------------- |
| ILoveRSSHub | /qdaily/column/59 | md5('/qdaily/column/59' + 'ILoveRSSHub') | 0f820530128805ffc10351f22b5fd121 |

-   此时可以通过 `code` 访问路由，例如：`https://rsshub.app/qdaily/column/59?code=0f820530128805ffc10351f22b5fd121`

-   或使用访问密钥 `key` 直接访问所有路由，例如：`https://rsshub.app/qdaily/column/59?key=ILoveRSSHub`

## 日志配置

`DEBUG_INFO`: 是否在首页显示路由信息。值为非 `true` `false` 时，在请求中带上参数 `debug` 开启显示，例如：`https://rsshub.app/?debug=value_of_DEBUG_INFO` 。默认 `true`

`LOGGER_LEVEL`: 指明输出到 console 和日志文件的日志的最大 [等级](https://github.com/winstonjs/winston#logging-levels)，默认 `info`

`NO_LOGFILES`: 是否禁用日志文件输出，默认 `false`

`SHOW_LOGGER_TIMESTAMP`: 在控制台输出中显示日志时间戳，默认 `false`

`SENTRY`: [Sentry](https://sentry.io) dsn，用于错误追踪

`SENTRY_ROUTE_TIMEOUT`: 路由耗时超过此毫秒值上报 Sentry，默认 `3000`

## 图片处理

:::tip 新配置方式

我们正在试验新的，更灵活的配置方式。如果有需要，请转到 [通用参数 -> 多媒体处理](/zh/parameter#多媒体处理) 了解更多。

在使用新配置时，请将下方环境变量留空。否则默认图片模版会继续遵循下方配置。

:::

`HOTLINK_TEMPLATE`: 用于处理描述中图片的 URL，绕过防盗链等限制，留空不生效。用法参考 [#2769](https://github.com/DIYgod/RSSHub/issues/2769)。可以使用 [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL#Properties) 的所有属性（加上后缀 `_ue` 则会对其进行 URL 编码），格式为 JS 变量模板。例子：`${protocol}//${host}${pathname}`, `https://i3.wp.com/${host}${pathname}`, `https://images.weserv.nl?url=${href_ue}`

`HOTLINK_INCLUDE_PATHS`: 限制需要处理的路由，只有匹配成功的路由会被处理，设置多项时用英文逗号 `,` 隔开。若不设置，则所有路由都将被处理

`HOTLINK_EXCLUDE_PATHS`: 排除不需处理的路由，所有匹配成功的路由都不被处理，设置多项时用英文逗号 `,` 隔开。可单独使用，也可用于排除已被前者包含的路由。若不设置，则没有任何路由会被过滤

:::tip 路由匹配模式

`HOTLINK_INCLUDE_PATHS` 和 `HOTLINK_EXCLUDE_PATHS` 均匹配路由根路径及其所有递归子路径，但并非子字符串匹配。注意必须以 `/` 开头，且结尾不需要 `/`。

例：`/example`, `/example/sub` 和 `/example/anthoer/sub/route` 均可被 `/example` 匹配，但 `/example_route` 不会被匹配。

也可带有路由参数，如 `/weibo/user/2612249974` 也是合法的。

:::

## 功能特性

:::tip[测试特性]

这个板块控制的是一些新特性的选项，他们都是**默认关闭**的。如果有需要请阅读对应说明后按需开启

:::

`ALLOW_USER_HOTLINK_TEMPLATE`: [通用参数 -> 多媒体处理](/zh/parameter#多媒体处理)特性控制

`FILTER_REGEX_ENGINE`: 控制 [通用参数 -> 内容过滤](/zh/parameter#内容过滤) 使用的正则引擎。可选`[re2, regexp]`，默认`re2`。我们推荐公开实例不要调整这个选项，这个选项目前主要用于向后兼容。

`ALLOW_USER_SUPPLY_UNSAFE_DOMAIN`: 允许用户为路由提供域名作为参数。建议公共实例不要调整此选项，开启后可能会导致 [服务端请求伪造（SSRF）](https://owasp.org/www-community/attacks/Server_Side_Request_Forgery)

## 其他应用配置

`DISALLOW_ROBOT`: 阻止搜索引擎收录，默认开启，设置 false 或 0 关闭

`ENABLE_CLUSTER`: 是否开启集群模式，默认 `false`

`NODE_ENV`: 是否显示错误输出，默认 `production` （即关闭输出）

`NODE_NAME`: 节点名，用于负载均衡，识别当前节点

`PUPPETEER_WS_ENDPOINT`: 用于 puppeteer.connect 的浏览器 websocket 链接，见 [browserWSEndpoint](https://zhaoqize.github.io/puppeteer-api-zh_CN/#?product=Puppeteer&show=api-browserwsendpoint)

`CHROMIUM_EXECUTABLE_PATH`: Chromium（或 Chrome）的可执行路径。若 puppeteer 没有下载捆绑的 Chromium（主动跳过下载或体系架构为 arm/arm64），设置此项可启用 puppeteer。或者，偏好 Chrome 而不是 Chromium 时，此项也很有用。**注意**：`PUPPETEER_WS_ENDPOINT` 被设置时，此项不生效；仅在手动部署时有用，对于 Docker 部署，请改用 `chromium-bundled` 版本镜像。

`TITLE_LENGTH_LIMIT`: 限制输出标题的字节长度，一个英文字符的长度为 1 字节，部分语言如中文，日文，韩文或阿拉伯文等，统一算作 2 字节，默认 `150`

`OPENAI_API_KEY`: OpenAI API Key，用于使用 ChatGPT 总结文章

`OPENAI_MODEL`: OpenAI 模型名称，用于使用 ChatGPT 总结文章，默认`gpt-3.5-turbo-16k`，详见 [OpenAI API 文档](https://platform.openai.com/docs/models/overview)

`OPENAI_TEMPERATURE`: OpenAI 温度参数，用于使用 ChatGPT 总结文章，默认`0.2`，详见 [OpenAI API 文档](https://platform.openai.com/docs/api-reference/chat/create#chat-create-temperature)

`OPENAI_MAX_TOKENS`: OpenAI 最大 token 数，用于使用 ChatGPT 总结文章，默认`null`，详见 [OpenAI API 文档](https://platform.openai.com/docs/api-reference/chat/create#chat-create-max_tokens)

`OPENAI_API_ENDPOINT`: OpenAI API 地址，用于使用 ChatGPT 总结文章，默认`https://api.openai.com/v1`，详见 [OpenAI API 文档](https://platform.openai.com/docs/api-reference/chat)

`OPENAI_PROMPT`: OpenAI 提示语，用于使用 ChatGPT 总结文章，详见 [OpenAI API 文档](https://platform.openai.com/docs/api-reference/chat)

`REMOTE_CONFIG`: 远程配置地址，用于动态更新配置，地址应返回一个环境变量名作为 key 的 JSON，会在应用启动时加载并合并本地配置，与本地配置冲突时以远程配置为准，但请注意部分基础配置项不支持从远程获取

## 部分 RSS 模块配置 {#route-specific-configurations}

:::tip

此处信息不完整。完整配置请参考路由对应的文档和 `lib/config.ts`。

:::

### 4399 论坛

-   `GAME_4399`: 对应登录后的 cookie 值，获取方式：
    1.  在 4399 首页登录。
    2.  打开开发者工具，切换到 Network 面板，刷新
    3.  查找`www.4399.com`的访问请求，点击请求，在右侧 Headers 中找到 Cookie.

### bilibili

用于用户关注动态系列路由

-   `BILIBILI_COOKIE_{uid}`: 对应 uid 的 b 站用户登录后的 Cookie 值，`{uid}` 替换为 uid，如 `BILIBILI_COOKIE_2267573`，获取方式：
    1.  打开 [https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8](https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8)
    2.  打开控制台，切换到 Network 面板，刷新
    3.  点击 dynamic_new 请求，找到 Cookie
    4.  视频和专栏，UP 主粉丝及关注只要求 `SESSDATA` 字段，动态需复制整段 Cookie

### Bitbucket

[Basic auth with App passwords](https://developer.atlassian.com/cloud/bitbucket/rest/intro/#basic-auth)

-   `BITBUCKET_USERNAME`: 你的 Bitbucket 用户名
-   `BITBUCKET_PASSWORD`: 你的 Bitbucket 密码

### BTBYR

-   `BTBYR_HOST`: 支持 ipv4 访问的 BTBYR 镜像，默认为原站 `https://bt.byr.cn/`。
-   `BTBYR_COOKIE`: 注册用户登录后的 Cookie 值，获取方式：
    1.  登录后打开网站首页
    2.  打开控制台，刷新
    3.  找到 `https://bt.byr.cn/index.php` 请求
    4.  找到请求头中的 Cookie

### BUPT

-   `BUPT_PORTAL_COOKIE`: 登录后获得的 Cookie 值，获取方式
    1.  打开 [https://webapp.bupt.edu.cn/wap/login.html?redirect=https://](https://webapp.bupt.edu.cn/wap/login.html?redirect=https://)>并登录
    2.  无视掉报错，并打开 [https://webapp.bupt.edu.cn/extensions/wap/news/list.html?p-1&type=xnxw](https://webapp.bupt.edu.cn/extensions/wap/news/list.html?p-1&type=xnxw)
    3.  打开控制台，刷新
    4.  找到 `https://webapp.bupt.edu.cn/extensions/wap/news/list.html?p-1&type=xnxw` 请求
    5.  找到请求头中的 Cookie

### Civitai

-   `CIVITAI_COOKIE`: Civitai 登录后的 cookie 值

### Discourse

-   `DISCOURSE_CONFIG_{id}`: 一个 Discourse 驱动的论坛的配置信息， `id` 可自由设定为任意数字或字符串。值应形如`{"link":link,"key":key}`。其中：
  -   `link`：论坛的链接。
  -   `key`访问论坛 API 的密钥，可参考 [此处代码](https://pastebin.com/YbLCgdWW) 以获取。需要确保有足够权限访问对应资源。

### Discuz

-   `DISCUZ_COOKIE_{cid}`: 某 Discuz 驱动的论坛，用户注册后的 Cookie 值，cid 可自由设定，取值范围 \[00, 99], 使用 discuz 通用路由时，通过指定 cid 来调用该 cookie

### Disqus

[申请地址](https://disqus.com/api/applications/)

-   `DISQUS_API_KEY`: Disqus API

### E-Hentai

-   `EH_IPB_MEMBER_ID`: E-Hentai 账户登录后 cookie 的 `ipb_member_id` 值
-   `EH_IPB_PASS_HASH`: E-Hentai 账户登录后 cookie 的 `ipb_pass_hash` 值
-   `EH_SK`: E-Hentai 账户登录后 cookie 中的`sk`值
-   `EH_IGNEOUS`: ExHentai 账户登录后 cookie 中的`igneous`值。若设置此值，RSS 数据将全部从里站获取
-   `EH_STAR`: E-Hentai 账户获得捐赠等级后将出现该 cookie。若设置此值，图片访问量限制将与账号关联而非 IP 地址
-   `EH_IMG_PROXY`: 封面代理访问地址。若设置此值，封面图链接将被替换为以此值开头。使用 ExHentai 时，封面图需要有 Cookie 才能访问，在一些阅读软件上没法显示封面，可以使用此值搭配一个加 Cookie 的代理服务器实现阅读软件无 Cookie 获取封面图。

### Fantia

-   `FANTIA_COOKIE`: 登录后的 `cookie` , 可以在控制台中查看请求头获取。如果不填会导致部分需要登录后才能阅读的帖子获取异常

### Gitee

[申请地址](https://gitee.com/api/v5/swagger)

-   `GITEE_ACCESS_TOKEN`: Gitee 私人令牌

### GitHub

[申请地址](https://github.com/settings/tokens)

-   `GITHUB_ACCESS_TOKEN`: GitHub Access Token

### Google Fonts

[申请地址](https://developers.google.com/fonts/docs/developer_api#a_quick_example)

-   `GOOGLE_FONTS_API_KEY`: API key

### Instagram

-   `IG_USERNAME`: Instagram 用户名（仅 Private API）
-   `IG_PASSWORD`: Instagram 密码（仅 Private API）
-   `IG_PROXY`: Instagram 代理 URL（仅 Private API，可选）
-   `IG_COOKIE`: Instagram 登录后的 Cookie（仅 Cookie）

注意，暂**不支持**两步验证。

### Iwara

-   `IWARA_USERNAME`: Iwara 用户名
-   `IWARA_PASSWORD`: Iwara 密码

### Last.fm

[申请地址](https://www.last.fm/api/)

-   `LASTFM_API_KEY`: Last.fm API Key

### LightNovel.us

-   `SECURITY_KEY`: 在token中security_key的值，请去除%22，例如`{%22security_key%22:%223cXXXX%22}`,只需要3cXXXX部分

### Mastodon

用户时间线路由：访问 `https://mastodon.example/settings/applications` 申请（替换掉 `mastodon.example`）。需要 `read:search` 权限

-   `MASTODON_API_HOST`: API 请求的实例，仅域名，不包括 `http://` 或 `https://` 协议头
-   `MASTODON_API_ACCESS_TOKEN`: 用户 access token, 申请应用后，在应用配置页可以看到申请者的 access token
-   `MASTODON_API_ACCT_DOMAIN`: 该实例本地用户 acct 标识的域名，Webfinger account URI，形如 `user@host`

### Medium

打开控制台，复制 Cookie（理论上只需要 uid 和 sid 即可）

-   `MEDIUM_ARTICLE_COOKIE`：请求全文时使用的 Cookie，存在活跃的 Member 订阅时可获取付费内容全文
-   `MEDIUM_COOKIE_{username}`：对应 username 的用户的 Cookie，个性推荐相关路由需要

### MiniFlux

-   `MINIFLUX_INSTANCE`： 用户所用的实例，默认为 MiniFlux 官方提供的 [付费服务地址](https://reader.miniflux.app)
-   `MINIFLUX_TOKEN`: 用户的 API 密钥，请登录所用实例后于 `设置` -> `API 密钥` -> `创建一个新的 API 密钥` 处获取

### NGA BBS

用于获取帖子内文

-   `NGA_PASSPORT_UID`: 对应 cookie 中的 `ngaPassportUid`.
-   `NGA_PASSPORT_CID`: 对应 cookie 中的 `ngaPassportCid`.

### nhentai torrent

[注册地址](https://nhentai.net/register/)

-   `NHENTAI_USERNAME`: nhentai 用户名或邮箱
-   `NHENTAI_PASSWORD`: nhentai 密码

### Notion

-   `NOTION_TOKEN`: Notion 内部集成 Token，请按照 [Notion 官方指引](https://developers.notion.com/docs/authorization#internal-integration-auth-flow-set-up) 申请 Token

### pianyuan

[注册地址](https://pianyuan.org)

-   `PIANYUAN_COOKIE`: 对应 cookie 中的 `py_loginauth`, 例：PIANYUAN_COOKIE='py_loginauth=xxxxxxxxxx'

### pixiv

[注册地址](https://accounts.pixiv.net/signup)

-   `PIXIV_REFRESHTOKEN`: Pixiv Refresh Token, 请参考 [此文](https://gist.github.com/ZipFile/c9ebedb224406f4f11845ab700124362) 获取，或自行对客户端抓包获取
-   `PIXIV_BYPASS_CDN`: 绕过 Pixiv 前置的 Cloudflare CDN, 使用`PIXIV_BYPASS_HOSTNAME`指示的 IP 地址访问 Pixiv API, 可以解决因 Cloudflare 机器人验证导致的登录失败问题，默认关闭，设置 true 或 1 开启
-   `PIXIV_BYPASS_HOSTNAME`: Pixiv 源站的主机名或 IP 地址，主机名会被解析为 IPv4 地址，默认为`public-api.secure.pixiv.net`；仅在`PIXIV_BYPASS_CDN`开启时生效
-   `PIXIV_BYPASS_DOH`: 用于解析 `PIXIV_BYPASS_HOSTNAME` 的 DoH 端点 URL，需要兼容 Cloudflare 或 Google 的 DoH 服务的 JSON 查询格式，默认为 `https://1.1.1.1/dns-query`
-   `PIXIV_IMG_PROXY`: 用于图片地址的代理，因为 pixiv 图片有防盗链，默认为 `https://i.pixiv.re`

### pixiv fanbox

用于获取付费内容

-   `FANBOX_SESSION_ID`: 对应 cookies 中的`FANBOXSESSID`。

### Saraba1st

用于获取帖子里的图片

-   `SARABA1ST_COOKIE`: 对应网页端的 Cookie。

### Sci-hub

用于科学期刊路由。

-   `SCIHUB_HOST`: 可访问的 sci-hub 镜像地址，默认为 `https://sci-hub.se`。

### Spotify

[注册地址](https://developer.spotify.com)

-   `SPOTIFY_CLIENT_ID`: Spotify 应用的 client ID
-   `SPOTIFY_CLIENT_SECRET`: Spotify 应用的 client secret

用户相关路由

-   `SPOTIFY_REFRESHTOKEN`：用户在此 Spotify 应用的 refresh token。可以利用 [alecchendev](https://github.com/alecchendev/spotify-refresh-token) 制作的 [spotify-refresh-token](https://alecchen.dev/spotify-refresh-token/) 获取。

:::tip

记得为 `Personal Top Items` 或 `Personal Saved Tracks` 分别勾选 `user-top-read` 或 `user-library-read` scope。

:::

### Telegram

贴纸包路由：[Telegram 机器人](https://telegram.org/blog/bot-revolution)

-   `TELEGRAM_TOKEN`: Telegram 机器人 token
-   `TELEGRAM_SESSION`: 可通过运行 `node lib/routes/telegram/tglib/client.js`

### Twitter

建议使用非重要账号，新账号或者不同地区登录可能会被限制登录

-   `TWITTER_USERNAME`: Twitter 用户名
-   `TWITTER_PASSWORD`: Twitter 密码
-   `TWITTER_AUTHENTICATION_SECRET`: 可选，Twitter 两步验证 -> 认证应用 -> `otpauth://totp/Twitter:@_RSSHub?secret=xxxxxxxxxxxxxxxx&issuer=Twitter` 中的 secret 部分

### Wordpress

-   `WORDPRESS_CDN`: 用于中转 http 图片链接。可供考虑的服务见下表：

    | url                                                                              | backbone     |
    | -------------------------------------------------------------------------------- | ------------ |
    | [https://imageproxy.pimg.tw/resize?url=](https://imageproxy.pimg.tw/resize?url=) | akamai       |
    | [https://images.weserv.nl/?url=](https://images.weserv.nl/?url=)         | cloudflare   |
    | [https://pic1.xuehuaimg.com/proxy](https://pic1.xuehuaimg.com/proxy)      | cloudflare   |
    | [https://cors.netnr.workers.dev](https://cors.netnr.workers.dev)       | cloudflare   |
    | [https://netnr-proxy.openode.io](https://netnr-proxy.openode.io)        | digitalocean |

### YouTube

[申请地址](https://console.developers.google.com/)

-   全部路由
  -   `YOUTUBE_KEY`: YouTube API Key，支持多个 key，用英文逗号 `,` 隔开
-   订阅列表路由额外设置
  -   `YOUTUBE_CLIENT_ID`: YouTube API 的 OAuth 2.0 客户端 ID
  -   `YOUTUBE_CLIENT_SECRET`: YouTube API 的 OAuth 2.0 客户端 Secret
  -   `YOUTUBE_REFRESH_TOKEN`: YouTube API 的 OAuth 2.0 客户端 Refresh Token。可以按照 [此 gist](https://gist.github.com/Kurukshetran/5904e8cb2361623498481f4a9a1338aa) 获取。

### ZodGame

-   `ZODGAME_COOKIE`: ZodGame 登录后的 Cookie 值

### 北京大学

用于北大未名 BBS 全站十大

-   `PKUBBS_COOKIE`: BBS 注册用户登录后的 Cookie 值，获取方式：
    1.  登录后打开论坛首页
    2.  打开控制台， 刷新
    3.  找到 `https://bbs.pku.edu.cn/v2/home.php` 请求
    4.  找到请求头中的 Cookie

### 滴答清单

-   `DIDA365_USERNAME`: 滴答清单用户名
-   `DIDA365_PASSWORD`: 滴答清单密码

### 端传媒设置

用于获取付费内容全文

-   `INITIUM_BEARER_TOKEN`: 端传媒 Web 版认证 token。获取方式：登陆后打开端传媒站内任意页面，打开浏览器开发者工具中 “网络”(Network) 选项卡，筛选 URL 找到任一个地址为`api.initium.com`开头的请求，点击检查其 “消息头”，在 “请求头” 中找到`Authorization`字段，将其值复制填入配置即可。你的配置应该形如`INITIUM_BEARER_TOKEN: 'Bearer eyJxxxx......xx_U8'`。使用 token 部署的好处是避免占据登陆设备数的额度，但这个 token 一般有效期为两周，因此只可作临时测试使用。

-   `INITIUM_IAP_RECEIPT`: 端传媒 iOS 版内购回执认证 token。获取方式：登陆后打开端传媒 iOS app 内任意页面，打开抓包工具，筛选 URL 找到任一个地址为`api.initium.com`开头的请求，点击检查其 “消息头”，在 “请求头” 中找到`X-IAP-Receipt`字段，将其值复制填入配置即可。你的配置应该形如`INITIUM_IAP_RECEIPT: 'ef81dee9e4e2fe084a0af1ea82da2f7b16e75f756db321618a119fa62b52550e'`。

Web 版认证 token 和 iOS 内购回执认证 token 只需选择其一填入即可。你也可选择直接在环境设置中填写明文的用户名和密码：

-   `INITIUM_USERNAME`: 端传媒用户名 （邮箱）
-   `INITIUM_PASSWORD`: 端传媒密码

### 豆瓣

用于想看

-   `DOUBAN_COOKIE`: 豆瓣登陆后的 Cookie 值

### 饭否

[申请地址](https://github.com/FanfouAPI/FanFouAPIDoc/wiki/Oauth)

-   `FANFOU_CONSUMER_KEY`: 饭否 Consumer Key
-   `FANFOU_CONSUMER_SECRET`: 饭否 Consumer Secret
-   `FANFOU_USERNAME`: 饭否登录用户名、邮箱、手机号
-   `FANFOU_PASSWORD`: 饭否密码

### 和风天气

[申请地址](https://id.qweather.com/#/register?redirect=https%3A%2F%2Fconsole.qweather.com)

-   `HEFENG_KEY`:API key

### 今日热榜

-   `TOPHUB_COOKIE`: 今日热榜登录后的 cookie，目前只需要 `itc_center_user=...` 以获取原始链接

### 米游社

-   `MIHOYO_COOKIE`：登录米游社后的 cookie，用于获取用户关注动态时间线。

### 南方周末

付费全文

-   `INFZM_COOKIE`: infzm 账户登陆后的 cookie，目前只需要 `passport_session=...` 即可获取全文

### 轻小说文库

-   `WENKU8_COOKIE`: 登陆轻小说文库后的 cookie

### 色花堂

-   `SEHUATANG_COOKIE`: 登陆色花堂后的 cookie 值。

### 邮箱 邮件列表路由

-   `EMAIL_CONFIG_{email}`: 邮箱设置，替换 `{email}` 为 邮箱账号，邮件账户的 `@` 与 `.` 替换为 `_`，例如 `EMAIL_CONFIG_xxx_qq_com`。Linux 内容格式为 `password=密码&host=服务器&port=端口`，docker 内容格式为 `password=密码&host=服务器&port=端口`，例如：
  -   Linux 环境变量：`EMAIL_CONFIG_xxx_qq_com="password=123456&host=imap.qq.com&port=993"`
  -   docker 环境变量：`EMAIL_CONFIG_xxx_qq_com=password=123456&host=imap.qq.com&port=993`，请勿添加引号 `'`，`"`。

-   注意：邮箱的路由不支持使用 socks5h 的代理，主要是受 `ImapFlow` 这个第三方库的限制，使用的时候需要注意。

### 网易云歌单

用于歌单及听歌排行

-   `NCM_COOKIES`: 网易云音乐登陆后的 cookie 值。

### 微博

用于个人时间线路由

[申请地址](https://open.weibo.com/connect)

-   `WEIBO_APP_KEY`: 微博 App Key
-   `WEIBO_APP_SECRET`: 微博 App Secret
-   `WEIBO_REDIRECT_URL`: 微博登录授权回调地址，默认为 `RSSHub 地址/weibo/timeline/0`，自定义回调地址请确保最后可以转跳到 `RSSHub 地址/weibo/timeline/0?code=xxx`

用于自定义分组

-   `WEIBO_COOKIES`: 用户访问网页微博时所使用的 cookie, 获取方式：
    1.  打开并登录 [https://m.weibo.cn](https://m.weibo.cn) （确保打开页面为手机版，如果强制跳转电脑端可尝试使用可更改 UserAgent 的浏览器插件）
    2.  按下`F12`打开控制台，切换至`Network（网络）`面板
    3.  在该网页切换至任意关注分组，并在面板打开最先捕获到的请求 （该情形下捕获到的请求路径应包含`/feed/group`）
    4.  查看该请求的`Headers（请求头）`, 找到`Cookie`字段并复制内容

### 小宇宙

需要 App 登陆后抓包获取相应数据。

-   `XIAOYUZHOU_ID`: 即数据包中的 `x-jike-device-id`。
-   `XIAOYUZHOU_TOKEN`: 即数据包中的 `x-jike-refresh-token`。

### 新榜

-   `NEWRANK_COOKIE`: 登陆后的 COOKIE 值，其中 token 是必要的，其他可删除

### 喜马拉雅

-   `XIMALAYA_TOKEN`: 对应 cookie 中的 `1&_token`，获取方式：
    1.  登陆喜马拉雅网页版
    2.  打开控制台，刷新
    3.  查找名称为`1&_token`的`cookie`，其内容即为`XIMALAYA_TOKEN`的值（即在`cookie` 中查找 `1&_token=***;`，并设置 `XIMALAYA_TOKEN = ***`）

### 知乎用户

用于用户关注时间线

-   `ZHIHU_COOKIES`: 知乎登录后的 cookie 值。
    1.  可以在知乎网页版的一些请求的请求头中找到，如 `GET /moments` 请求头中的 `cookie` 值。
