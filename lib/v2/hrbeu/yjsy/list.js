const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const rootUrl = 'http://yjsy.hrbeu.edu.cn';

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got(`${rootUrl}/${id}/list.htm`, {
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
            if (link.includes('page.htm')) {
                link = `${rootUrl}${link}`;
            }
            return {
                title: $(item).find('a').attr('title'),
                pubDate: parseDate($(item).find('span.Article_PublishDate').text()),
                link,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (item.link.includes('page.htm')) {
                    const detailResponse = await got(item.link);
                    const content = cheerio.load(detailResponse.data);
                    item.description = content('div.wp_articlecontent').html();
                } else {
                    item.description = '本文需跳转，请点击标题后阅读';
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '研究生院-' + bigTitle,
        link: rootUrl.concat('/', id, '/list.htm'),
        item: items,
    };
};
