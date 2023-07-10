const cheerio = require('cheerio');
const got = require('@/utils/got');
const logger = require('@/utils/logger');

module.exports = async (ctx) => {
    // 发起 HTTP GET 请求

    const host = 'https://xxhb.cug.edu.cn/zqxt/zqjsjg.jsp?wbtreeid=1283&selectType=5&searchScope=0';

    const response = await got({
        method: 'get',
        url: host,
    });
    const results = [];
    const data = response.data;
    const $ = cheerio.load(data);
    $('i').remove();
    // find title elements
    const titleSpanList = $('form[id=searchlistform1] > table.listFrame > tbody > tr > td > a > span.titlefontstyle206274');
    titleSpanList.each((i, titleSpan) => {
        const item = $(titleSpan);
        const formTree = item.parent().parent().parent();
        const title = item.text();
        const link = item.parent().attr('href');
        const author = item.parent().next().text();
        // for pubDate
        const timeItem = formTree.nextAll().find('tr > td > span.timefontstyle206274').first();
        const pubDate = new Date(timeItem.text().replace('发表时间:', '').replace('年', '-').replace('月', '-').replace('日', '')).toUTCString();
        // for description
        let description = '';
        let currentDesc = formTree.next();
        while (!currentDesc.is(timeItem.parent().parent())) {
            description += currentDesc.text();
            currentDesc = currentDesc.next();
        }
        // push item
        results.push({
            title,
            link,
            author,
            description,
            pubDate,
        });
    });
    // find full-text for each item
    const out = await Promise.all(
        results.map((element) =>
            ctx.cache.tryGet(`cug/${element.link}`, async () => {
                try {
                    const result = await got.get(element.link);
                    const $ = cheerio.load(result.data);
                    element.description = $('.v_news_content').html();
                } catch (e) {
                    logger.warn(`cug/news: ${element.link} -- ${e.message}`);
                }
                return element;
            })
        )
    );
    ctx.state.data = {
        title: 'CUG-本月新闻',
        link: host,
        description: '中国地质大学(武汉) 本月新闻，几乎包含全校站点最新信息。',
        item: out,
    };
};
