const buildData = require('@/utils/common-config');
const baseUrl = 'https://www.xunhupay.com';

module.exports = async (ctx) => {
    const link = `${baseUrl}/blog.html`;
    ctx.state.data = await buildData({
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
    });
};
