const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const link = `https://www.chinathinktanks.org.cn/content/list?id=${ctx.params.id}&pt=1`;

    const response = await got(link);
    const $ = cheerio.load(response.data);
    const title = $('#relates > div.pub_right > div.location').text().split('：')[1].trim();

    const list = $('#relates > div.pub_right > div.pub_content > ul > li')
        .map(function () {
            const info = {
                title: $(this).find('a').attr('title'),
                link: `https:${$(this).find('a').attr('href')}`,
                pubdate: $(this).find('span').text().slice(1, -1).trim(),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const pubdate = info.pubdate;
            const itemUrl = info.link;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);
            const author = $('.author').attr('title');
            const category = [...$('#route').text().split('>').slice(-2, -1)[0].trim().matchAll(/\S+/g)];
            const content = $('.artContent');
            const description = content.html();

            const single = {
                title,
                author,
                category,
                link: itemUrl,
                description,
                pubDate: timezone(parseDate(pubdate, 'YYYY-MM-DD'), +8),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `中国智库网 —— ${title}`,
        link,
        item: out,
    };
};
