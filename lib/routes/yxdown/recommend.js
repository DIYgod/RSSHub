import got from '~/utils/got.js';
import cheerio from 'cheerio';
import timezone from '~/utils/timezone';
import {parseDate} from '~/utils/parse-date.js';

export default async (ctx) => {
    const rootUrl = 'http://www.yxdown.com';
    const currentUrl = `${rootUrl}/news`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('ul li a b')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.parent().attr('href'),
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

                content('h1, .intro').remove();

                item.description = content('.news').html();
                item.pubDate = timezone(parseDate(content('meta[property="og:release_date"]').attr('content')), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '精彩推荐 - 游讯网',
        link: currentUrl,
        item: items,
    };
};
