import cheerio from 'cheerio';
import got from '~/utils/got.js';

export default async (ctx) => {
    // 发起 HTTP GET 请求

    const host = 'http://xxhb.cug.edu.cn/zqxt/zqjsjg.jsp?wbtreeid=1283&selectType=1&searchScope=0';

    const {
        data
    } = await got({
        method: 'get',
        url: host,
    });

    const $ = cheerio.load(data);
    const list = $('form[id=searchlistform1] > table.listFrame > tbody > tr > td');
    const results = [];
    let item = {};
    for (let i = 0; i < list.length; i++) {
        const d = $(list[i]);
        d.find('i').remove();
        const title = d.find('span.titlefontstyle206274');
        const from = d.find('span.sourcesitefontstyle206274');
        const description = d.find('span.contentfontstyle206274');
        const time = d.find('span.timefontstyle206274');

        if (title.length) {
            item.title = from.text() + title.text();
            item.link = d.find('a').attr('href');
        } else if (description.length) {
            item.description = item.description ? item.description + d.text() : d.text();
        } else if (time.length) {
            item.pubDate = new Date(time.text().replace('发表时间:', '').replace('年', '-').replace('月', '-').replace('日', '')).toUTCString();
            results.push(item);
            item = {};
        }
    }

    let out = await Promise.all(
        results.map(async (element) => {
            const {
                link
            } = element;
            try {
                const result = await got.get(link);
                const $ = cheerio.load(result.data);
                element.description = $('.v_news_content').html();
                element.enabled = true;
            } catch {
                element.enabled = false;
            }
            return element;
        })
    );

    out = out.filter((item) => item.enabled);

    ctx.state.data = {
        title: 'CUG-今日文章',
        link: host,
        description: '中国地质大学(武汉) 每日文章，几乎包含全校站点最新信息。',
        item: out,
    };
};
