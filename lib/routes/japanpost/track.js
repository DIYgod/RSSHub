const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

let baseTitle = '日本郵便';
const baseUrl = 'https://trackings.post.japanpost.jp/services/srv/search/direct?';

utils.expandEven();
utils.expandOdd();

module.exports = async (ctx) => {
    const reqCode = ctx.params.reqCode;
    const reqReqCode = 'reqCodeNo1=' + reqCode;

    let locale = 'ja';
    if (ctx.params.locale === 'en') {
        locale = 'en';
        baseTitle = 'Japanpost';
    }
    const reqLocale = '&locale=' + locale;

    const link = baseUrl + reqReqCode + reqLocale;

    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = cheerio.load(response.data);
    const list = $('.tableType01').eq(1).find('tr').slice(2);
    const officeList = $('.tableType03').eq(0).find('tr').slice(1);

    if (!list.length) {
        const resErrorText = $('.tableType01').eq(0).find('tr').eq(2).find('td').eq(1).text().trim();
        throw new Error(resErrorText);
    }

    const listEven = list.even();
    const listOdd = list.odd();

    const packageType = $('.tableType01').eq(0).find('tr').eq(1).find('td').eq(1).text().trim();
    const packageService = $('.tableType01').eq(0).find('tr').eq(1).find('td').eq(2).text().trim();
    const serviceText = locale === 'ja' ? '付加サービス：' : 'Additional services: ';

    let lastItemTimeStamp;
    let tz;

    ctx.state.data = {
        title: `${baseTitle} ${reqCode} ${packageType}`,
        link,
        description: `${baseTitle} ${reqCode} ${packageType}`,
        language: locale,
        item: listEven
            .map((index, item) => {
                const itemTd = $(item).find('td');
                const packageStatus = itemTd.eq(1).text().trim();
                const packageRegion = itemTd.eq(4).text().trim();
                const packageOffice = itemTd.eq(3).text().trim();
                const packageOfficeZipCode = listOdd.eq(index).find('td').eq(0).text().trim();
                const itemTitle = `${packageStatus} ${packageOffice} ${packageRegion}`;
                const packageTrackRecord = itemTd.eq(2).text().trim();
                let itemDescription = `${packageStatus}<br>`;
                itemDescription += packageTrackRecord ? `${packageTrackRecord}<br>` : '';
                itemDescription += packageOfficeZipCode ? `${packageOfficeZipCode} ` : '';
                itemDescription += packageOffice ? `${packageOffice} ` : '';
                itemDescription += `${packageRegion}`;

                if (index === 0) {
                    if (officeList.length) {
                        const officeItemList = officeList
                            .map((i, e) => {
                                const eTd = $(e).find('td');
                                let officeItem = eTd.eq(0).text().trim();
                                officeItem += ` ${eTd.eq(1).html().trim()}`;
                                officeItem += ` ${eTd.eq(2).html().trim()}`;
                                return officeItem;
                            })
                            .get();
                        itemDescription += '<br>';
                        for (const i of officeItemList) {
                            itemDescription += `<br>${i}`;
                        }
                    }
                    if (packageService) {
                        itemDescription += '<br>' + serviceText + packageService;
                    }
                }

                const itemPubDateText = itemTd.eq(0).text().trim();
                const itemGuid = utils.generateGuid(reqCode + itemTitle + itemDescription + itemPubDateText);

                let thisItemTimeStamp;
                [thisItemTimeStamp, tz] = utils.parseDatetime(itemPubDateText, packageOffice, packageRegion, tz, locale);
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
                    link,
                    guid: itemGuid.slice(0, 32),
                };
            })
            .get(),
    };
};
