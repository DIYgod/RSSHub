import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:category{.+}?',
    categories: ['traditional-media'],
    example: '/koreaherald/National',
    parameters: {
        category: 'Category from the path of the URL of the corresponding site, `National` by default',
    },
    features: {
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        requireConfig: false,
    },
    name: 'News',
    maintainers: ['quiniapiezoelectricity'],
    handler,
    description: `
::: tip
For example, the category for the page https://www.koreaherald.com/Business and https://www.koreaherald.com/Business/Market would be \`/Business\` and \`/Business/Market\` respectively. 
:::
`,
    radar: [
        {
            source: ['www.koreaherald.com/:category'],
            target: '/:category',
        },
    ],
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'National';
    const baseUrl = 'https://www.koreaherald.com/';

    const response = await got(new URL(category, baseUrl).href);
    const $ = load(response.data);
    const title = $('ul.gnb').find('[class="on"]').length > 0 ? $('ul.gnb').find('[class="on"]').text() : $('div.nav_area > a.category').text();
    const list = $('article.recent_news > ul.news_list > li')
        .toArray()
        .map((item) => new URL($(item).find('a').attr('href'), baseUrl).href);
    const items = await Promise.all(
        list.map((url) =>
            cache.tryGet(url, async () => {
                const response = await got(url);
                const $ = load(response.data);
                const metadata = JSON.parse($('[type="application/ld+json"]').text());
                return {
                    title: metadata.headline,
                    link: url,
                    pubDate: timezone(parseDate(metadata.datePublished), +9),
                    author: metadata.author.name,
                    description: $('article.article-body').html(),
                };
            })
        )
    );
    return {
        title: `The Korea Herald - ${title}`,
        link: new URL(category, baseUrl).href,
        item: items,
    };
}
