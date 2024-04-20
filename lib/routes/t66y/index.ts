import { Route } from '@/types';
import * as cheerio from 'cheerio';
import got from '@/utils/got';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { baseUrl, parseContent } from './utils';

export const route: Route = {
    path: '/:id/:type?',
    categories: ['multimedia'],
    example: '/t66y/20/2',
    parameters: { id: '分区 id, 可在分区页 URL 中找到', type: '类型 id, 可在分区类型过滤后的 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分区帖子',
    maintainers: ['zhboner'],
    handler,
    description: `> 注意：并非所有的分区都有子类型，可以参考成人文学交流区的 \`古典武侠\` 这一子类型。

  | 亚洲无码原创区 | 亚洲有码原创区 | 欧美原创区 | 动漫原创区 | 国产原创区 |
  | -------------- | -------------- | ---------- | ---------- | ---------- |
  | 2              | 15             | 4          | 5          | 25         |

  | 中字原创区 | 转帖交流区 | HTTP 下载区 | 在线成人区 |
  | ---------- | ---------- | ----------- | ---------- |
  | 26         | 27         | 21          | 22         |

  | 技术讨论区 | 新时代的我们 | 达盖尔的旗帜 | 成人文学交流 |
  | ---------- | ------------ | ------------ | ------------ |
  | 7          | 8            | 16           | 20           |`,
};

async function handler(ctx) {
    const { id, type } = ctx.req.param();

    const url = new URL(`thread0806.php?fid=${id}&search=today`, baseUrl);
    type && url.searchParams.set('type', type);

    const { data: res } = await got(url);
    const $ = cheerio.load(res);
    const list = $('#ajaxtable > tbody:nth-child(2) .tr3')
        .not('.tr2.tac')
        .toArray()
        .map((item) => {
            const element = $(item);

            const tal = element.find('.tal');
            const catalog = tal
                .contents()
                .filter((_, node) => node.type === 'text')
                .text()
                .trim();
            const a = tal.find('h3 a');
            const td3 = element.find('td:nth-child(3)');

            return {
                title: `${catalog} ${a.text()}`,
                link: `${baseUrl}/${a.attr('href')}`,
                author: td3.find('a').text(),
                pubDate: parseDate(String(td3.find('span[data-timestamp]').data('timestamp')).slice(0, -1), 'X'),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);

                item.description = parseContent(response);

                return item;
            })
        )
    );

    return {
        title: (type ? `[${$('.t .fn b').text()}]` : '') + $('head title').text(),
        link: url.href,
        item: out,
    };
}
