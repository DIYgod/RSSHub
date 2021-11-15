import got from '~/utils/got.js';
import cheerio from 'cheerio';
import timezone from '~/utils/timezone';
import {parseDate} from '~/utils/parse-date.js';

export default async (ctx) => {
    const rootUrl = 'https://database.caixin.com';
    const currentUrl = `${rootUrl}/news`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('h4 a')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                item.pubDate = timezone(parseDate(content('#pubtime_baidu').text()), +8);
                item.description = `<p>${content('#subhead').html()}</p>`;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '财新数据通 - 专享资讯',
        link: currentUrl,
        item: items,
    };
};
