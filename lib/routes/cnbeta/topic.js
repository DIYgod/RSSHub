const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');
module.exports = async (ctx) => {
    const topicUrl = `https://www.cnbeta.com/topics/${ctx.params.topic_id}.htm`;
    const response = await got({
        method: 'get',
        url: topicUrl,
    });
    const $ = cheerio.load(response.data);

    const topicInfo = $('div.cate-brief h2 b').text();
    const news_list = $('div.item')
        .map((i, item) => {
            const title = $(item).find('dl dt a').text();
            let href = $(item).find('dl dt a').attr('href');
            if (href === undefined) {
                return null;
            }
            if (href.startsWith('//')) {
                href = 'https:' + href;
            }
            const status = $(item).find('div.meta-data ul.status li')['0'].children[0].data;
            const info = status.split(' ');
            const author = info[0];
            const pubDate = info[1] + ' ' + info[2];
            return { title, href, author, pubDate };
        })
        .filter((x) => x)
        .map((i, e) => e)
        .get();

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);

        // 移除6.18广告
        $('.article-global').remove();
        $('.article-topic').remove();

        // 提取内容
        return $('.article-summary p').html() + '<br>' + $('.article-content').html();
    };

    const out = await Promise.all(
        news_list.map(async (item) => {
            const cache = await ctx.cache.get(item.href);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                method: 'get',
                url: item.href,
            });

            const description = ProcessFeed(response.data);
            const single = {
                title: item.title,
                description,
                pubDate: date(item.pubDate, +8),
                link: item.href,
                author: item.author,
            };
            ctx.cache.set(item.href, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `cnBeta专题 - ${topicInfo}`,
        link: topicUrl,
        item: out ?? [],
        description: `cnBeta专题 - ${topicInfo}`,
    };
};
