const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'http://news.hrbeu.edu.cn';

module.exports = async (ctx) => {
    const date = new Date();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const column = ctx.params.column;
    const id = ctx.params.id || '';
    let toUrl;
    if (id !== '') {
        toUrl = rootUrl.concat('/', column, '/', id, '.htm');
    } else {
        toUrl = rootUrl.concat('/', column, '.htm');
    }

    const response = await got({
        method: 'get',
        url: toUrl,
        headers: {
            Referer: rootUrl,
        },
    });

    const $ = cheerio.load(response.data);

    const bigTitle = $('div.list-left-tt')
        .text()
        .replace(/[ ]|[\r\n]/g, '');

    const list = $('li.txt-elise')
        .map((_, item) => {
            let link = $(item).find('a').attr('href');
            if (link.indexOf('info') !== -1 && id !== '') {
                link = rootUrl.concat(link.substring(2));
            }
            if (link.indexOf('info') !== -1 && id === '') {
                link = rootUrl.concat('/', link);
            }
            return {
                title: $(item).find('a').attr('title'),
                pubDate: $(item).find('span').text() + ' ' + hour + ':' + minute,
                link,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (item.link.indexOf('info') !== -1) {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);
                    item.description = content('div.v_news_content').html();
                } else {
                    item.description = item.title + '<br><br>' + '本文需跳转，请点击标题后阅读';
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '工学-' + bigTitle,
        link: toUrl,
        item: items,
    };
};
