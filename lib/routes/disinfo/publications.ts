import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/publications',
    categories: ['new-media'],
    example: '/disinfo/publications',
    parameters: {},
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
            source: ['disinfo.eu/'],
        },
    ],
    name: 'Publications',
    maintainers: ['nczitzk'],
    handler,
    url: 'disinfo.eu/',
};

async function handler() {
    const rootUrl = 'https://www.disinfo.eu';
    const currentUrl = `${rootUrl}/publications`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.elementor-heading-title a')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.wp-block-spacer').remove();
                content('.elementor-widget-container p').eq(0).remove();

                content('img').each(function () {
                    content(this).attr('src', content(this).attr('data-lazy-src'));
                });

                item.description = content('.elementor-widget-theme-post-content').html();
                item.pubDate = parseDate(content('meta[property="article:modified_time"]').attr('content'));

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
