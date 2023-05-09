---
pageClass: routes
---

# Blog

## Amazon

### AWS Blogs

<RouteEn author="HankChow" example="/amazon/awsblogs" path="/awsblogs/:locale?" :paramsDesc="['Blog postes in a specified language, only the following options are supported. Default `zh_CN`']">

| zh_CN | en_US | fr_FR | de_DE | ja_JP | ko_KR | pt_BR | es_ES | ru_RU | id_ID | tr_TR |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Chinese    | English    | French    | German    | Japanese    | Korean    | Portuguese  | Spainish  | Russian    | Indonesian   | Turkish  |

</RouteEn>

## archdaily

### Home

<RouteEn author="kt286" example="/archdaily" path="/archdaily"/>

## CSDN

### User Feed

<RouteEn author="Jkker" example="/csdn/blog/csdngeeknews" path="/csdn/blog/:user" radar="1" :paramsDesc="['`user` is the username of a CSDN blog which can be found in the url of the home page']" />

## Geocaching

### Official Blogs

<RouteEn author="HankChow" example="/geocaching/blogs" path="/geocaching/blogs" radar="1"/>

## Google Sites

### Articles

<RouteEn author="hoilc" example="/google/sites/outlierseconomics" path="/google/sites/:id" :paramsDesc="['Site ID, can be found in URL']" />

### Recent Changes

<RouteEn author="nczitzk" example="/google/sites/recentChanges/outlierseconomics" path="/google/sites/recentChanges/:id" :paramsDesc="['Site ID, can be found in URL']"/>

## Hexo Blog

### Blog using Next theme

<RouteEn author="fengkx" path="/hexo/next/:url" example="/hexo/next/archive.diygod.me" :paramsDesc="['the blog URL without the protocol (http:// and https://)']" selfhost="1"/>

### Blog using Yilia theme

<RouteEn author="aha2mao" path="/hexo/yilia/:url" example="/hexo/yilia/cloudstone.xin" :paramsDesc="['the blog URL without the protocol (http:// and https://)']" selfhost="1"/>

### Blog using Fluid theme

<RouteEn author="gkkeys" path="/hexo/fluid/:url" example="/hexo/fluid/blog.tonyzhao.xyz" :paramsDesc="['the blog URL without the protocol (http:// and https://)']" selfhost="1"/>

## Love the Problem

### Ash Maurya's blog

<RouteEn author="james-tindal" example="/ash-maurya" path="/ash-maurya"/>

## MacMenuBar

### Recently

<RouteEn author="5upernova-heng" example="/macmenubar/recently/developer-apps,system-tools" path="/macmenubar/recently/:category?" :paramsDesc="['Category path name, seperate by comma, default is all categories. Category path name can be found in url']" radar="1" />

## Medium

### List

<RouteEn author="ImSingee" example="/medium/list/imsingee/f2d8d48096a9" path="/medium/list/:user/:catalogId" :paramsDesc="['Username', 'List ID']">

The List ID is the last part of the URL after `-`, for example, the username in "https://medium.com/@imsingee/list/collection-7e67004f23f9" is `imsingee`, and the ID is `7e67004f23f9`.

::: warning Note

To access private lists, only self-hosting is supported.

:::

</RouteEn>

### Personalized Recommendations - For You

<RouteEn author="ImSingee" example="/medium/for-you/imsingee" path="/medium/for-you/:user" :paramsDesc="['Username']" selfhost="1">

::: warning Note

Personalized recommendations require the cookie value after logging in, so only self-hosting is supported. See the configuration module on the deployment page for details.

:::

</RouteEn>

### Personalized Recommendations - Following

<RouteEn author="ImSingee" example="/medium/following/imsingee" path="/medium/following/:user" :paramsDesc="['Username']" selfhost="1">

::: warning Note

Personalized recommendations require the cookie value after logging in, so only self-hosting is supported. See the configuration module on the deployment page for details.

:::

</RouteEn>

### Personalized Recommendations - Tag

<RouteEn author="ImSingee" example="/medium/tag/imsingee/cybersecurity" path="/medium/tag/:user/:tag" :paramsDesc="['Username', 'Subscribed Tag']" selfhost="1">

There are many tags, which can be obtained by clicking on a tag from the homepage and looking at the URL. For example, if the URL is `https://medium.com/?tag=web3`, then the tag is `web3`.

::: warning Note

Personalized recommendations require the cookie value after logging in, so only self-hosting is supported. See the configuration module on the deployment page for details.

:::

</RouteEn>

## Miris Whispers

### Blog

<RouteEn author="chazeon" example="/miris/blog" path="/miris/blog" />

## Paul Graham

### Essays

<RouteEn author="Maecenas" example="/blogs/paulgraham" path="/blogs/paulgraham"/>

## Phrack Magazine

### Article

<RouteEn author="CitrusIce" example="/phrack" path="/phrack" />

## Polkadot

### Blog

<RouteEn author="iceqing" example="/polkadot/blog" path="/polkadot/blog" />

## PolkaWorld

### Newest Articles

<RouteEn author="iceqing" example="/polkaworld/newest" path="/polkaworld/newest">

::: tip

Limit the number of entries to be retrieved by adding `?limit=x` to the end of the route, default value is `10`.

:::

</RouteEn>

## Stratechery by Ben Thompson

### Blog

<RouteEn author="chazeon" example="/stratechery" path="/stratechery" />

## Uber

### Engineering

<RouteEn author="hulb" example="/uber/blog" path="/uber/blog/:maxPage?" :paramsDesc="['max number of pages to retrieve, default to 1 page at most']" />

## WordPress

### Blog

<RouteEn author="Lonor" example="/blogs/wordpress/lawrence.code.blog" path="/blogs/wordpress/:domain/:https?" :paramsDesc="['WordPress blog domain', 'use https by default. options: `http` or `https`']"/>

## yuzu emulator

### Entry

<RouteEn author="nczitzk" example="/yuzu-emu/entry" path="/yuzu-emu/entry" />
