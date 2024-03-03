// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const baseUrl = 'https://announce.dol.go.th';
    const { owner, province, office } = ctx.req.param();
    const queryParams = {
        searchprovince: '',
        searchoffice: '',
        searchtype: '',
        searchconcerned: owner ?? '',
    };

    const result = {
        title: `ประกาศสำนักงานที่ดิน${province ? 'จังหวัด' + province + ' ' : ''}${office ? 'สำนักงานที่ดิน' + office : ''}${owner ? 'ชื่อผู้ถือกรรมสิทธิ/ผู้ขอ ' + owner : ''}`,
        link: `${baseUrl}/index.php`,
        item: [],
    };

    // If office/province provided, fetch index page to lookup province/office code
    if (province || office) {
        const { data: response } = await got(`${baseUrl}/index.php`);
        const $ = load(response);

        if (province) {
            const slcProvince = $(`select#searchprovince option:contains('${province}')`);

            if (!slcProvince.length) {
                ctx.set('data', result);
                return;
            }

            queryParams.searchprovince = slcProvince.attr('value');
        }

        if (office) {
            const slcOffice = $(`select#searchoffice option:contains('${office}')`);

            if (!slcOffice.length) {
                ctx.set('data', result);
                return;
            }

            queryParams.searchoffice = slcOffice.attr('value');
        }
    }

    result.link = `${baseUrl}/index.php?${new URLSearchParams(queryParams).toString()}`;

    const { data: response } = await got(result.link, {
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = load(response);

    result.item = $('div#div table tbody tr:not([class])')
        .toArray()
        .map((item) => {
            item = $(item);
            /** @type cheerio.Cheerio<th>[] */
            const [, topic, requester, reqType, anceBegDate, anceEndDate, officeName, anceFile] = item
                .find('th')
                .toArray()
                .map((item) => $(item));
            const dateList = anceBegDate.text().split('-');
            return {
                title: `${topic.text()} (ผู้ถือกรรมสิทธิ/ผู้ขอ ${requester.text()})`,
                // Template text from Form ท.ด.๒๕
                description: `ประกาศ${officeName.text()} เรื่อง${topic.text()}
                    ด้วย ${requester.text()} ได้ยื่นเรื่องราว ${reqType.text()}
                    จึงขอประกาศให้ทราบทั่วกัน ถ้าผู้ใดจะคัดค้านประการใด ให้ยื่นคำคัดค้านต่อพนักงานเจ้าหน้าที่ ภายใน ${anceEndDate.text()}
                    ประกาศ ณ วันที่ ${anceBegDate.text()}
                `,
                link: `${baseUrl}/${anceFile.find('a').attr('href')}`,
                pubDate: timezone(
                    new Date(
                        // The date is in Buddish year
                        Number.parseInt(dateList[2]) - 543,
                        Number.parseInt(dateList[1]) - 1,
                        Number.parseInt(dateList[0])
                    ),
                    +7
                ),
                author: officeName.text(),
                category: [reqType.text()],
            };
        });

    ctx.set('data', result);
};
