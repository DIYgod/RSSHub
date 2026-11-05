import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Language } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import utils from './utils';

const baseUrl = 'https://trackings.post.japanpost.jp/services/srv/search/direct?';

export async function track(ctx) {
    const reqCode = ctx.req.param('reqCode');

    const locale: Language = ctx.req.param('locale') === 'en' ? 'en' : 'ja';
    const baseTitle = locale === 'en' ? 'Japanpost' : '日本郵便';
    const url = new URL(baseUrl);
    url.searchParams.set('reqCodeNo1', reqCode);
    url.searchParams.set('locale', locale);
    const link = url.href;

    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = load(response.data);

    const list = $('.tableType01').eq(1).find('tr').slice(2);
    const officeList = $('.tableType03').eq(0).find('tr').slice(1);
    let officeItemList;

    if (officeList.length) {
        officeItemList = officeList.toArray().map((e) => {
            const eTd = $(e).find('td');
            return {
                officeType: eTd.eq(0).text().trim(),
                officeName: eTd.eq(1).html()!.trim(),
                officeTel: eTd.eq(2).html()!.trim(),
            };
        });
    }

    if (!list.length) {
        const resErrorText = $('.tableType01').eq(0).find('tr').eq(2).find('td').eq(1).text().trim();
        throw new Error(resErrorText);
    }

    const listEven = utils.even(list);
    const listOdd = utils.odd(list);

    const packageType = $('.tableType01').eq(0).find('tr').eq(1).find('td').eq(1).text().trim();
    const packageService = $('.tableType01').eq(0).find('tr').eq(1).find('td').eq(2).text().trim();
    const serviceText = locale === 'ja' ? '付加サービス：' : 'Additional services: ';

    let tz;

    return {
        title: `${baseTitle} ${reqCode} ${packageType}`,
        link,
        description: `${baseTitle} ${reqCode} ${packageType}`,
        language: locale,
        icon: 'https://www.post.japanpost.jp/favicon.ico',
        logo: 'https://www.post.japanpost.jp/favicon.ico',
        item: listEven.toArray().map((item, index) => {
            const itemTd = $(item).find('td');
            const packageStatus = itemTd.eq(1).text().trim();
            const packageRegion = itemTd.eq(4).text().trim();
            const packageOffice = itemTd.eq(3).text().trim();
            const packageOfficeZipCode = listOdd.eq(index).find('td').eq(0).text().trim();
            const itemTitle = `${packageStatus} ${packageOffice} ${packageRegion}`;
            const packageTrackRecord = itemTd.eq(2).text().trim();
            const itemDescription = renderToString(
                <>
                    {packageStatus}
                    <br />
                    {packageTrackRecord ? (
                        <>
                            {packageTrackRecord}
                            <br />
                        </>
                    ) : null}
                    {packageOfficeZipCode ? `${packageOfficeZipCode} ` : ''}
                    {packageOffice ? `${packageOffice} ` : ''}
                    {packageRegion}
                    {index === 0 ? (
                        <>
                            {officeItemList?.length ? (
                                <>
                                    <br />
                                    {officeItemList.map((officeItem) => (
                                        <>
                                            <br />
                                            {officeItem.officeType} {raw(officeItem.officeName)} {officeItem.officeTel}
                                        </>
                                    ))}
                                </>
                            ) : null}
                            {packageService ? (
                                <>
                                    <br />
                                    {serviceText}
                                    {packageService}
                                </>
                            ) : null}
                        </>
                    ) : null}
                </>
            );

            const itemPubDateText = itemTd.eq(0).text().trim();
            const itemGuid = utils.generateGuid(reqCode + itemTitle + itemDescription + itemPubDateText);

            let thisItemTimestamp;
            [thisItemTimestamp, tz] = utils.parseDatetime(itemPubDateText, packageOffice, packageRegion, tz, locale);
            return {
                title: itemTitle,
                description: itemDescription,
                pubDate: Number.isFinite(thisItemTimestamp) ? parseDate(thisItemTimestamp) : undefined,
                link,
                guid: itemGuid.slice(0, 32),
            };
        }),
    };
}
