import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/news/:lang/:category',
    categories: ['traditional-media'],
    example: '/rthk/news/hk/international',
    parameters: { lang: 'Language，Traditional Chinese`hk`，English`en`', category: 'Category' },
    name: 'News',
    maintainers: ['KeiLongW'],
    description: `RTHK offical provides full text RSS, check the offical website for detail information: <https://news.rthk.hk/rthk/en/rss.htm>

This route adds the missing photo and Link element. (Offical RSS doesn't have Link element may cause issue on some RSS client)

| local      | greaterchina       | international | finance      | sport      |
| ---------- | ------------------ | ------------- | ------------ | ---------- |
| Local News | Greater China News | World News    | Finance News | Sport News |`,
    handler,
};

async function handler(ctx: Context) {
    const params = ctx.req.param();
    let category = params.category.toLowerCase();
    const language = params.lang.toLowerCase();
    const languageUrlKey = language === 'en' ? 'e' : 'c';
    if (languageUrlKey !== 'c' || category !== 'greaterchina') {
        category = languageUrlKey + category;
    }
    const rssUrl = `https://rthk.hk/rthk/news/rss/${languageUrlKey}_expressnews_${category}.xml`;
    const feed = await parser.parseURL(rssUrl);

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.guid!, async () => {
                const response = await ofetch(item.guid!);
                const $ = load(response);

                const media = $('div.itemSlideShow li')
                    .toArray()
                    .map((li) => {
                        const $li = $(li);
                        const img = $li.find('img.imgPhotoAfterLoad');
                        if (img.length) {
                            const caption = $li.find('.detailNewsSlideTitleText').text();
                            return `<figure><img src="${img.attr('src')}" alt="${img.attr('alt') ?? ''}">${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
                        }
                        const script = $li.find('script').text();
                        const videoFile = script.match(/videoFile\s*=\s*'([^']+)'/)?.[1];
                        if (videoFile) {
                            const poster = script.match(/videoThumbnail\s*=\s*'([^']+)'/)?.[1];
                            return `<video controls preload="metadata" src="${videoFile}"${poster ? ` poster="${poster}"` : ''}></video>`;
                        }
                        return '';
                    })
                    .join('');

                return {
                    title: item.title ?? '',
                    description: media + item.content!.replaceAll('\r\n', '<br>'),
                    pubDate: item.pubDate,
                    link: item.guid,
                    category: [language === 'en' ? 'Latest News' : '即時新聞', response.match(/class="pathway">([^'<]+)<\/a>/)?.[1]].filter((c) => c !== undefined),
                };
            })
        )
    );

    return {
        title: feed.title ?? 'RTHK News',
        link: feed.link,
        description: feed.description,
        item: items,
    };
}
