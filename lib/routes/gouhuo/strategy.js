const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'https://gouhuo.qq.com';
    const url = `${baseUrl}/guide`;
    const response = await got({
        method: 'get',
        url: url,
        headers: {
            Referer: `https://gouhuo.qq.com/`,
        },
    });
    const body = response.data;
    const $ = cheerio.load(body);

    // eslint-disable-next-line no-eval
    const obj = eval(body.match(/(?<=<script>\s*window\.__NUXT__=)[\s\S]*?(?=<\/script>)/g)[0]);
    const items = obj.data[0].newGuides.map((item) => {
        const img_url = item.img_url;
        const single = {
            title: item.title,
            description: `${item.title}<br><img src="${img_url}">`,
            pubDate: new Date(item.publish_ts * 1000).toUTCString(),
            link: `${baseUrl}${item.link}`,
        };
        return single;
    });

    ctx.state.data = {
        title: $('title').text().split('_')[0],
        link: url,
        item: items,
    };
};
