import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/xianmian',
    categories: ['program-update'],
    example: '/appstore/xianmian',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['app.so/xianmian'],
        },
    ],
    name: '每日精品限免 / 促销应用（鲜面连线 by AppSo）',
    maintainers: ['Andiedie'],
    handler,
    url: 'app.so/xianmian',
};

async function handler() {
    const {
        data: { objects: data },
    } = await got.get('https://app.so/api/v5/appso/discount/?platform=web&limit=10');

    return {
        title: '每日精品限免 / 促销应用',
        link: 'http://app.so/xianmian/',
        description: '鲜面连线 by AppSo：每日精品限免 / 促销应用',
        item: data.map((item) => ({
            title: `「${item.discount_info[0].discounted_price === '0.00' ? '免费' : '降价'}」${item.app.name}`,
            description: `
          <img src="${item.app.icon.image}"/>
          <br/>
          原价：¥${item.discount_info[0].original_price} -> 现价：¥${item.discount_info[0].discounted_price}
          <br/>
          平台：${item.app.download_link[0].device}
          <br/>
          ${item.content}
        `,
            pubDate: parseDate(item.updated_at * 1000),
            link: item.app.download_link[0].link,
        })),
    };
}
