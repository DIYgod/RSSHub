import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const utils = async (ctx, currentUrl) => {
    const rootUrl = 'https://www.sobooks.net';
    currentUrl = `${rootUrl}/${currentUrl}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.card-item h3 a')
        .slice(0, 15)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                content('.e-secret, .article-social').remove();

                item.description = content('.article-content').html();
                item.pubDate = parseDate(content('.bookinfo ul li').eq(4).text().replace('时间：', ''));

                return item;
            })
        )
    );

    return {
        title: ($('.archive-header h1').text() ? $('.archive-header h1').text() + ' - ' : '') + 'SoBooks',
        link: currentUrl,
        item: items,
    };
};
export default utils;
