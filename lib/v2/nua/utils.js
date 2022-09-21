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
                        const content = cheerio.load(result.data);
                        item.description = content(artiContent).html();
                        return item;
                    });
                case 'wechat-mp':
                    return finishArticleItem(ctx, items[0]);
                default:
                    return item;
            }
        })
    );

module.exports = {
    ProcessList,
    ProcessFeed,
};
