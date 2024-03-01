const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const host = 'https://www.dykszx.com';

// disable ssl check
const options = { https: { rejectUnauthorized: false } };

const getContent = (href, caches) => {
    const newsPage = `${host}${href}`;
    return caches.tryGet(newsPage, async () => {
        const response = await got.get(newsPage, options);
        const data = response.data;
        const $ = cheerio.load(data);
        const newsTime = $('body > div:nth-child(3) > div.page.w > div.shuxing.w')
            .text()
            .trim()
            .match(/时间：(.*?)点击/g)[0];
        // 移除二维码
        $('.sjlook').remove();
        const content = $('#show-body').html();
        return { newsTime, content, newsPage };
    });
};

const newsTypeObj = {
    all: { selector: '#nrs > li > b', name: '新闻中心' },
    gwy: { selector: 'body > div:nth-child(3) > div:nth-child(8) > ul > li', name: '公务员考试' },
    sydw: { selector: 'body > div:nth-child(3) > div:nth-child(9) > ul > li', name: '事业单位考试' },
    zyzc: { selector: 'body > div:nth-child(3) > div:nth-child(10) > ul > li', name: '执（职）业资格、职称考试' },
    other: { selector: 'body > div:nth-child(3) > div:nth-child(11) > ul > li', name: '其他考试' },
};

module.exports = async (ctx) => {
    const newsType = ctx.params.type || 'all';
    const response = await got(host, options);
    const data = response.data;
    const $ = cheerio.load(data);
    const newsList = $(newsTypeObj[newsType].selector).toArray();

    const newsDetail = await Promise.all(
        newsList.map(async (item) => {
            const href = item.children[0].attribs.href;
            const newsContent = await getContent(href, ctx.cache);
            return {
                title: item.children[0].children[0].data,
                description: newsContent.content,
                link: newsContent.newsPage,
                pubDate: timezone(parseDate(newsContent.newsTime, '时间：YYYY-MM-DD HH:mm:ss'), +8),
            };
        })
    );
    ctx.state.data = {
        title: `德阳人事考试网 - ${newsTypeObj[newsType].name}`,
        link: host,
        description: '德阳人事考试网 考试新闻发布',
        item: newsDetail,
    };
};
