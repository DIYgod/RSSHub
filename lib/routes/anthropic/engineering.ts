import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import { Route } from '@/types';
import pMap from 'p-map';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/engineering',
    categories: ['programming'],
    example: '/anthropic/engineering',
    radar: [
        {
            source: ['www.anthropic.com/engineering', 'www.anthropic.com'],
        },
    ],
    name: 'Engineering',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.anthropic.com/engineering',
};

async function handler() {
    const baseUrl = 'https://www.anthropic.com';
    const link = `${baseUrl}/engineering`;
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('a[class^="ArticleList_cardLink__"]')
        .toArray()
        .map((element) => {
            const $e = $(element);
            return {
                title: $e.find('h2, h3').text().trim(),
                link: `${baseUrl}${$e.attr('href')}`,
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                const content = $('div[class^="Body_body__"]');
                content.find('img').each((_, e) => {
                    const $e = $(e);
                    $e.removeAttr('style srcset');
                    const src = $e.attr('src');
                    const params = new URLSearchParams(src);
                    const newSrc = params.get('/_next/image?url');
                    if (newSrc) {
                        $e.attr('src', newSrc);
                    }
                });

                item.pubDate = parseDate($('p[class*="HeroEngineering_date__"]').text().trim().replaceAll('Published ', ''));
                item.description = content.html();

                return item;
            }),
        { concurrency: 5 }
    );

    return {
        title: 'Anthropic Engineering',
        link,
        image: `${baseUrl}/images/icons/apple-touch-icon.png`,
        item: items,
    };
}
