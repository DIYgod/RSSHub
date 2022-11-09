const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { finishArticleItem } = require('@/utils/wechat-mp');
const rootUrl = 'http://uae.hrbeu.edu.cn';

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got(`${rootUrl}/${id}/list.htm`, {
        headers: {
            Referer: rootUrl,
        },
    });

    const $ = cheerio.load(response.data);

    const bigTitle = $('h2.column-title').text();

    const list = $('a.column-news-item')
        .map((_, item) => {
            let link = $(item).attr('href');
            if (link.includes('page.htm')) {
                link = `${rootUrl}${link}`;
            }
            return {
                title: $(item).find('span.column-news-title').text(),
                pubDate: parseDate($(item).find('span.column-news-date').text()),
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
                    item.title = content('h1.arti-title').text();
                } else if (new URL(item.link).hostname === 'mp.weixin.qq.com') {
                    await finishArticleItem(ctx, item);
                } else {
                    item.description = '本文需跳转，请点击标题后阅读';
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '水声学院-' + bigTitle,
        link: `${rootUrl}/${id}/list.htm`,
        item: items,
    };
};
