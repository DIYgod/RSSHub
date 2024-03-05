// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

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

export default async (ctx) => {
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

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    digest: content('.digetst-box').html() || content('.telegram-origin-contentn').html(),
                    description: content('.news-body-content').html(),
                });

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `智通财经 - ${ids[id].title}`,
        link: currentUrl,
        item: items,
    });
};
