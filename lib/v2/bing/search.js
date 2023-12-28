const parser = require('@/utils/rss-parser');
const { parseDate } = require('@/utils/parse-date');
const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');
require('dayjs/locale/zh-cn');
dayjs.extend(localizedFormat);

module.exports = async (ctx) => {
    const q = ctx.params.keyword;
    const searchParams = new URLSearchParams({
        format: 'rss',
        q,
    });
    const url = new URL('https://cn.bing.com/search');
    url.search = searchParams.toString();
    const data = await parser.parseURL(url.toString());
    ctx.state.data = {
        title: data.title,
        link: data.link,
        description: data.description + ' - ' + data.copyright,
        image: data.image.url,
        item: data.items.map((e) => ({
            ...e,
            description: e.content,
            pubDate: parseDate(e.pubDate, 'dddd, DD MMM YYYY HH:mm:ss [GMT]', 'zh-cn'),
        })),
    };
};
