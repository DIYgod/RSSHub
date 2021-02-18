const got = require('@/utils/got');
const cheerio = require('cheerio');

const base_url = 'https://www.tzc.edu.cn';

const maps = {
    tzgg: '/xwdt/tzgg.htm',
};

module.exports = async (ctx) => {
    const link = `${base_url}${maps.tzgg}`;

    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = cheerio.load(response.data);
    const links = $('div.newslist_all ul li')
        .map((i, e) => ({
            title: $(e).find('a').attr('title'),
            url: $(e).find('a').attr('href'),
            time: new Date($(e).find('span').text()).getTime(),
        }))
        .get();

    const out = await Promise.all(
        links.map(async (item) => {
            let full_url, description;
            if (item.url.startsWith('..')) {
                full_url = base_url + item.url.slice(2);
                description = await ctx.cache.tryGet(full_url, async () => {
                    const r = await got({
                        method: 'get',
                        url: full_url,
                    });

                    const $ = cheerio.load(r.data);
                    return $('.v_news_content').html();
                });
            } else {
                description = `外站未适配，请到原网站${item.url}查看`;
            }

            return {
                title: item.title,
                description: description,
                pubDate: item.time,
                link: item.url,
                author: `台州学院`,
            };
        })
    );

    ctx.state.data = {
        link: link,
        title: `台州学院-通知公告`,
        description: `台州学院-通知公告`,
        item: out,
    };
};
