const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const now =  Math.round(new Date().getTime());
    const link = `http://365jia.cn/news/index2019/list?page=1&id=22504014&_=${now}`;
    const response = await got.get(link);

    const $ = cheerio.load(response.data);
    const list = $('.news_list_info').get();

    // 加载文章页
    async function load(link) {
        const response = await got.get(link);
        const $ = cheerio.load(response.data);

        let time = $('span.pl30.cor_2.fz16').text();
        if (time) {
            time = time.replace(/来源.*/g, '');
        }
        const pubDate = new Date(time).toUTCString();

        const content = $('div.nt_cont_txt').html();
        const description = content;
        return { description, pubDate };
    }

    const items = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const title = $('p.fz20').text();
            let link = $('p.fz20').attr('onclick');
            if (link) {
                link = link.replace("window.open('", '').replace("', '_blank')", '');
            }
            const single = {
                title: title,
                link: link,
                guid: link
            };
            if (link) {
                const other = await ctx.cache.tryGet(link, async () => await load(link));
                return Promise.resolve(Object.assign({}, single, other));
            }

            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '万家热线 - 咨询',
        link,
        item: items
    };
};
