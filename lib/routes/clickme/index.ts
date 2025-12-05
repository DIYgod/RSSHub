import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:site/:grouping/:name',
    categories: ['other'],
    example: '/clickme/default/category/beauty',
    parameters: { site: '站点，`default`为普通站，`r18`为成人站，其它值默认为普通站', grouping: '分组方式，`category`为分类，`tag`为标签，其他值默认为分类', name: '分类名或标签名，分类名为英文，可以在分类 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '文章',
    maintainers: ['hoilc'],
    handler,
};

async function handler(ctx) {
    const site = ctx.req.param('site') === 'r18' ? 'r18' : '';
    const grouping = ctx.req.param('grouping') === 'tag' ? 'tag' : 'category';
    const name = ctx.req.param('name');

    const url = `https://${site ? 'r18.' : ''}clickme.net/${grouping.slice(0, 1)}/${encodeURIComponent(name)}`;

    const { data: response } = await got.post('https://api.clickme.net/article/list', {
        headers: {
            Referer: url,
        },
        searchParams: {
            key: 'clickme',
        },
        form: {
            articleType: site ? 'r18' : 'article',
            subtype: grouping,
            subtypeSlug: name,
            device: '',
            limit: 18,
            page: 1,
        },
    });

    const category_name = name === 'new' ? '最新' : response.data.items[0].categoryName[0].name;
    const displayed_name = grouping === 'tag' ? name : category_name;

    const list = response.data.items.map((item) => ({
        title: item.title,
        link: item.url.replace('http://', 'https://'),
        author: item.userNick,
        pubDate: parseDate(item.date, 'X'),
        category: [...item.categoryName.map((item) => item.name), ...item.tags],
    }));

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data } = await got.get(item.link);
                const $ = load(data);
                item.description = $('.article-detail-content').html();
                return item;
            })
        )
    );

    return {
        title: `ClickMe ${site ? 'R18 ' : ''}- ${displayed_name}`,
        link: url,
        item: out,
    };
}
