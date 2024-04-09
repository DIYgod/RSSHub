import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const baseUrl = 'https://seekingalpha.com';

export const route: Route = {
    path: '/:symbol/:category?',
    categories: ['finance'],
    example: '/seekingalpha/TSM/transcripts',
    parameters: { symbol: 'Stock symbol', category: 'Category, see below, `news` by default' },
    radar: [
        {
            source: ['seekingalpha.com/symbol/:symbol/:category', 'seekingalpha.com/symbol/:symbol/earnings/:category'],
            target: '/:symbol/:category',
        },
    ],
    name: 'Summary',
    maintainers: ['TonyRL'],
    handler,
    description: `| Analysis | News | Transcripts | Press Releases | Related Analysis |
  | -------- | ---- | ----------- | -------------- | ---------------- |
  | analysis | news | transcripts | press-releases | related-analysis |`,
};

const getMachineCookie = () =>
    cache.tryGet('seekingalpha:machine_cookie', async () => {
        const response = await ofetch.raw(baseUrl);
        return response.headers.getSetCookie().map((c) => c.split(';')[0]);
    });

async function handler(ctx) {
    const { category = 'news', symbol } = ctx.req.param();
    const pageUrl = `${baseUrl}/symbol/${symbol.toUpperCase()}/${category === 'transcripts' ? `earnings/${category}` : category}`;

    const machineCookie = await getMachineCookie();
    const response = await ofetch(`${baseUrl}/api/v3/symbols/${symbol.toUpperCase()}/${category}`, {
        headers: {
            cookie: machineCookie.join('; '),
        },
        query: {
            'filter[since]': 0,
            'filter[until]': 0,
            id: symbol.toLowerCase(),
            include: 'author,primaryTickers,secondaryTickers,sentiments',
            'page[size]': ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 40,
            'page[number]': 1,
        },
    });

    const list = response.data?.map((item) => ({
        title: item.attributes.title,
        link: new URL(item.links.self, baseUrl).href,
        pubDate: parseDate(item.attributes.publishOn),
        author: response.included.find((i) => i.id === item.relationships.author.data.id).attributes.nick,
    }));

    const items = list
        ? await Promise.all(
              list.map((item) =>
                  cache.tryGet(item.link, async () => {
                      const response = await ofetch(item.link);
                      const $ = load(response);

                      const summary = $('[data-test-id=article-summary-title]').length ? $('[data-test-id=article-summary-title]').html() + $('[data-test-id=article-summary-title]').next().html() : '';

                      item.category = $('div[data-test-id=themes-list] a')
                          .toArray()
                          .map((c) => $(c).text());
                      item.description = summary + $('div.paywall-full-content').html();

                      return item;
                  })
              )
          )
        : [];

    return {
        title: response.meta.page.title,
        description: response.meta.page.description,
        link: pageUrl,
        image: 'https://seekingalpha.com/samw/static/images/favicon.svg',
        item: items,
        allowEmpty: true,
        language: 'en-US',
    };
}
