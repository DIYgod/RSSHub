const got = require('@/utils/got');
const cheerio = require('cheerio');

function getArticle(ctx, line, tasks) {
    const article = ctx.cache.tryGet(line, async () => {
        const a_r = await got.get(`https://app3.rthk.hk/mediadigest/${line}`);
        const $ = cheerio.load(a_r.data);
        // title
        const h1 = $('h1.story-title').text();
        // author
        const author_list = $('div.story-author');
        const authors = author_list.map((_index, author) => $(author).text());
        const author = authors.map((_index, author) => `<b>${author}</b><br>`);
        const s_author = author.toArray().join('');
        const author_block = `<blockquote><p>${s_author}</p></blockquote>`;
        // date
        const date = $('div.story-calendar').text();
        // desc
        const desc = `${$(author_block)}${$('div.story-content').html()}`;

        return {
            title: h1,
            description: desc,
            pubDate: new Date(`${date}T09:00:00+0800`).toUTCString(),
            link: line,
        };
    });
    tasks.push(article);
}

module.exports = async (ctx) => {
    const category = ctx.params.category || 'all';
    const tasks = [];

    if (category !== 'all') {
        const response = await got.get(`https://app3.rthk.hk/mediadigest/category.php?cid=${category}`);
        const $ = cheerio.load(response.data);
        const list = $('div.category-line');

        list.map((_index, line) => $(line).find('a').first().attr('href')).each((_index, line) => {
            getArticle(ctx, line, tasks);
        });
    } else {
        const cids = [1, 2];
        for (let i = 4; i < 28; ++i) {
            cids.push(i);
        }
        const urls = cids.map((cid) => `https://app3.rthk.hk/mediadigest/category.php?cid=${cid}`);
        const list_allt = await Promise.all(
            urls.map(async (url) => {
                const response = await got.get(url);
                const $ = cheerio.load(response.data);
                const list = $('div.category-line').map((_index, line) => $(line).find('a').first().attr('href'));
                return Promise.resolve(list.toArray());
            })
        );
        const list_all = [...new Set(list_allt.flat())];

        const list_recent_20 = list_all
            .sort((a, b) => {
                const aid_a = a.match(/aid=(\d+)/)[1];
                const aid_b = b.match(/aid=(\d+)/)[1];
                // reverse
                return aid_b - aid_a;
            })
            .slice(0, 20);
        list_recent_20.forEach((line) => {
            getArticle(ctx, line, tasks);
        });
    }

    const rss = await Promise.all(tasks);

    ctx.state.data = {
        title: '傳媒透視',
        link: 'https://app3.rthk.hk/mediadigest/index.php',
        item: rss,
    };
};
