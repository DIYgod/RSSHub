import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

export const route: Route = {
    path: '/earthquake',
    name: 'hko earthquake',
    maintainers: ['after9'],
    handler,
    example: '/hko/earthquake',
    categories: ['forecast'],
    description: `来自香港天文台的全球5级以上地震记录`,
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
                pubDate: formatDate(hktDate + hktTime),
            };
        });

    return {
        title,
        link,
        description,
        item: items,
    };
}

function formatDate(timeString) {
    // 解析字符串获取年、月、日、小时和分钟
    const year = Number.parseInt(timeString.slice(0, 4), 10);
    const month = Number.parseInt(timeString.slice(4, 6), 10) - 1; // 月份从 0 开始
    const day = Number.parseInt(timeString.slice(6, 8), 10);
    const hours = Number.parseInt(timeString.slice(8, 10), 10);
    const minutes = Number.parseInt(timeString.slice(10, 12), 10);

    // 创建一个香港时区的日期对象
    const hongKongDate = new Date(Date.UTC(year, month, day, hours - 8, minutes)); // 香港时区为 UTC+8

    // 转换为 GMT 格式
    const gmtString = hongKongDate.toUTCString();
    return gmtString;
}
