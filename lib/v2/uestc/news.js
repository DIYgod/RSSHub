const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const dateRegex = /(20\d{2}).(\d{2})-(\d{2})/;

const baseUrl = 'https://news.uestc.edu.cn';

const map = {
    academy: '/?n=UestcNews.Front.CategoryV2.Page&CatId=66',
    culture: '/?n=UestcNews.Front.CategoryV2.Page&CatId=67',
    announcement: '/?n=UestcNews.Front.CategoryV2.Page&CatId=68',
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'announcement';
    const pageUrl = map[type];
    if (!pageUrl) {
        throw new Error('type not supported');
    }

    const response = await got.get(baseUrl + pageUrl);

    const $ = cheerio.load(response.data);

    const items = $('div.notice-item.clearfix');

    const out = $(items)
        .map((_, item) => {
            item = $(item);
            const newsTitle = item.find('a').text().trim();
            const newsLink = baseUrl + item.find('a').attr('href');
            const newsDate = parseDate(item.find('div.date-box-sm').text().replace(dateRegex, '$1-$2-$3'));
            const newsDescription = item.find('div.content').text().trim().replace('&nbsp;', '');

            return {
                title: newsTitle,
                link: newsLink,
                description: newsDescription,
                pubDate: newsDate,
            };
        })
        .get();

    ctx.state.data = {
        title: '新闻网通知',
        link: baseUrl,
        description: '电子科技大学新闻网信息公告',
        item: out,
    };
};
