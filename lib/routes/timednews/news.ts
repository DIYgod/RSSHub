import { type CheerioOptions, load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const BASE = 'https://www.timednews.com/topic';

const PATH_LIST = {
    all: {
        name: '全部',
        path: 'cat/1.html',
    },
    currentAffairs: {
        name: '时政',
        path: 'subcat/1.html',
    },
    finance: {
        name: '财经',
        path: 'subcat/2.html',
    },
    technology: {
        name: '科技',
        path: 'subcat/3.html',
    },
    social: {
        name: '社会',
        path: 'subcat/4.html',
    },
    sports: {
        name: '体娱',
        path: 'subcat/5.html',
    },
    international: {
        name: '国际',
        path: 'subcat/6.html',
    },
    usa: {
        name: '美国',
        path: 'subcat/7.html',
    },
    cn: {
        name: '中国',
        path: 'subcat/8.html',
    },
    europe: {
        name: '欧洲',
        path: 'subcat/9.html',
    },
    comments: {
        name: '评论',
        path: 'subcat/14.html',
    },
};

export const route: Route = {
    path: '/news/:type?',
    categories: ['new-media'],
    example: '/timednews/news',
    parameters: { type: '子分类，见下表，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新闻',
    maintainers: ['linbuxiao'],
    handler,
    description: `子分类

| 全部 | 时政           | 财经    | 科技       | 社会   | 体娱   | 国际          | 美国 | 中国 | 欧洲   | 评论     |
| ---- | -------------- | ------- | ---------- | ------ | ------ | ------------- | ---- | ---- | ------ | -------- |
| all  | currentAffairs | finance | technology | social | sports | international | usa  | cn   | europe | comments |`,
};

async function getArticleDetails(link: string): Promise<Pick<DataItem, 'author' | 'pubDate' | 'description'>> {
    const details = await cache.tryGet(link, async () => {
        const response = await got(link);
        const $ = load(response.data, { decodeEntities: false } as CheerioOptions);
        $('.event .twitter').remove();
        const publishedDate = $('.datetime #publishdate').text();
        return {
            pubDate: publishedDate ? parseDate(`${publishedDate} +0000`, 'YYYY-MM-DD ZZ') : undefined,
            author: $('.datetime #author').text(),
            description: $('.event').html(),
        };
    });
    return { pubDate: details.pubDate, author: details.author, description: details.description };
}

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'all';
    const url = `${BASE}/${PATH_LIST[type].path}`;
    const res = await got({
        method: 'get',
        url,
    });

    const $ = load(res.data);

    const list = $('#content li')
        .toArray()
        .map((e): DataItem => {
            const c = $(e);
            return {
                title: c.find('a').text(),
                link: c.find('a').attr('href'),
            };
        });

    const items = await pMap(list, async (item) => ({ ...item, ...(await getArticleDetails(item.link!)) }), { concurrency: 3 });

    const ret = {
        title: '时刻新闻',
        link: url,
        description: `时刻新闻 ${PATH_LIST[type].name}`,
        item: items,
    };

    ctx.set('json', ret);
    return ret;
}
