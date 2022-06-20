const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'http://uae.hrbeu.edu.cn';

module.exports = async (ctx) => {
    const date = new Date();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const id = ctx.params.id;

    const response = await got({
        method: 'get',
        url: rootUrl.concat('/', id, '/list.htm'),
        headers: {
            Referer: rootUrl,
        },
    });

    const $ = cheerio.load(response.data);

    const bigTitle = $('h2.column-title').text();

    const list = $('a.column-news-item')
        .map((_, item) => {
            let link = $(item).attr('href');
            if (link.indexOf('page.htm') !== -1) {
                link = rootUrl.concat(link);
            }
            return {
                title: $(item).find('span.column-news-title').text(),
                pubDate: $(item).find('span.column-news-date').text() + ' ' + hour + ':' + minute,
                link,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (item.link.indexOf('page.htm') !== -1) {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);
                    item.description = content('div.wp_articlecontent').html();
                    item.title = content('h1.arti-title').text();
                } else {
                    item.description = item.title + '<br><br>' + '本文需跳转，请点击标题后阅读';
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '水声学院-' + bigTitle,
        link: rootUrl.concat('/', id, '/list.htm'),
        item: items,
    };
};
