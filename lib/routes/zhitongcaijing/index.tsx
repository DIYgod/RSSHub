import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const ids = {
    recommend: {
        url: 'content/recommend',
        title: '推荐',
    },
    hkstock: {
        url: 'content/hkstock',
        title: '港股',
    },
    meigu: {
        url: 'content/meigu',
        title: '美股',
    },
    agu: {
        url: 'content/agu',
        title: '沪深',
    },
    ct: {
        url: 'content/ct',
        title: '创投',
    },
    esg: {
        url: 'content/esg',
        title: 'ESG',
    },
    aqs: {
        url: 'content/aqs',
        title: '券商',
    },
    ajj: {
        url: 'content/ajj',
        title: '基金',
    },
    focus: {
        url: 'focus',
        title: '要闻',
    },
    announcement: {
        url: 'announcement',
        title: '公告',
    },
    research: {
        url: 'research',
        title: '研究',
    },
    shares: {
        url: 'shares',
        title: '新股',
    },
    bazaar: {
        url: 'bazaar',
        title: '市场',
    },
    company: {
        url: 'company',
        title: '公司',
    },
};

export const route: Route = {
    path: '/:id?/:category?',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/zhitongcaijing',
    parameters: { id: '栏目 id，可在对应栏目页 URL 中找到，默认为 recommend，即推荐', category: '分类 id，可在对应栏目子分类页 URL 中找到，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '推荐',
    maintainers: ['nczitzk'],
    handler,
    description: `| id           | 栏目 |
| ------------ | ---- |
| recommend    | 推荐 |
| hkstock      | 港股 |
| meigu        | 美股 |
| agu          | 沪深 |
| ct           | 创投 |
| esg          | ESG  |
| aqs          | 券商 |
| ajj          | 基金 |
| focus        | 要闻 |
| announcement | 公告 |
| research     | 研究 |
| shares       | 新股 |
| bazaar       | 市场 |
| company      | 公司 |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? 'recommend';
    const category = ctx.req.param('category') ?? '';

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;

    const rootUrl = 'https://www.zhitongcaijing.com';
    const currentUrl = `${rootUrl}/${ids[id].url}.html${category === '' ? '' : `?category_key=${category}`}`;
    const apiUrl = `${rootUrl}/${ids[id].url}.html?data_type=1&page=1${category === '' ? '' : `&category_key=${category}`}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items = response.data.data.slice(0, limit).map((item) => ({
        title: item.title,
        link: `${rootUrl}${item.url}`,
        description: item.digest,
        author: item.author_info.author_name,
        pubDate: parseDate((item.create_time ?? Number.parseInt(item.original_time)) * 1000),
        category: [...(item.keywords?.split(',') ?? []), item.category_name ?? item.type_tag],
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('#subscribe-vip-box').remove();
                content('#news-content').remove();

                const digest = content('.digetst-box').html() || content('.telegram-origin-contentn').html();
                const description = content('.news-body-content').html();
                item.description = renderToString(
                    <>
                        {digest ? raw(digest) : null}
                        {description ? raw(description) : null}
                    </>
                );

                return item;
            })
        )
    );

    return {
        title: `智通财经 - ${ids[id].title}`,
        link: currentUrl,
        item: items,
    };
}
