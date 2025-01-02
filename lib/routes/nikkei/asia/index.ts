import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/asia',
    categories: ['traditional-media'],
    example: '/nikkei/asia',
    radar: [
        {
            source: ['asia.nikkei.com/'],
        },
    ],
    name: 'Nikkei Asia Latest News',
    maintainers: ['rainrdx'],
    handler,
    url: 'asia.nikkei.com',
};

async function handler() {
    const currentUrl = 'https://main-asianreview-nikkei.content.pugpig.com/editionfeed/4519/pugpig_atom_contents.json';

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const stories = response.data.stories.filter((story) => story.type === 'article');

    const items = await Promise.all(
        stories.map((item) =>
            cache.tryGet(item.url, async () => {
                const fulltext = await got({
                    method: 'get',
                    url: `https://main-asianreview-nikkei.content.pugpig.com/editionfeed/4519/${item.url}`,
                });

                item.pubDate = parseDate(item.published);
                item.link = item.shareurl;
                item.category = item.section;

                const fulltextcontent = load(fulltext.data);
                fulltextcontent('.pp-header-group__headline, .lightbox__control, .o-ads, #AdAsia').remove();
                fulltextcontent('img').each((_, img) => {
                    if (img.attribs.full) {
                        img.attribs.src = img.attribs.full;
                        delete img.attribs.full;
                    }
                });
                item.description =
                    fulltextcontent('section[class="pp-article__header"]')
                        .html()
                        .replaceAll(/(?:\.{2}\/){4}/g, 'https://main-asianreview-nikkei.content.pugpig.com/') +
                    fulltextcontent('section[class="pp-article__body"]')
                        .html()
                        .replaceAll(/(?:\.{2}\/){4}/g, 'https://main-asianreview-nikkei.content.pugpig.com/');
                return item;
            })
        )
    );

    return {
        title: 'Nikkei Asia',
        link: 'https://asia.nikkei.com',
        image: 'https://main-asianreview-nikkei.content.pugpig.com/pugpig_assets/admin/pub120x120.jpg',
        item: items,
    };
}
