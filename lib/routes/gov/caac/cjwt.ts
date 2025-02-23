import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/caac/cjwt/:category?',
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
            target: '/caac/cjwt',
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
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

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

    const items = JSON.parse(response.match(/jsonp_messageBoard_getList\((.*?)\)$/)[1])
        .returnData.root.slice(0, limit)
        .map((item) => ({
            title: item.infoMess.replaceAll(/<\/?em>/g, ''),
            link: new URL(`index_180.html?info=${item.id}&type=id`, rootUrl).href,
            description: art(path.join(__dirname, 'templates/description.art'), {
                item,
            }),
            author: `${item.gname}/${item.feedbackName}`,
            category: [item.messageType],
            guid: `caac-cjwt#${item.id}`,
            pubDate: timezone(parseDate(item.createDate), +8),
            updated: timezone(parseDate(item.feedbackDate), +8),
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
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle,
        author,
        allowEmpty: true,
    };
}
