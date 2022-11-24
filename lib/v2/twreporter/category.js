const cheerio = require('cheerio');
const got = require('@/utils/got');

const fetch = require('./fetch_article');

module.exports = async (ctx) => {
    const baseURL = 'https://www.twreporter.org';
    const url = baseURL + `/categories/${ctx.params.cid}`;
    const res = await got(url);
    const $ = cheerio.load(res.data);
    const regexp = /^window\.__REDUX_STATE__=(.*);$/gm;
    const raw = $('script[charset="UTF-8"]').html().replace(regexp, '$1');
    const list = JSON.parse(raw);
    const ids = list.entities.posts.allIds;

    const links = [];
    const titles = [];
    const category = list.entities.posts.byId[ids[0]].categories[0].name;

    for (const id of ids) {
        links.push(baseURL + '/a/' + list.entities.posts.byId[id].slug);
        titles.push(list.entities.posts.byId[id].title);
    }

    const out = await Promise.all(
        links.map((item, index) => {
            const title = titles[index];
            return ctx.cache.tryGet(item, async () => {
                const single = await fetch(item);
                single.title = title;
                return single;
            });
        })
    );
    ctx.state.data = {
        title: `報導者 | ${category}`,
        link: url,
        item: out,
    };
};
