# API

::: warning 注意
API 仍处于开发状态中， 并可能会有改动。欢迎提供建议！
:::

RSSHub 提供下列 API:

## 可用公共路由列表

::: tip 提示
`protected_router.js`下的路由**不会被**包含在此 API 返回的结果当中.
:::

举例: <https://rsshub.app/api/routes/bilibili>

路由: `/api/routes/:name?`

参数:

-   `name`, 路由一级名称，对应 <https://github.com/DIYgod/RSSHub/tree/master/lib/routes> 中的文件夹名称。可选，**缺省则返回所有可用路由**.

成功请求将会返回 HTTP 状态码 `200 OK` 与 JSON 结果，格式如下:

```js
{
    "status": "success",
    "data": {
        "bilibili": {
            "routes": [
                "/bilibili/user/video/:uid",
                "/bilibili/user/article/:uid",
                "/bilibili/user/fav/:uid",
                "/bilibili/user/coin/:uid",
                "/bilibili/user/dynamic/:uid",
                "/bilibili/user/followers/:uid",
                "/bilibili/user/followings/:uid",
                "/bilibili/user/channel/:uid/:cid",
                "/bilibili/partion/:tid",
                "/bilibili/partion/ranking/:tid/:days?",
                "/bilibili/bangumi/:seasonid",
                "/bilibili/video/page/:aid",
                "/bilibili/video/reply/:aid",
                "/bilibili/link/news/:product",
                "/bilibili/live/room/:roomID",
                "/bilibili/live/search/:key/:order",
                "/bilibili/live/area/:areaID/:order",
                "/bilibili/fav/:uid/:fid",
                "/bilibili/blackboard",
                "/bilibili/mall/new",
                "/bilibili/mall/ip/:id",
                "/bilibili/ranking/:rid?/:day?",
                "/bilibili/topic/:topic"
            ]
        }
    },
    "message": "request returned 22 routes"
}
```

若无符合请求路由，请求将会返回 HTTP 状态码 `204 No Content`.
