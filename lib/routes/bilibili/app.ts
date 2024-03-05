// @ts-nocheck
import got from '@/utils/got';

const config = {
    android: '安卓版',
    iphone: 'iPhone 版',
    ipad: 'iPad HD 版',
    win: 'UWP 版',
    android_tv_yst: 'TV 版',
};

export default async (ctx) => {
    const id = ctx.req.param('id') || 'android';

    const rootUrl = 'https://app.bilibili.com';
    const apiUrl = `${rootUrl}/x/v2/version?mobi_app=${id}`;
    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.data.map((item) => ({
        link: rootUrl,
        title: item.version,
        pubDate: new Date(item.ptime * 1000).toUTCString(),
        description: `<li>${item.desc.split('\n-').join('</li><li>-')}</li>`,
    }));

    ctx.set('data', {
        title: `哔哩哔哩更新情报 - ${config[id]}`,
        link: rootUrl,
        item: items,
    });
};
