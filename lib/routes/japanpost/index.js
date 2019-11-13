const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

const baseTitle = '日本郵便';
const baseUrl = 'https://trackings.post.japanpost.jp/services/srv/search/direct?locale=ja&reqCodeNo1=';

const util = new utils();
util.expandEven();
util.expandReverse();

module.exports = async (ctx) => {
    const reqCode = ctx.params.reqCode;
    const link = baseUrl + reqCode;

    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = cheerio.load(response.data);
    const list = $('.tableType01')
        .eq(1)
        .find('tr')
        .slice(2);

    const listEven = list.even();

    const packageType = $('.tableType01')
        .eq(0)
        .find('tr')
        .eq(1)
        .find('td')
        .eq(1)
        .text();

    ctx.state.data = {
        title: `${baseTitle} ${packageType} ${reqCode}`,
        link: link,
        description: 'Reserved for further development.',
        item: listEven
            .reverse()
            .map((index, item) => {
                item = $(item);
                const itemTd = item.find('td');
                const itemTitle =
                    itemTd
                        .eq(1)
                        .text()
                        .trim() +
                    '  ' +
                    itemTd
                        .eq(4)
                        .text()
                        .trim() +
                    '  ' +
                    itemTd
                        .eq(3)
                        .text()
                        .trim();
                const itemDescription = itemTd.eq(2).text();
                const itemPubDateText = itemTd.eq(0).text();
                const itemGuid = util.generateGuid(itemTitle + itemDescription + itemPubDateText);
                return {
                    title: itemTitle,
                    description: itemDescription,
                    pubDate: new Date(itemPubDateText),
                    link: link,
                    guid: itemGuid.slice(0, 32),
                };
            })
            .get(),
    };
};
