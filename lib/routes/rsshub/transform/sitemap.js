import got from '@/utils/got';
import { load } from 'cheerio';
import { config } from '@/config';

export default async (ctx) => {
    if (!config.feature.allow_user_supply_unsafe_domain) {
        throw new Error(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
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
            ? urls
                  .map((item) => {
                      try {
                          const title = $(item).find('loc').text() || '';
                          const link = $(item).find('loc').text() || '';
                          const description = $(item).find('loc').text() || '';
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
                  .filter(Boolean)
            : [];

    ctx.set('data', {
        title: rssTitle,
        link: url,
        description: `Proxy ${url}`,
        item: items,
    });
};
