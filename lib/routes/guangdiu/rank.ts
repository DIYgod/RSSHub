// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseRelativeDate } from '@/utils/parse-date';

const host = 'https://guangdiu.com';

export default async (ctx) => {
    const url = `${host}/rank.php`;

    const response = await got(url);
    const $ = load(response.data);
    const list = $('div.hourrankitem')
        .map((_index, item) => ({
            title: $(item).find('a.hourranktitle').text(),
            link: new URL($(item).find('a.hourranktitle').attr('href'), host).href,
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $ = load(detailResponse.data);

                item.description = $('#dabstract').html() + $('a.dgotobutton').html('前往购买');
                item.pubDate = parseRelativeDate($('div.hourranktime').text());

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `逛丢 - 一小时风云榜`,
        link: url,
        item: items,
    });
};
