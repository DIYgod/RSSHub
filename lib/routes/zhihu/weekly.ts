// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';

const host = 'https://www.zhihu.com';

export default async (ctx) => {
    const link = 'https://www.zhihu.com/pub/weekly';
    const response = await got(link);
    const $ = load(response.data);

    const description = $('p.Weekly-description').text();
    const out = $('div.Card-section.PubBookListItem')
        .slice(0, 10)
        .map(function () {
            const info = {
                title: $(this).find('span.PubBookListItem-title').text(),
                link: new URL($(this).find('a.PubBookListItem-buttonWrapper').attr('href'), host).href,
                description: $(this).find('div.PubBookListItem-description').text(),
                author: $(this).find('span.PubBookListItem-author').text(),
            };
            return info;
        })
        .get();

    ctx.set('data', {
        title: '知乎周刊',
        link,
        description,
        item: out,
    });
};
