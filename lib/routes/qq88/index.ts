import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const category = ctx.req.param('category') ?? '';

    const rootUrl = 'https://qq88.info';
    const currentUrl = category ? `${rootUrl}/?cat=${category}` : rootUrl;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.entry-title a')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
                pubDate: parseDate(item.parent().next().find('.mh-meta-date').eq(-1).text().split('：')[1]),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                const links = content('.entry-content').find('a[download]');

                item.enclosure_type = 'video/mp4';
                item.enclosure_url = links.eq(-1).attr('href');
                item.description = `<video controls><source src="${item.enclosure_url}"></video><br>`;

                links.each(function () {
                    item.description += `<li><a href="${content(this).attr('href')}">${content(this).text()}</a></li>`;
                });

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${$('.page-title').text() || '首页'} - 秋爸日字`,
        link: currentUrl,
        item: items,
    });
};
