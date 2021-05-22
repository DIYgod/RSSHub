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

## Hexo Blog

### Blog using Next theme

<RouteEn author="fengkx" path="/hexo/next/:url" example="/hexo/next/diygod.me" :paramsDesc="['the blog URL without the protocol (http:// and https://)']" />

### Blog using Yilia theme

<RouteEn author="aha2mao" path="/hexo/yilia/:url" example="/hexo/yilia/cloudstone.xin" :paramsDesc="['the blog URL without the protocol (http:// and https://)']" />

## Paul Graham

### Essays

<RouteEn author="Maecenas" example="/blogs/paulgraham" path="/blogs/paulgraham"/>

## Phrack Magazine

### Article

<RouteEn author="CitrusIce" example="/phrack" path="/phrack" />

## WordPress

<Route author="Lonor" example="/blogs/wordpress/lawrence.code.blog" path="/blogs/wordpress/:domain/:https?" :paramsDesc="['WordPress blog domain', 'use https by default. options: `http` or `https`']"/>

