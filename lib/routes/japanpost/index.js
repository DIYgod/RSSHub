const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

let baseTitle = '日本郵便';
const baseUrl = 'https://trackings.post.japanpost.jp/services/srv/search/direct?';

const util = new utils();
util.expandEven();

module.exports = async (ctx) => {
    const reqCode = ctx.params.reqCode;
    const reqReqCode = 'reqCodeNo1=' + reqCode;

    let locale;
    switch (ctx.params.locale) {
        case 'ja':
            locale = 'ja';
            break;
        case 'en':
            locale = 'en';
            baseTitle = 'Japanpost';
            break;
        default:
            locale = 'ja';
    }
    const reqLocale = '&locale=' + locale;

    const link = baseUrl + reqReqCode + reqLocale;

    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = cheerio.load(response.data);
    const list = $('.tableType01').eq(1).find('tr').slice(2);

    if (!list.length) {
        const resErrorText = $('.tableType01').eq(0).find('tr').eq(2).find('td').eq(1).text();
        throw new Error(resErrorText);
    }

    const listEven = list.even();

    const packageType = $('.tableType01').eq(0).find('tr').eq(1).find('td').eq(1).text();

    let lastItemTimeStamp;

    ctx.state.data = {
        title: `${baseTitle} ${packageType} ${reqCode}`,
        link: link,
        description: `${baseTitle} ${packageType} ${reqCode}`,
        item: listEven
            .map((index, item) => {
                item = $(item);
                const itemTd = item.find('td');
                const packageStatus = itemTd.eq(1).text().trim();
                const packageRegion = itemTd.eq(4).text().trim();
                const packageOffice = itemTd.eq(3).text().trim();
                const itemTitle = `${packageStatus} ${packageRegion} ${packageOffice}`;
                const itemDescription = itemTd.eq(2).text();
                const itemPubDateText = itemTd.eq(0).text();
                const itemGuid = util.generateGuid(itemTitle + itemDescription + itemPubDateText);

                let thisItemTimeStamp = new Date(itemPubDateText).getTime();
                if (lastItemTimeStamp) {
                    if (thisItemTimeStamp <= lastItemTimeStamp) {
                        thisItemTimeStamp = lastItemTimeStamp + 1000;
                    }
                }
                lastItemTimeStamp = thisItemTimeStamp;

                return {
                    title: itemTitle,
                    description: itemDescription,
                    pubDate: new Date(thisItemTimeStamp),
                    link: link,
                    guid: itemGuid.slice(0, 32),
                };
            })
            .get(),
    };
};
