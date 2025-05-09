import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://wallhaven.cc';

export const route: Route = {
    path: ['/search/:filter?/:needDetails?', '/:filter?/:needDetails?'],
    categories: ['picture'],
    example: '/wallhaven/search/categories=110&purity=110&sorting=date_added&order=desc',
    parameters: { filter: 'Filter, empty by default', needDetails: 'Need Details, `true`/`yes` as yes, no by default' },
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
            source: ['wallhaven.cc/'],
        },
    ],
    name: 'Search',
    maintainers: ['nczitzk', 'Fatpandac'],
    handler,
    url: 'wallhaven.cc/',
    description: `::: tip
  Subscribe pages starting with \`https://wallhaven.cc/search\`, fill the text after \`?\` as \`filter\` in the route. The following is an example:

  The text after \`?\` is \`q=id%3A711&sorting=random&ref=fp&seed=8g0dgd\` for [Wallpaper Search: #landscape - wallhaven.cc](https://wallhaven.cc/search?q=id%3A711\&sorting=random\&ref=fp\&seed=8g0dgd), so the route is [/wallhaven/q=id%3A711\&sorting=random\&ref=fp\&seed=8g0dgd](https://rsshub.app/wallhaven/q=id%3A711\&sorting=random\&ref=fp\&seed=8g0dgd)
:::`,
};

async function handler(ctx) {
    const filter = ctx.req.param('filter') ?? 'latest';
    const needDetails = /t|y/i.test(ctx.req.param('needDetails') ?? 'false');
    const url = `${rootUrl}/${filter.indexOf('=') > 0 ? `search?${filter.replaceAll(/page=\d+/g, 'page=1')}` : filter}`;

    const response = await got.get(url);
    const $ = load(response.data);

    let items = $('li > figure.thumb')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 24)
        .toArray()
        .map((item) => ({
            title: $(item).find('img.lazyload').attr('data-src').split('/').pop(),
            description: $(item)
                .html()
                .match(/<img.*?>/)[0],
            link: $(item).find('a.preview').attr('href'),
        }));
    if (needDetails) {
        items = await Promise.all(
            items.map((item) =>
                cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(detailResponse.data);

                    item.title = content('meta[name="title"]').attr('content');
                    item.author = content('.username').text();
                    item.pubDate = parseDate(content('time').attr('datetime'));
                    item.category = content('.tagname')
                        .toArray()
                        .map((tag) => content(tag).text());
                    item.description = content('div.scrollbox').html();

                    return item;
                })
            )
        );
    }

    return {
        title: $('title').text(),
        link: url,
        item: items,
    };
}
