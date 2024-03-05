// @ts-nocheck
import buildData from '@/utils/common-config';
const baseUrl = 'https://www.iiilab.com/';

export default async (ctx) => {
    const link = baseUrl;
    ctx.set(
        'data',
        await buildData({
            link,
            url: link,
            title: `%title%`,
            description: `%description%`,
            params: {
                title: '发现',
                description: '人人都是自媒体-发现',
            },
            item: {
                item: '.aw-common-list > div',
                title: `$('a').first().text()`,
                link: `$('a').first().attr('href')`,
                description: `$('.markitup-box').first().text()`,
                pubDate: `parseDate($('.text-color-999').first().text(), 'YYYY-MM-DD HH:mm')`,
                guid: Buffer.from(`$('a').attr('href')`).toString('base64'),
            },
        })
    );
};
