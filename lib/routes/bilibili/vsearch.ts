import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import cacheIn from './cache';
import utils from './utils';

export const route: Route = {
    path: '/vsearch/:kw/:order?/:embed?/:tid?',
    categories: ['social-media'],
    example: '/bilibili/vsearch/RSSHub',
    parameters: {
        kw: '检索关键字',
        order: '排序方式, 综合:totalrank 最多点击:click 最新发布:pubdate(缺省) 最多弹幕:dm 最多收藏:stow',
        embed: '默认为开启内嵌视频, 任意值为关闭',
        tid: '分区 id',
    },
    features: {
        requireConfig: [
            {
                name: 'BILIBILI_COOKIE_*',
                optional: true,
                description: `如果没有此配置，那么必须开启 puppeteer 支持；BILIBILI_COOKIE_{uid}: 用于用户关注动态系列路由，对应 uid 的 b 站用户登录后的 Cookie 值，\`{uid}\` 替换为 uid，如 \`BILIBILI_COOKIE_2267573\`，获取方式：
1.  打开 [https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8](https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8)
2.  打开控制台，切换到 Network 面板，刷新
3.  点击 dynamic_new 请求，找到 Cookie
4.  视频和专栏，UP 主粉丝及关注只要求 \`SESSDATA\` 字段，动态需复制整段 Cookie`,
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '视频搜索',
    maintainers: ['pcrtool', 'DIYgod'],
    handler,
    description: `分区 id 的取值请参考下表：

| 全部分区 | 动画 | 番剧 | 国创 | 音乐 | 舞蹈 | 游戏 | 知识 | 科技 | 运动 | 汽车 | 生活 | 美食 | 动物圈 | 鬼畜 | 时尚 | 资讯 | 娱乐 | 影视 | 纪录片 | 电影 | 电视剧 |
| -------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------ | ---- | ---- | ---- | ---- | ---- | ------ | ---- | ------ |
| 0        | 1    | 13   | 167  | 3    | 129  | 4    | 36   | 188  | 234  | 223  | 160  | 211  | 217    | 119  | 155  | 202  | 5    | 181  | 177    | 23   | 11     |`,
};

const getIframe = (data, embed: boolean = true) => {
    if (!embed) {
        return '';
    }
    const aid = data?.aid;
    const bvid = data?.bvid;
    if (aid === undefined && bvid === undefined) {
        return '';
    }
    return utils.renderUGCDescription(embed, '', '', aid, undefined, bvid);
};

async function handler(ctx) {
    const kw = ctx.req.param('kw');
    const order = ctx.req.param('order') || 'pubdate';
    const embed = !ctx.req.param('embed');
    const kw_url = encodeURIComponent(kw);
    const tids = ctx.req.param('tid') ?? 0;
    const cookie = await cacheIn.getCookie();

    const response = await got('https://api.bilibili.com/x/web-interface/search/type', {
        headers: {
            Referer: `https://search.bilibili.com/all?keyword=${kw_url}`,
            Cookie: cookie,
        },
        searchParams: {
            search_type: 'video',
            highlight: 1,
            keyword: kw,
            order,
            tids,
        },
    });
    const data = response.data.data.result;

    return {
        title: `${kw} - bilibili`,
        link: `https://search.bilibili.com/all?keyword=${kw}&order=${order}`,
        description: `Result from ${kw} bilibili search, ordered by ${order}.`,
        item: data.map((item) => {
            const l = item.duration
                .split(':')
                .map((i) => [i.length > 1 ? i : ('00' + i).slice(-2)])
                .join(':');
            const des = item.description.replaceAll('\n', '<br/>');
            const img = item.pic.replaceAll(/^\/\//g, 'http://');
            return {
                title: item.title.replaceAll(/<[ /]?em[^>]*>/g, ''),
                author: item.author,
                category: [...item.tag.split(','), item.typename],
                description:
                    `Length: ${l}<br/>` +
                    `AuthorID: ${item.mid}<br/>` +
                    `Play: ${item.play}    Favorite: ${item.favorites}<br/>` +
                    `Danmaku: ${item.video_review}    Comment: ${item.review}<br/>` +
                    `<br/>${des}<br/>` +
                    `<img src="${img}"><br/>` +
                    `Match By: ${item.hit_columns?.join(',') || ''}` +
                    getIframe(item, embed),
                pubDate: parseDate(item.pubdate, 'X'),
                guid: item.arcurl,
                link: item.arcurl,
            };
        }),
    };
}
