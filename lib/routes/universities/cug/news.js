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

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('form[id=searchlistform1] > table.listFrame > tbody > tr > td');
    const results = [];
    let item = {};
    for (let i = 0; i < list.length; i++) {
        const d = $(list[i]);
        d.find('i').remove();
        const title = d.find('span.titlefontstyle206274');
        const author = d.find('span.sourcesitefontstyle206274');
        const description = d.find('span.contentfontstyle206274');
        const time = d.find('span.timefontstyle206274');

        if (title.length) {
            item.title = title.text();
            item.author = author.text();
            item.link = d.find('a').attr('href');
        } else if (description.length) {
            item.description = item.description ? item.description + d.text() : d.text();
        } else if (time.length) {
            item.pubDate = new Date(time.text().replace('发表时间:', '').replace('年', '-').replace('月', '-').replace('日', '')).toUTCString();
            results.push(item);
            item = {};
        }
    }

    const out = await Promise.all(
        results.map((element) => ctx.cache.tryGet(`cug/${element.link}`, async () => {
            try {
                const result = await got.get(element.link);
                const $ = cheerio.load(result.data);
                element.description = $('.v_news_content').html();
            } catch (e) {
                logger.warn(`cug/news: ${element.link} -- ${e.message}`);
            }
            return element;
        }))
    );

    ctx.state.data = {
        title: 'CUG-本月新闻',
        link: host,
        description: '中国地质大学(武汉) 本月新闻，几乎包含全校站点最新信息。',
        item: out,
    };
};
