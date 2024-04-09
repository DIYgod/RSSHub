const got = require('@/utils/got');
const { art } = require('@/utils/render');
const cheerio = require('cheerio');
const path = require('path');
const utils = require('./utils');

let baseTitle = '日本郵便';
const baseUrl = 'https://trackings.post.japanpost.jp/services/srv/search/direct?';

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
    utils.expandEven($);
    utils.expandOdd($);

    const list = $('.tableType01').eq(1).find('tr').slice(2);
    const officeList = $('.tableType03').eq(0).find('tr').slice(1);
    let officeItemList;

    if (officeList.length) {
        officeItemList = officeList
            .map((i, e) => {
                const eTd = $(e).find('td');
                return {
                    officeType: eTd.eq(0).text().trim(),
                    officeName: eTd.eq(1).html().trim(),
                    officeTel: eTd.eq(2).html().trim(),
                };
            })
            .get();
    }

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
        icon: 'https://www.post.japanpost.jp/favicon.ico',
        logo: 'https://www.post.japanpost.jp/favicon.ico',
        item: listEven
            .map((index, item) => {
                const itemTd = $(item).find('td');
                const packageStatus = itemTd.eq(1).text().trim();
                const packageRegion = itemTd.eq(4).text().trim();
                const packageOffice = itemTd.eq(3).text().trim();
                const packageOfficeZipCode = listOdd.eq(index).find('td').eq(0).text().trim();
                const itemTitle = `${packageStatus} ${packageOffice} ${packageRegion}`;
                const packageTrackRecord = itemTd.eq(2).text().trim();
                const itemDescription = art(path.join(__dirname, 'templates/track_item_desc.art'), {
                    packageStatus,
                    packageTrackRecord,
                    packageOfficeZipCode,
                    packageOffice,
                    packageRegion,
                    index,
                    officeItemList,
                    serviceText,
                    packageService,
                });

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
