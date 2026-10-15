import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function extractPublicationText(value: string): string | undefined {
    for (const marker of value.matchAll(/时间：/g)) {
        const tail = value.slice(marker.index + marker[0].length).trimStart();
        const sourceIndex = tail.indexOf('来源：');
        const candidate = (sourceIndex === -1 ? tail : tail.slice(0, sourceIndex)).trimEnd();
        if (!/[\r\n\u{2028}\u{2029}]/u.test(candidate)) {
            return candidate;
        }
    }
}

export const route: Route = {
    path: '/:type',
    categories: ['government'],
    example: '/gov/mva/bnxx',
    parameters: {
        type: '分类名',
    },
    name: '资讯',
    maintainers: ['sunshinenny'],
    handler,
    description: `| 部内信息 | 政策解读 |
| :------: | :------: |
|   bnxx   |   zcjd   |`,
};

function loadDetail(link: string) {
    return cache.tryGet(link, async (): Promise<DataItem> => {
        const response = await ofetch(link);
        const $ = load(response);
        const title = $('#main > div.outerlayer > div > div > h2 > p').text();
        const introduce = $('#div_zhengwen > div').html();
        const info = $('#main > div.outerlayer > div > div > div.article-info').contents().first().text();
        const dateTime = extractPublicationText(info);

        return {
            title,
            description: introduce,
            link,
            pubDate: dateTime ? timezone(parseDate(dateTime, ['YYYY年M月D日 HH:mm:ss', 'YYYY年M月D日 HH:mm']), 8) : undefined,
            author: info.match(/来源：\s*(.*)/)?.[1],
        };
    });
}

const pages = {
    bnxx: 'https://www.mva.gov.cn/sy/xx/bnxx/',
    zcjd: 'https://www.mva.gov.cn/jiedu/zcjd/',
};

async function handler(ctx: Context) {
    const { type } = ctx.req.param();
    if (!Object.hasOwn(pages, type)) {
        throw new InvalidParameterError('Invalid category. Use bnxx for ministry news or zcjd for policy interpretations.');
    }
    const checkType = {
        bnxx: '部内信息',
        zcjd: '政策解读',
    };
    const page = pages[type];
    const response = await ofetch(page);

    const $ = load(response);
    const list = $('#main > div.overview.container.clearfix > div.overview-right.fr > div > div.public_list_team > ul > li  > a').toArray();

    const items = await Promise.all(
        list.map(async (item) => {
            const itemUrl = new URL($(item).attr('href')!, page).href;
            const other = await loadDetail(itemUrl);
            return {
                link: itemUrl,
                guid: itemUrl,
                ...other,
                title: other.title || $(item).text(),
            };
        })
    );

    return {
        title: `中华人民共和国退役军人事务部 - ${checkType[type]}`,
        link: page,
        description: `中华人民共和国退役军人事务部 - ${checkType[type]} 更新提示`,
        item: items,
    };
}
