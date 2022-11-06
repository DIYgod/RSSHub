---
pageClass: routes
---

# Blog

## archdaily

### Home

<RouteEn author="kt286" example="/archdaily" path="/archdaily"/>

## CSDN

### User Feed

<RouteEn author="Jkker" example="/csdn/blog/csdngeeknews" path="/csdn/blog/:user" radar="1" :paramsDesc="['`user` is the username of a CSDN blog which can be found in the url of the home page']" />

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

