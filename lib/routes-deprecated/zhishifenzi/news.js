const url = require('url');
const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseRelativeDate } = require('@/utils/parse-date');

const titles = {
    multiple: '综合',
    biology: '生物',
    medicine: '医药',
    ai: '人工智能',
    physics: '物理',
    chymistry: '化学',
    astronomy: '天文',
    other: '其他',
};

module.exports = async (ctx) => {
    // type can be on of:
    // ["biology", "medicine", "ai", "physics", "chymistry", "astronomy", "other"]
    const type = ctx.params.type || 'multiple';

    const rootUrl = 'http://zhishifenzi.com';
    const currentUrl = url.resolve(rootUrl, '/news/ajaxarticles');
    const response = await got({
        method: 'post',
        url: currentUrl,
        form: {
            category: type,
        },
    });

    const $ = cheerio.load(response.data);
    const list = $('h5 a')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: url.resolve(rootUrl, item.attr('href')),
            };
        })
        .get();

    const out = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                item.description = content('.inner_content').html();
                item.pubDate = parseRelativeDate(content('.inner_view_from').text());

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `知識分子 | 資訊「${titles[type] || '综合'}」`,
        description: `知識分子 | 科學 文明 智慧`,
        link: url.resolve(rootUrl, '/news'),
        item: out,
    };
};
