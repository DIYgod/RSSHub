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
        list.map((info) =>
            ctx.cache.tryGet(info.link, async () => {
                const response = await got({
                    method: 'get',
                    url: info.link,
                });
                const $ = cheerio.load(response.data);
                info.author = $('.author').attr('title');
                info.category = [...$('#route').text().split('>').slice(-2, -1)[0].trim().matchAll(/\S+/g)];
                const content = $('.artContent');
                info.description = content.html();
                info.pubDate = timezone(parseDate(info.pubdate, 'YYYY-MM-DD'), +8);

                return info;
            })
        )
    );

    ctx.state.data = {
        title: `中国智库网 —— ${title}`,
        link,
        item: out,
    };
};
