import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import dayjs from 'dayjs';
const baseUrl = 'https://seekingalpha.com';

export const route: Route = {
    path: '/:symbol/:category?',
    categories: ['finance'],
    example: '/seekingalpha/TSM/transcripts',
    parameters: { symbol: 'Stock symbol', category: 'Category, see below, `news` by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['seekingalpha.com/symbol/:symbol/:category', 'seekingalpha.com/symbol/:symbol/earnings/:category'],
        target: '/:symbol/:category',
    },
    name: 'Summary',
    maintainers: ['TonyRL'],
    handler,
    description: `| Analysis | News | Transcripts | Press Releases | Related Analysis |
  | -------- | ---- | ----------- | -------------- | ---------------- |
  | analysis | news | transcripts | press-releases | related-analysis |`,
};

async function handler(ctx) {
    const { category = 'news', symbol } = ctx.req.param();
    const pageUrl = `${baseUrl}/symbol/${symbol.toUpperCase()}/${category === 'transcripts' ? `earnings/${category}` : category}`;

    const response = await got(`${baseUrl}/api/v3/symbols/${symbol.toUpperCase()}/${category}`, {
        searchParams: {
            cacheBuster: category === 'news' ? dayjs().format('YYYY-MM-DD') : undefined,
            id: symbol.toLowerCase(),
            include: 'author,primaryTickers,secondaryTickers,sentiments',
            'page[size]': ctx.req.query('limit') ? Number(ctx.req.query('limit')) : category === 'news' ? 40 : 20,
        },
    });

    const list = response.data.data?.map((item) => ({
        title: item.attributes.title,
        link: new URL(item.links.self, baseUrl).href,
        pubDate: parseDate(item.attributes.publishOn),
        author: response.data.included.find((i) => i.id === item.relationships.author.data.id).attributes.nick,
    }));

    const items = list
        ? await Promise.all(
              list.map((item) =>
                  cache.tryGet(item.link, async () => {
                      const response = await got(item.link);
                      const $ = load(response.data);

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
        title: response.data.meta.page.title,
        description: response.data.meta.page.description,
        link: pageUrl,
        image: 'https://seekingalpha.com/samw/static/images/favicon.svg',
        item: items,
        allowEmpty: true,
        language: 'en-US',
    };
}
