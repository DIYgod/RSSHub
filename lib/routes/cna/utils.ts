import got from '@/utils/got';
import { load } from 'cheerio';

export async function getFullText(item) {
    const detailResponse = await got({
        method: 'get',
        url: item.link,
    });
    const content = load(detailResponse.data);
    content('div.SubscriptionInner').remove();
    content('.gmailNews').remove();
    const topImage = content('.fullPic').html();

    item.description = (topImage === null ? '' : topImage) + content('.paragraph').eq(0).html();
    item.category = [
        ...content("meta[property='article:tag']")
            .toArray()
            .map((e) => e.attribs.content),
        content('.active > a').text(),
    ];

    return item;
}
