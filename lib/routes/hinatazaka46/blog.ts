import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.hinatazaka46.com';

export const route: Route = {
    path: '/blog/:id?/:page?',
    categories: ['traditional-media'],
    example: '/hinatazaka46/blog',
    parameters: { id: 'Member ID, see below, `all` by default', page: 'Page, `0` by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Hinatazaka46 Blog 日向坂 46 博客',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? 'all';
    const page = ctx.req.param('page') ?? '0';

    const params = id === 'all' ? `?page=${page}` : `?page=${page}&ct=${id}`;
    const currentUrl = `${rootUrl}/s/official/diary/member/list${params}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);
    const items = $('div.p-blog-group .p-blog-article')
        .toArray()
        .map((item) => {
            const content = load(item);

            return {
                title: content('.c-blog-article__title').text(),
                link: content('.c-button-blog-detail').attr('href'),
                pubDate: parseDate(content('.c-blog-article__date').text()),
                author: content('.c-blog-article__name').text(),
                description: content('.c-blog-article__text').html(),
            };
        });

    return {
        allowEmpty: true,
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
