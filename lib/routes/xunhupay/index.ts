// @ts-nocheck
import buildData from '@/utils/common-config';
const baseUrl = 'https://www.xunhupay.com';

export default async (ctx) => {
    const link = `${baseUrl}/blog.html`;
    ctx.set(
        'data',
        await buildData({
            link,
            url: link,
            title: `%title%`,
            description: `%description%`,
            params: {
                title: '博客',
                description: '虎皮椒-博客',
            },
            item: {
                item: '.blog-post > article',
                title: `$('h5').text()`,
                link: `$('a').attr('href')`,
                description: `$('.content').text()`,
                pubDate: `parseDate($('.date').text(), 'YYYY-MM-DD')`,
                guid: Buffer.from(`$('a').attr('href')`).toString('base64'),
            },
        })
    );
};
