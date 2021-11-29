const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'http://yjsy.hrbeu.edu.cn';

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

    const bigTitle = $('div [id=lanmuInnerMiddleBigClass_right]')
        .find('div [portletmode=simpleColumnAttri]')
        .text()
        .replace(/[ ]|[\r\n\t]|[·]/g, '')
        .trim();

    const list = $('li.list_item')
        .map((_, item) => {
            let link = $(item).find('a').attr('href');
            if (link.indexOf('page.htm') !== -1) {
                link = rootUrl.concat(link);
            }
            return {
                title: $(item).find('a').attr('title'),
                pubDate: $(item).find('span.Article_PublishDate').text() + ' ' + hour + ':' + minute,
                link,
            };
        })
        .get();

    await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (item.link.indexOf('page.htm') !== -1) {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);
                    item.description = content('div.wp_articlecontent').html();
                } else {
                    item.description = item.title + '<br><br>' + '本文需跳转，请点击标题后阅读';
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '研究生院-' + bigTitle,
        link: rootUrl.concat('/', id, '/list.htm'),
        item: list,
    };
};
