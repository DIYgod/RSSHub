import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/earthquake',
    name: '全球地震資訊網',
    maintainers: ['after9'],
    handler,
    example: '/hko/earthquake',
    categories: ['forecast'],
    description: '来自香港天文台的全球5级以上地震记录',
};

async function handler() {
    const title = '来自香港天文台的全球5级以上地震记录';
    const link = 'https://www.hko.gov.hk/tc/gts/equake/quake-info.htm';
    const description = '提供經天文台分析的全球5.0級或以上及本地有感的地震資訊。';

    // 发送 HTTP GET 请求到 API 并解构返回的数据对象
    const response = await ofetch('https://www.hko.gov.hk/gts/QEM/eq_app-30d_uc.xml', {
        headers: {
            accept: 'application/xml',
        },
    });

    const $ = load(response);

    const items = $('Earthquake > EventGroup > Event')
        // 使用“toArray()”方法将选择的所有 DOM 元素以数组的形式返回。
        .toArray()
        // 使用“map()”方法遍历数组，并从每个元素中解析需要的数据。
        .map((item) => {
            item = $(item);
            const degree = item.find('Mag').text();
            const city = item.find('City').text();
            const citystring = item.find('citystring').text();
            const hktDate = item.find('HKTDate').text();
            const hktTime = item.find('HKTTime').text();
            const latAndLon = '經緯:[' + item.find('Lat').text() + ',' + item.find('Lon').text() + ']';
            return {
                title: `[震級:${degree}] [地點:${city}]`,
                description: `${citystring}, ${latAndLon}`,
                pubDate: timezone(parseDate(hktDate + hktTime, 'YYYYMMDDHHmm'), +8),
            };
        });

    return {
        title,
        link,
        description,
        item: items,
    };
}
