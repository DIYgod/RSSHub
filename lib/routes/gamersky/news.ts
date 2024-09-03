import type { DataItem, Route } from '@/types';
import { load } from 'cheerio';
import type { Context } from 'hono';
import { ofetch } from 'ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import cache from '@/utils/cache';
import { mdTableBuilder } from './review';

const idNameMap = [
    {
        type: 'today',
        name: '今日推荐',
        nodeId: '11007',
    },
    {
        name: '单机电玩',
        type: 'pc',
        nodeId: '129',
    },
    {
        name: 'NS',
        type: 'ns',
        nodeId: '21160',
    },
    {
        name: '手游',
        type: 'mobile',
        nodeId: '20260',
    },
    {
        name: '网游',
        type: 'web',
        nodeId: '20225',
    },
    {
        name: '业界',
        type: 'industry',
        nodeId: '21163',
    },
    {
        name: '硬件',
        type: 'hardware',
        nodeId: '20070',
    },
    {
        name: '科技',
        type: 'tech',
        nodeId: '20547',
    },
];

export const route: Route = {
    path: '/news/:type?',
    categories: ['game'],
    example: '/gamersky/news/pc',
    parameters: {
        type: '资讯类型，见表，默认为 `pc`',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.gamersky.com/news'],
            target: '/news',
        },
    ],
    name: '资讯',
    maintainers: ['yy4382'],
    description: mdTableBuilder(idNameMap),
    handler,
};

async function handler(ctx: Context) {
    const type = ctx.req.param('type') ?? 'pc';

    const idName = idNameMap.find((item) => item.type === type);
    if (!idName) {
        throw new Error(`Invalid type: ${type}`);
    }

    const response = await ofetch(
        `https://db2.gamersky.com/LabelJsonpAjax.aspx?${new URLSearchParams({
            jsondata: JSON.stringify({
                type: 'updatenodelabel',
                isCache: true,
                cacheTime: 60,
                nodeId: idName.nodeId,
                isNodeId: 'true',
                page: 1,
            }),
        })}`,
        {
            parseResponse: (txt) => JSON.parse(txt.match(/\((.+)\);/)?.[1] ?? '{}'),
        }
    );
    const $ = load(response.body);
    const list = $('li')
        .toArray()
        .map((item) => {
            const ele = $(item);
            const title = ele.find('.tit > a').text();
            const link = ele.find('.tit > a').attr('href');
            const pubDate = timezone(parseDate(ele.find('.time').text()), 8);
            const description = ele.find('.txt').text();
            if (!link) {
                return;
            }
            return {
                title,
                link,
                pubDate,
                description,
            };
        })
        .filter((item) => item !== undefined) satisfies DataItem[];
    const fullTextList = await Promise.all(
        list.map(
            (item) =>
                cache.tryGet(item.link, async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);
                    const content = $('.Mid2L_con');
                    content.find('.appGameBuyCardIframe, .GSAppButton, .Mid2L_down').remove();
                    content.find('a').each((_, item) => {
                        if (item.attribs.href?.startsWith('https://www.gamersky.com/showimage/id_gamersky.shtml?')) {
                            item.attribs.href = item.attribs.href.replace('https://www.gamersky.com/showimage/id_gamersky.shtml?', '');
                        }
                    });
                    content.find('img').each((_, item) => {
                        if (item.attribs.src === 'http://image.gamersky.com/webimg13/zhuanti/common/blank.png') {
                            item.attribs.src = item.attribs['data-origin'];
                        }
                    });
                    item.description = content.html() || item.description;
                    return item satisfies DataItem;
                }) as Promise<DataItem>
        )
    );
    return {
        title: `${idName.name} - 游民星空`,
        link: 'https://www.gamersky.com/news',
        item: fullTextList,
    };
}
