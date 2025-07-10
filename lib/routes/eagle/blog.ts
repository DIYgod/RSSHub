import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { isValidHost } from '@/utils/valid-host';
import InvalidParameterError from '@/errors/types/invalid-parameter';
const cateList = new Set(['all', 'design-resources', 'learn-design', 'inside-eagle']);

export const route: Route = {
    path: '/blog/:cate?/:language?',
    categories: ['blog'],
    example: '/eagle/blog/en',
    parameters: {
        cate: 'Category, get by URL, `all` by default',
        language: {
            description: 'Language',
            options: [
                { value: 'cn', label: 'cn' },
                { value: 'tw', label: 'tw' },
                { value: 'en', label: 'en' },
            ],
            default: 'en',
        },
    },
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
            source: ['cn.eagle.cool/blog'],
            target: '/blog',
        },
    ],
    name: 'Blog',
    maintainers: ['Fatpandac'],
    handler,
    url: 'cn.eagle.cool/blog',
};

async function handler(ctx) {
    let cate = ctx.req.param('cate') ?? 'all';
    let language = ctx.req.param('language') ?? 'cn';
    if (!isValidHost(cate) || !isValidHost(language)) {
        throw new InvalidParameterError('Invalid host');
    }
    if (!cateList.has(cate)) {
        language = cate;
        cate = 'all';
    }

    const host = `https://${language}.eagle.cool`;
    const url = `${host}/blog/${cate === 'all' ? '' : cate}`;

    const response = await got(url);
    const $ = load(response.data);
    const title = $('div.categories-list > div > div > div > ul > li.active').text();
    const list = $('div.post-item')
        .toArray()
        .map((item) => ({
            title: $(item).find('div.title').text(),
            link: new URL($(item).find('a').attr('href'), host).href,
            pubDate: parseDate($(item).find('div.metas > a > span').text().replace('・', '')),
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);

                const content = load(detailResponse.data);

                item.description = content('div.post-html').html();

                return item;
            })
        )
    );

    return {
        title: `eagle - ${title}`,
        link: url,
        item: items,
    };
}
