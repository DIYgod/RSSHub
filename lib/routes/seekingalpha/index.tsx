import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://seekingalpha.com';

export const route: Route = {
    path: '/:symbol/:category?',
    categories: ['finance'],
    example: '/seekingalpha/TSM/transcripts',
    parameters: { symbol: 'Stock symbol', category: 'Category, see below, `news` by default' },
    features: {
        antiCrawler: true,
    },
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

const apiParams = {
    article: {
        slug: '/articles',
        include: 'author,primaryTickers,secondaryTickers,otherTags,presentations,presentations.slides,author.authorResearch,author.userBioTags,co_authors,promotedService,sentiments',
    },
    news: {
        slug: '/news',
        include: 'author,primaryTickers,secondaryTickers,otherTags',
    },
    pr: {
        slug: '/press_releases',
        include: 'acquireService,primaryTickers',
    },
};

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
            'page[size]': ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : category === 'news' ? 40 : 20,
            'page[number]': 1,
        },
    });

    const list = response.data?.map((item) => ({
        title: item.attributes.title,
        link: new URL(item.links.self, baseUrl).href,
        pubDate: parseDate(item.attributes.publishOn),
        author: response.included.find((i) => i.id === item.relationships.author.data.id).attributes.nick,
        id: item.id,
        articleType: item.links.self.split('/')[1],
    }));

    const items = list
        ? await Promise.all(
              list.map((item) =>
                  cache.tryGet(item.link, async () => {
                      const response = await ofetch(`${baseUrl}/api/v3${apiParams[item.articleType].slug}/${item.id}`, {
                          headers: {
                              cookie: machineCookie.join('; '),
                          },
                          query: {
                              include: apiParams[item.articleType].include,
                          },
                      });

                      item.category = response.included.filter((i) => i.type === 'tag').map((i) => (i.attributes.company ? `${i.attributes.company} (${i.attributes.name})` : i.attributes.name));
                      const summary = response.data.attributes.summary;
                      const summaryDescription = summary?.length
                          ? renderToString(
                                <>
                                    <h2>Summary</h2>
                                    <ul>
                                        {summary.map((entry) => (
                                            <li>{entry}</li>
                                        ))}
                                    </ul>
                                </>
                            )
                          : '';
                      item.description = summaryDescription + response.data.attributes.content;
                      item.updated = parseDate(response.data.attributes.lastModified);

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
