const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { finishArticleItem } = require('@/utils/wechat-mp');

const pageType = (href) => {
    if (!href.startsWith('http')) {
        return 'nua';
    }
    const url = new URL(href);
    if (url.hostname === 'mp.weixin.qq.com') {
        return 'wechat-mp';
    } else {
        return 'unkonwn';
    }
};

async function ProcessList(newsUrl, baseUrl, listName, listDate, webPageName) {
    const result = await got(newsUrl, {
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = cheerio.load(result.data);

    const pageName = $(webPageName).text();

    const items = $(listName)
        .toArray()
        .map((item) => {
            item = $(item);
            const href = $(item).find('a').attr('href');
            const type = pageType(href);

            return {
                link: type === 'nua' ? baseUrl + href : href,
                title: item.find('a').attr('title'),
                pubDate: timezone(parseDate(item.find(listDate).first().text(), 'YYYY-MM-DD'), +8),
                type,
            };
        });

    return [items, pageName];
}

const ProcessFeed = async (items, artiContent, ctx) =>
    await Promise.all(
        items.map((item) => {
            switch (item.type) {
                case 'nua':
                    return ctx.cache.tryGet(item.link, async () => {
                        const result = await got({ url: item.link, https: { rejectUnauthorized: false } });
                        const $ = cheerio.load(result.data);
                        item.author = $('.arti_publisher').text() + '  ' + $('.arti_views').text();
                        item.description = $(artiContent).html();
                        return item;
                    });
                case 'wechat-mp':
                    return finishArticleItem(ctx, items[0]);
                case 'unkonwn':
                    item.description = `暂不支持解析该文章内容，请点击 ${'阅读原文'.link(item.link)}`;
                    return item;
                default:
                    return item;
            }
        })
    );

module.exports = {
    ProcessList,
    ProcessFeed,
};
