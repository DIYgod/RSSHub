import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import CaptchaError from '@/errors/types/captcha';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';
import { isOnSite } from '@/utils/valid-host';

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

function isVerificationPage(data?: string) {
    if (typeof data !== 'string') {
        return false;
    }

    const $ = load(data);
    return /^\s*check\(\)\s*;?$/.test($('body').attr('onload') ?? '') && $('input[name="parm_0"]').length > 0 && $('input[name="parm_1"]').length > 0;
}

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

    if (isVerificationPage(response.data)) {
        throw new CaptchaError('Zhitong Caijing returned a browser verification page; article data is unavailable.');
    }
    const data = response.data;
    if (data.status !== 'success') {
        throw new TypeError('Zhitong Caijing did not return a successful article list.');
    }

    const list: Array<DataItem & { link: string }> = data.data.slice(0, limit).map((item) => ({
        title: item.title,
        link: new URL(item.url, rootUrl).href,
        description: item.digest,
        author: item.author_info.author_name,
        pubDate: parseDate((item.create_time ?? Number.parseInt(item.original_time)) * 1000),
        category: [...(item.keywords?.split(',') ?? []), item.category_name ?? item.type_tag],
    }));

    const items = await pMap(
        list,
        async (item) => {
            // only follow links on the site itself
            if (!isOnSite(item.link, 'zhitongcaijing.com')) {
                return item;
            }
            const detail = await cache.tryGet(`zhitongcaijing:article:v1:${item.link}`, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                content('#subscribe-vip-box').remove();
                content('#news-content').remove();

                const main = content('.news-body-content');
                const article = main.length ? main : content('.telegram-origin-contentn').first();
                const digest = content('.digetst-box').html();
                const description = article.html();
                const body = renderToString(
                    <>
                        {digest ? raw(digest) : null}
                        {description ? raw(description) : null}
                    </>
                );

                return { description: body };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: `智通财经 - ${ids[id].title}`,
        link: currentUrl,
        item: items,
    };
}
