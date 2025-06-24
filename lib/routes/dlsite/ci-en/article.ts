import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/ci-en/:id/article',
    categories: ['anime'],
    view: ViewType.Articles,
    example: '/dlsite/ci-en/7400/article',
    parameters: { id: 'Creator id, can be found in URL' },
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
            source: ['ci-en.dlsite.com/creator/:id/article/843558', 'ci-en.dlsite.com/'],
        },
    ],
    name: "Ci-en Creators' Article",
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '7400';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10;

    const rootUrl = 'https://ci-en.dlsite.com';
    const currentUrl = `${rootUrl}/creator/${id}/article?mode=list`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.c-postedArticle-info a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.article-title').remove();

                content('.file-player-image').each(function () {
                    content(this).replaceWith(`<img src="${content(this).attr('data-actual')}">`);
                });

                item.description = content('article').html();
                item.pubDate = timezone(parseDate(content('.e-date').first().text()), +9);
                item.category = content('.c-hashTagList-item')
                    .toArray()
                    .map((t) => content(t).text().split('#').pop().trim());

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
