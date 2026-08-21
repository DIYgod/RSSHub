import { load } from 'cheerio';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { DataItem, Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/transform/sitemap/:url/:routeParams?',
    categories: ['other'],
    example: '/rsshub/transform/sitemap/https%3A%2F%2Fwww.sitemaps.org%2Fsitemap.xml',
    parameters: { url: '`encodeURIComponent`ed URL address', routeParams: 'Transformation rules, requires URL encode' },
    features: {
        requireConfig: [
            {
                name: 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN',
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Transformation - Sitemap',
    maintainers: ['flrngel'],
    description: `Specify options (in the format of query string) in parameter \`routeParams\` parameter to extract data from Sitemap. (Follows Sitemap Protocol 0.9)

| Key     | Meaning              | Accepted Values | Default                          |
| ------- | -------------------- | --------------- | -------------------------------- |
| \`title\` | The title of the RSS | \`string\`        | The first \`<loc>\` in the sitemap |`,
    handler,
};

async function handler(ctx) {
    if (!config.feature.allow_user_supply_unsafe_domain) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }
    const url = ctx.req.param('url');
    const response = await got({
        method: 'get',
        url,
    });

    const routeParams = new URLSearchParams(ctx.req.param('routeParams'));
    const $ = load(response.data, { xmlMode: true });

    const rssTitle = routeParams.get('title') || ($('urlset url').length && $('urlset url').first().find('loc').text() ? $('urlset url').first().find('loc').text() : 'Sitemap');

    const urls = $('urlset url').toArray();
    const items =
        urls && urls.length
            ? (urls
                  .map((item) => {
                      try {
                          const title = $(item).find('loc').text();
                          const link = $(item).find('loc').text();
                          const description = $(item).find('loc').text();
                          const pubDate = $(item).find('lastmod').text() || undefined;

                          return {
                              title,
                              link,
                              description,
                              pubDate,
                          };
                      } catch {
                          return null;
                      }
                  })
                  .filter(Boolean) as DataItem[])
            : [];

    return {
        title: rssTitle,
        link: url,
        description: `Proxy ${url}`,
        item: items,
    };
}
