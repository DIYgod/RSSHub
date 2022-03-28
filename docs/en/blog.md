---
pageClass: routes
---

# Blog

## archdaily

### Home

<RouteEn author="kt286" example="/archdaily" path="/archdaily"/>

## Google Sites

### Articles

<RouteEn author="hoilc" example="/google/sites/outlierseconomics" path="/google/sites/:id" :paramsDesc="['Site ID, can be found in URL']" />

### Recent Changes

<RouteEn author="nczitzk" example="/google/sites/recentChanges/outlierseconomics" path="/google/sites/recentChanges/:id" :paramsDesc="['Site ID, can be found in URL']"/>

## Hexo Blog

### Blog using Next theme

<RouteEn author="fengkx" path="/hexo/next/:url" example="/hexo/next/diygod.me" :paramsDesc="['the blog URL without the protocol (http:// and https://)']" />

### Blog using Yilia theme

<RouteEn author="aha2mao" path="/hexo/yilia/:url" example="/hexo/yilia/cloudstone.xin" :paramsDesc="['the blog URL without the protocol (http:// and https://)']" />

### Blog using Fluid theme

<RouteEn author="gkkeys" path="/hexo/fluid/:url" example="/hexo/fluid/blog.tonyzhao.xyz" :paramsDesc="['the blog URL without the protocol (http:// and https://)']" />

## Love the Problem

### Ash Maurya's blog

<RouteEn author="james-tindal" example="/ash-maurya" path="/ash-maurya"/>

## Paul Graham

### Essays

<RouteEn author="Maecenas" example="/blogs/paulgraham" path="/blogs/paulgraham"/>

## Phrack Magazine

## PolkaWorld

### Newest Articles

<RouteEn author="iceqing" example="/polkaworld/newest" path="/polkaworld/newest">

::: tip

Limit the number of entries to be retrieved by adding `?limit=x` to the end of the route, default value is `10`.

:::

</RouteEn>

### Article

<RouteEn author="CitrusIce" example="/phrack" path="/phrack" />

## WordPress

<RouteEn author="Lonor" example="/blogs/wordpress/lawrence.code.blog" path="/blogs/wordpress/:domain/:https?" :paramsDesc="['WordPress blog domain', 'use https by default. options: `http` or `https`']"/>

## yuzu emulator

### Entry

<RouteEn author="nczitzk" example="/yuzu-emu/entry" path="/yuzu-emu/entry" />
