import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/cjwt/:category?',
    categories: ['government'],
    example: '/gov/caac/cjwt',
    parameters: { category: '分类，见下表，默认为全部' },
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
            source: ['caac.gov.cn/HDJL/'],
            target: '/cjwt',
        },
    ],
    name: '公众留言',
    maintainers: ['nczitzk'],
    handler,
    url: 'caac.gov.cn/HDJL/',
    description: `| 机票 | 托运 | 无人机 | 体检 | 行政审批 | 投诉 |
| ---- | ---- | ------ | ---- | -------- | ---- |`,
};

async function handler(ctx) {
    const { category = '' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 30);

    const rootUrl = 'https://www.caac.gov.cn';
    const apiUrl = new URL(`caacgov/jsonp/messageBoard/visit/get${category ? 'CJWT' : ''}List`, rootUrl).href;
    const currentUrl = new URL('HDJL/', rootUrl).href;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            callbackparam: 'jsonp_messageBoard_getList',
            infoMess: category,
            pageIndex: 1,
        },
    });

    const items = parseMessageList(response)
        .slice(0, limit)
        .map((item) => ({
            title: item.infoMess.replaceAll(/<\/?em>/g, ''),
            link: new URL(`index_180.html?info=${item.id}&type=id`, rootUrl).href,
            description: renderDescription(item),
            author: [item.gname, item.feedbackName].filter(Boolean).join('/') || undefined,
            category: [item.messageType].filter(Boolean),
            guid: `caac-cjwt#${item.id}`,
            pubDate: item.createDate ? timezone(parseDate(item.createDate), 8) : undefined,
            updated: item.feedbackDate ? timezone(parseDate(item.feedbackDate), 8) : undefined,
        }));

    const author = '中国民用航空局';
    const image = new URL('images/Logo2.png', rootUrl).href;
    const icon = new URL('images/weixinLogo.jpg', rootUrl).href;
    const subtitle = '公众留言';

    return {
        item: items,
        title: [author, subtitle, category].filter(Boolean).join(' - '),
        link: currentUrl,
        description: '向公众提供服务和开展互动交流',
        language: 'zh' as const,
        image,
        icon,
        logo: icon,
        subtitle,
        author,
    };
}

const renderDescription = (item): string => renderToString(<div>{item.feedback ? raw(item.feedback) : null}</div>);

function parseMessageList(response: string | { returnData?: { root?: unknown[] }; message?: string; returnMsg?: string }) {
    const result = typeof response === 'string' ? JSON.parse(response.match(/^jsonp_messageBoard_getList\((.*)\);?$/s)?.[1] ?? response) : response;
    if (!Array.isArray(result.returnData?.root)) {
        throw new TypeError(`CAAC message board is unavailable: ${result.message || result.returnMsg || 'the source did not return a message list'}`);
    }
    return result.returnData.root;
}
