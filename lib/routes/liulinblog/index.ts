import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:channel?',
    categories: ['new-media'],
    example: '/liulinblog',
    parameters: { channel: '频道 id，可在对应频道页 URL 中找到，见下表，默认为最新' },
    radar: [
        {
            source: ['liulinblog.com/:channel', 'liulinblog.com/'],
            target: '/:channel',
        },
    ],
    name: '频道',
    maintainers: ['nczitzk'],
    handler,
    description: `| 最新 | 60 秒读懂世界 | 精品资源 | 视频资源 | 音频资源 |
| ---- | ------------- | -------- | -------- | -------- |
|      | kuaixun       | ziyuan   | video    | yinpin   |

| 绝版资源 | 实用文档 | PPT 素材  | 后期素材 | 技能教程  |
| -------- | -------- | --------- | -------- | --------- |
| jueban   | wendang  | ppt-sucai | sucai    | jiaocheng |

| 创业副业 | 单机游戏 | 冒险解谜 | 竞技格斗    | 赛车竞技 |
| -------- | -------- | -------- | ----------- | -------- |
| money    | game     | mxjm     | jingjigedou | saiche   |

| 模拟经营 | 角色扮演 | 飞行游戏 | 塔防策略 | 射击游戏 |
| -------- | -------- | -------- | -------- | -------- |
| moni     | jiaose   | feixing  | tafang   | sheji    |

| 恐怖冒险 | 策略生存 | 动作冒险 | 电商运营  | 互联网早报 |
| -------- | -------- | -------- | --------- | ---------- |
| kongbu   | celve    | dongzuo  | dianshang | internet   |

| 站长圈 | 自媒体运营 | 短视频      |
| ------ | ---------- | ----------- |
| seo    | zimeiti    | duan-shipin |`,
};

export async function handler(ctx) {
    const subPath = getSubPath(ctx);
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 20;

    const rootUrl = 'https://www.liulinblog.com';
    const currentUrl = subPath === '/' ? rootUrl : new URL(subPath, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('div.scroll')
        .first()
        .find('article')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('h2.entry-title a');

            return {
                title: a.prop('title'),
                link: a.prop('href'),
                description: item.find('div.entry-excerpt').html(),
                author: item
                    .find('span.meta-author a')
                    .toArray()
                    .map((a) => $(a).prop('title'))
                    .join(' / '),
                category: item
                    .find('span.meta-category-dot a[rel="category"]')
                    .toArray()
                    .map((c) => $(c).text()),
                guid: `liulinblog-${item.prop('id')}`,
                pubDate: parseDate(item.find('span.meta-date time').prop('datetime')),
                comments: item.find('span.meta-comment').text() ? Number(item.find('span.meta-comment').text().trim()) : 0,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                content('div[role="alert"]').remove();

                item.title = content('meta[property="og:title"]').prop('content');
                item.description = content('div.entry-content').html();
                item.author = content('div.entry-meta')
                    .first()
                    .find('span.meta-author a')
                    .toArray()
                    .map((a) => content(a).prop('title'))
                    .join(' / ');
                item.category = content('div.entry-meta')
                    .first()
                    .find('span.meta-category a[rel="category"]')
                    .toArray()
                    .map((c) => content(c).text());
                item.guid = `liulinblog-${content('article').first().prop('id')}`;
                item.pubDate = parseDate(content('span.meta-date time').first().prop('datetime'));
                item.comments = content('h3.comments-title').text()
                    ? Number(
                          content('h3.comments-title')
                              .text()
                              .match(/\((\d+)\)/)
                      )
                    : 0;

                return item;
            })
        )
    );

    const icon = $('link[rel="icon"]').prop('href');
    const title = $('img.logo').prop('alt');

    return {
        item: items,
        title: `${title} - ${subPath === '/' ? '最新' : $('h1.term-title').text().split('搜索到', 1)[0]}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh-cn',
        image: $('img.logo').prop('src'),
        icon,
        logo: icon,
        subtitle: $('p.term-description').text(),
        author: title,
    };
}
