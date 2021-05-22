const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const option = ctx.params.option || 'default';

    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: 'https://mobile.tdm.com.mo/cn/index_pop.php?se=inews&type=all',
    });

    const $ = cheerio.load(response.data);
    const list = $('div.post a.title');

    const tasks = [];

    if (option === 'brief') {
        list.map((_index, li) => $(li).find('a').first().attr('href')).each((_index, link) => {
            const entry = ctx.cache.tryGet(link, async () => {
                const post = await got.get(link);
                const $ = cheerio.load(post.data);
                // title
                const title = $('div.post h2.title').text();
                // tag
                const [, tag, date, time_r] = $('div.post p.byline')
                    .text()
                    .match(/\[(.*)\] Post by (\d+-\d+-\d+) (\d+:\d+:\d+)/);
                // time
                const time = new Date(`${date}T${time_r}+0800`).toUTCString();
                // desc
                const ptext = $('div.entry')
                    .html()
                    .replace(/<\/?[^>]+(>|$)/g, '');
                const content = `<p>${ptext}<br><br>#${tag} (${date} ${time_r})</p>`;

                return {
                    title: title,
                    description: content,
                    pubDate: time,
                    link: link,
                };
            });
            tasks.push(entry);
        });
    } else {
        list.map((_index, li) => $(li).find('a').first().attr('href')).each((_index, link) => {
            const entry = ctx.cache.tryGet(link, async () => {
                const post = await got.get(link);
                const $ = cheerio.load(post.data);
                // title
                const title = $('div.post h2.title').text();
                // time
                const [, date, time_r] = $('div.post p.byline')
                    .text()
                    .match(/Post by (\d+-\d+-\d+) (\d+:\d+:\d+)/);
                const time = new Date(`${date}T${time_r}+0800`).toUTCString();
                // desc
                const content = $('div.entry').html();

                return {
                    title: title,
                    description: content,
                    pubDate: time,
                    link: link,
                };
            });
            tasks.push(entry);
        });
    }

    const rss = await Promise.all(tasks);

    ctx.state.data = {
        title: '澳門電台',
        link: 'https://www.tdm.com.mo/c_news/radio_news.php',
        item: rss,
    };
};
