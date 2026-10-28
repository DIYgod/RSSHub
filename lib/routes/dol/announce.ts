import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/announce/:owner?/:province?/:office?',
    categories: ['government'],
    example: '/dol/announce',
    parameters: {
        owner: 'Requester/former land owner. Use _ to omit it when selecting a province or office.',
        province: 'Province which the land belongs to. Use _ to omit it when selecting an office.',
        office: 'DOL office name which the land belongs to (สำนักงานที่ดิน(กรุงเทพมหานคร|จังหวัด*) [สาขา*])',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'e-LandsAnnouncement',
    maintainers: ['itpcc'],
    handler,
};

async function handler(ctx) {
    const baseUrl = 'http://announce.dol.go.th';
    const { owner: ownerParam, province: provinceParam, office: officeParam } = ctx.req.param();
    const owner = ownerParam === '_' ? undefined : ownerParam;
    const province = provinceParam === '_' ? undefined : provinceParam;
    const office = officeParam === '_' ? undefined : officeParam;
    const queryParams = {
        searchprovince: '',
        searchoffice: '',
        searchtype: '',
        searchconcerned: owner ?? '',
    };

    const result: Data = {
        title: `ประกาศสำนักงานที่ดิน${province ? 'จังหวัด' + province + ' ' : ''}${office ? 'สำนักงานที่ดิน' + office : ''}${owner ? 'ชื่อผู้ถือกรรมสิทธิ/ผู้ขอ ' + owner : ''}`,
        link: `${baseUrl}/index.php`,
        language: 'th',
        item: [],
    };

    // If office/province provided, fetch index page to lookup province/office code
    if (province || office) {
        const { data: response } = await got(`${baseUrl}/index.php`);
        const $ = load(response);

        if (province) {
            const slcProvince = $('select#searchprovince option').filter((_, option) => $(option).text().includes(province));

            if (!slcProvince.length) {
                throw new InvalidParameterError(`Unknown province: ${province}. Use a province name listed on ${baseUrl}/index.php.`);
            }

            queryParams.searchprovince = slcProvince.attr('value')!;
        }

        if (office) {
            const slcOffice = $('select#searchoffice option').filter((_, option) => $(option).text().includes(office));

            if (!slcOffice.length) {
                throw new InvalidParameterError(`Unknown office: ${office}. Use a land office name listed on ${baseUrl}/index.php.`);
            }

            queryParams.searchoffice = slcOffice.attr('value')!;
        }
    }

    result.link = `${baseUrl}/index.php?${new URLSearchParams(queryParams).toString()}`;

    const { data: response } = await got(result.link);
    const $ = load(response);

    result.item = $('div#div table tbody tr:not([class])')
        .toArray()
        .map((item) => {
            const $item = $(item);
            /** @type cheerio.Cheerio<th>[] */
            const [, topic, requester, reqType, anceBegDate, anceEndDate, officeName, anceFile] = $item
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
                // Convert the source's Buddhist calendar year to the Gregorian year.
                pubDate: timezone(parseDate(`${Number.parseInt(dateList[2]) - 543}-${dateList[1]}-${dateList[0]}`, 'YYYY-MM-DD'), 7),
                author: officeName.text(),
                category: [reqType.text()],
            };
        });

    return result;
}
