const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const rootUrl = 'http://news.hrbeu.edu.cn';

module.exports = async (ctx) => {
    const column = ctx.params.column;
    const id = ctx.params.id || '';
    let toUrl;
    if (id !== '') {
        toUrl = `${rootUrl}/${column}/${id}.htm`;
    } else {
        toUrl = `${rootUrl}/${column}.htm`;
    }

    const response = await got(toUrl, {
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
            if (link.includes('info') && id !== '') {
                link = new URL(link, rootUrl).href;
            }
            if (link.includes('info') && id === '') {
                link = `${rootUrl}/${link}`;
            }
            return {
                title: $(item).find('a').attr('title'),
                pubDate: parseDate($(item).find('span').text()),
                link,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (item.link.includes('info')) {
                    const detailResponse = await got(item.link);
                    const content = cheerio.load(detailResponse.data);
                    item.description = content('div.v_news_content').html();
                } else {
                    item.description = '本文需跳转，请点击标题后阅读';
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
