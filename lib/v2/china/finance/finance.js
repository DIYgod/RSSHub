const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const CATEGORY_MAP = {
    tuijian: 'tuijian', // 推荐
    TMT: 'TMT', // TMT
    jinrong: 'jinrong', // 金融
    dichan: 'dichan', // 地产
    xiaofei: 'xiaofei', // 消费
    yiyao: 'yiyao', // 医药
    wine: 'wine', // 酒业
    IPO: 'IPO', // IPO观察
};

module.exports = async (ctx) => {
    const baseUrl = 'https://finance.china.com';
    const category = CATEGORY_MAP[ctx.params.category] ?? CATEGORY_MAP.tuijian;
    const websiteUrl = `${baseUrl}/${category}`;
    const response = await got(websiteUrl);
    const data = response.data;
    const $ = cheerio.load(data);
    const categoryTitle = $('.list-hd strong').text();
    const listCategory = `中华网-财经-${categoryTitle}新闻`;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30;
    const detailsUrls = $('.item-con-inner')
        .map((_, item) => {
            item = $(item);
            return {
                link: item.find('.tit>a').attr('href'),
            };
        })
        .get()
        .filter((item) => item.link !== void 0)
        .slice(0, limit);

    const items = await Promise.all(
        detailsUrls.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailsResponse = await got(item.link);
                const $d = cheerio.load(detailsResponse.data);
                return {
                    title: $d('.article_title').text(),
                    link: item.link,
                    description: $d('#js_article_content').html(),
                    pubDate: timezone(parseDate($d('.article_info>span.time').text()), +8),
                    author: $d(' div.article_info > span.source').text(),
                    category: listCategory,
                };
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        link: websiteUrl,
        category: listCategory,
        item: items,
    };
};
