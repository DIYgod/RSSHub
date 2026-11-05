import { load } from 'cheerio';

import type { DataItem } from '@/types';
import got from '@/utils/got';

export async function getFullText(item: DataItem & { link: string }) {
    if (item.link.startsWith('https://www.youtube.com/')) {
        return item;
    }

    const detailResponse = await got({
        method: 'get',
        url: item.link,
    });
    const content = load(detailResponse.data);
    content('div.SubscriptionInner').remove();
    content('.gmailNews').remove();

    // Those boxes are for explaining terms. They are injected inline and interrupt reading.
    // If readers want to learn about terms, they can learn more online.
    content('.dictionary-box').remove();
    // Those are for "延伸閱讀" links, which are not part of the main article.
    content('.moreArticle').remove();
    content('.lineAd, .advertiseInArticlePad').remove();
    content('.articlekeywordGroup').remove();

    const topImage = content('.fullPic').html();
    const authors = [
        ...new Set(
            content('.paragraph a.author')
                .toArray()
                .map((author) => content(author).text())
        ),
    ];

    item.description = (topImage === null ? '' : topImage) + content('.paragraph').eq(0).html();
    item.author = authors.length ? authors.join(', ') : undefined;
    item.category = [
        ...content("meta[property='article:tag']")
            .toArray()
            .map((e) => e.attribs.content),
        content('.active > a').text(),
    ];

    return item;
}
