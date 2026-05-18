import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { getSearchParams, rootUrl } from './utils';

const categories = {
    watch: '看盘',
    announcement: '公司',
    explain: '解读',
    red: '加红',
    jpush: '推送',
    remind: '提醒',
    fund: '基金',
    hk: '港股',
};

const renderTelegraphDescription = (item) =>
    renderToString(
        <>
            {item.content ? <>{item.content}</> : null}
            {item.images?.length ? (
                <>
                    <br />
                    {item.images.map((image) => (
                        <img src={image} key={image} />
                    ))}
                </>
            ) : null}
        </>
    );

export const route: Route = {
    path: '/telegraph/:category?',
    categories: ['finance'],
    example: '/cls/telegraph',
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
            source: ['cls.cn/telegraph', 'cls.cn/'],
            target: '/telegraph',
        },
    ],
    name: '电报',
    maintainers: ['nczitzk'],
    handler,
    url: 'cls.cn/telegraph',
    description: `| 看盘  | 公司         | 解读    | 加红 | 推送  | 提醒   | 基金 | 港股 |
| ----- | ------------ | ------- | ---- | ----- | ------ | ---- | ---- |
| watch | announcement | explain | red  | jpush | remind | fund | hk   |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50;

    let apiUrl = `${rootUrl}/nodeapi/updateTelegraphList`;
    if (category) {
        apiUrl = `${rootUrl}/v1/roll/get_roll_list`;
    }

    const currentUrl = `${rootUrl}/telegraph`;

    const response = await got({
        method: 'get',
        url: apiUrl,
        searchParams: getSearchParams({
            category,
            hasFirstVipArticle: 1,
        }),
    });

    const items = response.data.data.roll_data.slice(0, limit).map((item) => ({
        title: item.title || item.content,
        link: item.shareurl,
        description: renderTelegraphDescription(item),
        pubDate: parseDate(item.ctime * 1000),
        category: item.subjects?.map((s) => s.subject_name),
    }));

    return {
        title: `财联社 - 电报${category === '' ? '' : ` - ${categories[category]}`}`,
        link: currentUrl,
        item: items,
    };
}
