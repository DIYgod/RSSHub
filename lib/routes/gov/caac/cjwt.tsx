import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
            description: renderDescription(item),
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

const renderDescription = (item): string =>
    renderToString(
        <div>
            <dl>
                <dt>
                    <label>【{item.messageType}】</label>
                    <span>{item.workUnit}</span>
                    <span>{item.gname}</span>
                    <span>{item.createDate}</span>
                </dt>
                <dd style="margin-top:10px; color:#EF7321;">
                    <p style="text-indent:1em;">{item.infoMess ? raw(item.infoMess) : null}</p>
                </dd>
                <dt width="140px">
                    <label>【回复】</label>
                    <span>{item.feedbackName}</span>
                    <span>{item.feedbackDate}</span>
                </dt>
                <dd>
                    <p style="text-indent:1em;">{item.feedback ? raw(item.feedback) : null}</p>
                </dd>
            </dl>
        </div>
    );
