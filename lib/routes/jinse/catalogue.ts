// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

const categories = {
    zhengce: '政策',
    fenxishishuo: '行情',
    defi: 'DeFi',
    kuang: '矿业',
    '以太坊2.0': '以太坊 2.0',
    industry: '产业',
    IPFS: 'IPFS',
    tech: '技术',
    baike: '百科',
    capitalmarket: '研报',
};

export default async (ctx) => {
    const { category = 'zhengce' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const rootUrl = 'https://www.jinse.cn';
    const rootApiUrl = 'https://api.jinse.cn';
    const apiUrl = new URL('v6/www/information/list', rootApiUrl).href;
    const currentUrl = rootUrl;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            catelogue_key: category,
            limit,
            flag: 'up',
        },
    });

    let items = response.list.slice(0, limit).map((item) => ({
        title: item.title,
        link: item.extra.topic_url,
        description: art(path.join(__dirname, 'templates/description.art'), {
            images:
                item.extra.thumbnails_pics.length > 0
                    ? item.extra.thumbnails_pics.map((p) => ({
                          src: p.replace(/_[^\W_]+(\.\w+)$/, '_true$1'),
                      }))
                    : undefined,
            intro: item.extra.summary,
        }),
        author: item.extra.nickname,
        guid: `jinse${/\/lives\//.test(item.extra.topic_url) ? '-lives' : ''}-${item.extra.topic_id}`,
        pubDate: parseDate(item.extra.published_at, 'X'),
        upvotes: item.extra.up_counts ?? 0,
        downvotes: item.extra.down_counts ?? 0,
        comments: item.extra.comment_count ?? 0,
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (/\/lives\//.test(item.link)) {
                    return item;
                }

                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.description += art(path.join(__dirname, 'templates/description.art'), {
                    description: content('section.js-article-content').html() || content('div.js-article').html(),
                });
                item.category = content('section.js-article-tag_state_1 a span')
                    .toArray()
                    .map((c) => content(c).text());

                return item;
            })
        )
    );

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const author = $('meta[name="author"]').prop('content');
    const image = $('a.js-logoBox img').prop('src');
    const icon = new URL($('link[rel="favicon"]').prop('href'), rootUrl).href;

    ctx.set('data', {
        item: items,
        title: `${author} - ${Object.hasOwn(categories, category) ? categories[category] : category}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: $('html').prop('lang'),
        image,
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content'),
        author,
        allowEmpty: true,
    });
};
