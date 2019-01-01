const axios = require('../../utils/axios');
const cheerio = require('cheerio');

const baseUrl = 'http://www.infzm.com/contents/';

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const url = `${baseUrl}${id}`;
    const response = await axios({
        method: 'get',
        url: url,
        headers: {
            Referer: url,
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('article');
    const resultItem = await Promise.all(
        list
            .map(async (item, index) => {
                item = $(index);
                const info = item
                    .find('div.clearfix>div>p.articleInfo')
                    .text()
                    .trim()
                    .split(/\s+/);
                const date = new Date(`${info.slice(-2)[0]}T${info.slice(-1)[0]}`);
                const link = item.find('a').attr('href');
                const id = link.match(/content\/(\d+)/)[1];
                let description;

                if (id) {
                    const key = `infzm: ${link}`;
                    const value = await ctx.cache.get(key);

                    if (value) {
                        description = value;
                    } else {
                        const response = await axios({
                            method: 'get',
                            url: `http://api.infzm.com/mobile/contents/${id}`,
                        });

                        description = response.data.data.content.fulltext;
                        ctx.cache.set(key, description, 24 * 60 * 60);
                    }
                } else {
                    description = `${item.find('div.clearfix>div>p.intro').text()}<img referrerpolicy="no-referrer" src="${item.find('img').attr('src')}">`;
                }

                return {
                    title: item.find('div.articleTitle>h>a').text(),
                    description,
                    pubDate: date.toUTCString(),
                    link,
                };
            })
            .get()
    );

    ctx.state.data = {
        title: `${$('title').text()}-${$('#sortName')
            .find('a')
            .text()}`,
        link: url,
        description: $('meta[name="description"]').attr('content'),
        item: resultItem,
    };
};
