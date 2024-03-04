// @ts-nocheck
import got from '@/utils/got';

export default async (ctx) => {
    const response = await got({
        method: 'get',
        prefixUrl: 'https://cn.bing.com',
        url: 'HPImageArchive.aspx',
        searchParams: {
            format: 'js',
            idx: 0,
            n: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 7,
            mkt: 'zh-CN',
        },
    });
    const data = response.data;
    ctx.set('data', {
        title: 'Bing每日壁纸',
        link: 'https://cn.bing.com/',
        item: data.images.map((item) => ({
            title: item.copyright,
            description: `<img src="https://cn.bing.com${item.url}">`,
            link: item.copyrightlink,
        })),
    });
};
