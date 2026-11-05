import { load } from 'cheerio';

import type { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const parseItem = async (item): Promise<DataItem> => {
    const response = await ofetch(item.link);
    const $ = load(response);
    const ldJson = JSON.parse($('script[type="application/ld+json"]').text());

    $('.article-ad, #strategy-rules-player-wrapper, [data-module-name="newsletter-article-sign-up-module"], div.flex.flex-col.gap-2').remove();
    const cover = $('.article-content-wrapper figure');
    cover.find('img').attr('src', cover.find('img').attr('url')?.split('?', 1)[0]);
    cover.find('img').removeAttr('style srcset url');

    const categories = item.categories?.map((category) => (typeof category === 'string' ? category : category._)).filter(Boolean);

    return {
        title: item.title || ldJson.headline,
        link: item.link,
        guid: item.guid,
        description:
            cover.parent().html() +
            $('.document-body')
                .toArray()
                .map((item) => $(item).html())
                .join(''),
        pubDate: parseDate(ldJson.datePublished),
        author: ldJson.author.map((author) => ({ name: author.name })),
        image: ldJson.image?.url?.split('?', 1)[0],
        category: categories?.length ? categories : [ldJson.articleSection, ldJson.keywords].flat().filter(Boolean),
    };
};
