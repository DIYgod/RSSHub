import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        category = 'dnzszc'
    } = ctx.params;

    const rootUrl = 'https://gaokao.chsi.com.cn';
    const currentUrl = `${rootUrl}/gkxx/zszcgd/${category}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.list ul li a')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            const link = item.attr('href');

            return {
                title: item.text(),
                pubDate: new Date(item.prev().text()).toUTCString(),
                link: link.indexOf('http') < 0 ? `${rootUrl}${link}` : link,
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

                item.description = content('.list').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('.backb').text()} - 教育部阳光高考信息公开平台`,
        link: currentUrl,
        item: items,
    };
};
