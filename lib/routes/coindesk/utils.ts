import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const parseItem = async (item) => {
    const response = await ofetch(item.link);
    const $ = load(response);
    const ldJson = JSON.parse($('script[type="application/ld+json"]').text());

    $('.article-ad, #strategy-rules-player-wrapper, [data-module-name="newsletter-article-sign-up-module"], div.flex.flex-col.gap-2').remove();
    const cover = $('.article-content-wrapper figure');
    cover.find('img').attr('src', cover.find('img').attr('url')?.split('?')[0]);
    cover.find('img').removeAttr('style srcset url');

    item.description =
        cover.parent().html() +
        $('.document-body')
            .toArray()
            .map((item) => $(item).html())
            .join('');
    item.pubDate = parseDate(ldJson.datePublished);
    item.author = ldJson.author.map((a) => ({ name: a.name }));
    item.image = ldJson.image.url.split('?')[0];

    return item;
};
