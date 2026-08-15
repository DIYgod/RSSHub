import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['multimedia'],
    example: '/xyzrank',
    radar: [
        {
            source: ['xyzrank.com/'],
            target: '/',
        },
    ],
    name: '热门节目',
    maintainers: ['nczitzk'],
    handler,
    url: 'xyzrank.com/',
};

export async function handler(ctx) {
    const category = getSubPath(ctx).slice(1);

    const rootUrl = 'https://xyzrank.com';
    const currentUrl = `${rootUrl}/#/${category}`;

    let response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = load(response.data);

    const categories = {
        '': {
            url: `${rootUrl}/api/episodes`,
            title: '热门节目',
            type: 'episodes',
        },
        'hot-podcasts': {
            url: `${rootUrl}/api/podcasts`,
            title: '热门播客',
            type: 'podcasts',
        },
        'hot-episodes-new': {
            url: `${rootUrl}/api/new-episodes`,
            title: '新锐节目',
            type: 'episodes',
        },
        'new-podcasts': {
            url: `${rootUrl}/api/new-podcasts`,
            title: '新锐播客',
            type: 'podcasts',
        },
    };

    response = await got({
        method: 'get',
        url: categories[category].url,
    });

    const type = categories[category].type;

    const items = response.data.items.slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 250).map((item, index) => ({
        title: `#${index + 1} ${item.title ?? item.name}`,
        category: [item.primaryGenreName],
        author: item.authorsText,
        link: `${item.link ?? item.links[0].url}${item.trackCount ? `#${item.trackCount}` : ''}`,
        pubDate: parseDate(item.postTime ?? item.lastReleaseDate),
        description: renderToString(
            <>
                {item.logoURL ? <img src={item.logoURL} /> : null}
                <table>
                    {Object.entries(
                        type === 'podcasts'
                            ? {
                                  '#': index + 1,
                                  播客电台: item.name,
                                  主持: item.authorsText,
                                  分类: item.primaryGenreName,
                                  更新频率: `${(item.avgUpdateFreq / 24).toFixed(1)}天`,
                                  最近更新: `${item.lastReleaseDateDayCount.toFixed(1)}天前`,
                                  总集数: item.trackCount,
                                  平均时长: `${item.avgDuration}′`,
                                  平均播放量: item.avgPlayCount,
                                  平均评论量: item.avgCommentCount,
                                  千播互动量: (item.avgInteractIndicator * 1000).toFixed(0),
                                  平均打开率: `${(item.avgOpenRate * 100).toFixed(1)}%`,
                                  小宇宙: item.links[0].url,
                                  'Apple Podcasts': item.links[1].url,
                                  官方网站: item.links[2].url,
                                  'RSS 订阅': item.links[3].url,
                              }
                            : {
                                  '#': index + 1,
                                  节目标题: item.title,
                                  播客电台: item.podcastName,
                                  播放量: item.playCount,
                                  评论量: item.commentCount,
                                  互动率: `${((item.commentCount / item.playCount) * 100).toFixed(1)}%`,
                                  打开率: `${(item.openRate * 100).toFixed(1)}%`,
                                  时长: `${item.duration}′`,
                                  发布时间: item.postTime,
                                  分类: item.primaryGenreName,
                                  链接: item.link,
                              }
                    ).map(([label, value]) =>
                        value ? (
                            <tr>
                                <td>
                                    <b>{label}</b>
                                </td>
                                <td>{value}</td>
                            </tr>
                        ) : null
                    )}
                </table>
            </>
        ),
    }));

    return {
        title: `${$('title').text()} - ${categories[category].title}`,
        link: currentUrl,
        item: items,
        description: $('meta[property="og:description"]').attr('content'),
    };
}
