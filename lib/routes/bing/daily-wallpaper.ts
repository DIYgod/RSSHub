import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import dayjs from 'dayjs';

export const route: Route = {
    path: '/',
    radar: [
        {
            source: ['cn.bing.com/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: ['FHYunCai'],
    handler,
    url: 'cn.bing.com/',
};

async function handler(ctx) {
    const response = await ofetch('HPImageArchive.aspx', {
        baseURL: 'https://cn.bing.com',
        query: {
            format: 'js',
            idx: 0,
            n: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 7,
            mkt: 'zh-CN',
        },
    });
    const data = response;
    return {
        title: 'Bing每日壁纸',
        link: 'https://cn.bing.com/',
        item: data.images.map((item) => ({
            title: item.copyright,
            description: `<img src="https://cn.bing.com${item.url}">`,
            link: item.copyrightlink,
            pubDate: dayjs(item.startdate),
        })),
    };
}
