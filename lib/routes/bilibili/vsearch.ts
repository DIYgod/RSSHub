import { Route } from '@/types';
import cache from '@/utils/cache';
import { config } from '@/config';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import utils from './utils';
import { CookieJar } from 'tough-cookie';
const cookieJar = new CookieJar();
import { queryToBoolean } from '@/utils/readable-social';

export const route: Route = {
    path: '/vsearch/:kw/:order?/:disableEmbed?/:tid?',
    categories: ['social-media'],
    example: '/bilibili/vsearch/RSSHub',
    parameters: { kw: '检索关键字', order: '排序方式, 综合:totalrank 最多点击:click 最新发布:pubdate(缺省) 最多弹幕:dm 最多收藏:stow', disableEmbed: '默认为开启内嵌视频, 任意值为关闭', tid: '分区 id' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '视频搜索',
    maintainers: ['Symty'],
    handler,
    description: `分区 id 的取值请参考下表：

  | 全部分区 | 动画 | 番剧 | 国创 | 音乐 | 舞蹈 | 游戏 | 知识 | 科技 | 运动 | 汽车 | 生活 | 美食 | 动物圈 | 鬼畜 | 时尚 | 资讯 | 娱乐 | 影视 | 纪录片 | 电影 | 电视剧 |
  | -------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------ | ---- | ---- | ---- | ---- | ---- | ------ | ---- | ------ |
  | 0        | 1    | 13   | 167  | 3    | 129  | 4    | 36   | 188  | 234  | 223  | 160  | 211  | 217    | 119  | 155  | 202  | 5    | 181  | 177    | 23   | 11     |`,
};

async function handler(ctx) {
    const kw = ctx.req.param('kw');
    const order = ctx.req.param('order') || 'pubdate';
    const disableEmbed = queryToBoolean(ctx.req.param('disableEmbed'));
    const kw_url = encodeURIComponent(kw);
    const tids = ctx.req.param('tid') ?? 0;

    const data = await cache.tryGet(
        `bilibili:vsearch:${tids}:${kw}:${order}`,
        async () => {
            await got('https://passport.bilibili.com/login', {
                cookieJar,
            });

            const response = await got('https://api.bilibili.com/x/web-interface/search/type', {
                headers: {
                    Referer: `https://search.bilibili.com/all?keyword=${kw_url}`,
                },
                cookieJar,
                searchParams: {
                    search_type: 'video',
                    highlight: 1,
                    keyword: kw,
                    order,
                    tids,
                },
            });
            return response.data.data.result;
        },
        config.cache.routeExpire,
        false
    );

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
                    `Match By: ${item.hit_columns.join(',')}` +
                    (disableEmbed ? '' : `<br><br>${utils.iframe(item.aid)}`),
                pubDate: parseDate(item.pubdate, 'X'),
                guid: item.arcurl,
                link: item.arcurl,
            };
        }),
    };
}
