const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const BASE_URL = 'http://www.sme.buaa.edu.cn';

module.exports = async (ctx) => {
    const { path = 'tzgg' } = ctx.params;
    const url = `${BASE_URL}/${path}.htm`;
    const { title, list } = await getList(url);
    ctx.state.data = {
        // 源标题
        title,
        // 源链接
        link: url,
        // 源文章
        item: await getItems(ctx, list),
    };
};

async function getList(url) {
    const { data } = await got(url);
    const $ = cheerio.load(data);
    const title = $('.nytit .fr a')
        .toArray()
        .slice(1)
        .map((item) => $(item).text().trim())
        .join(' - ');
    const list = $("div[class='Newslist'] > ul > li")
        .toArray()
        .map((item) => {
            item = $(item);
            const $a = item.find('a');
            const link = $a.attr('href');
            return {
                title: item.find('a').text(),
                link: link.startsWith('http') ? link : `${BASE_URL}/${link}`, // 有些链接是相对路径
                pubDate: timezone(parseDate(item.find('span').text()), +8),
            };
        });
    return {
        title,
        list,
    };
}

function getItems(ctx, list) {
    return Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: descrptionResponse } = await got(item.link);
                const $descrption = cheerio.load(descrptionResponse);
                item.description = $descrption('div[class="v_news_content"]').html();
                return item;
            })
        )
    );
}
