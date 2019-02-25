const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const response = await axios(`https://i.ui.cn/ucenter/${id}.html`);
    const $ = cheerio.load(response.data);
    const postList = $('#works-list li').get();
    const name = $('.user-pad .us-name .n1').text();
    const result = await Promise.all(
        postList.map(async (item) => {
            const title = $(item)
                .find('.iInspir-title')
                .find('a')
                .text();
            const link = $(item)
                .find('.iInspir-title')
                .find('a')
                .attr('href');
            const guid = link;

            const single = {
                title: title,
                link: link,
                guid: guid,
                pubDate: '',
                description: '',
            };

            const description_key = 'ui-cn_description' + guid;
            const description_value = await ctx.cache.get(description_key);

            const pubDate_key = 'ui-cn_pubDate' + guid;
            const pubDate_value = await ctx.cache.get(pubDate_key);

            if (description_value && pubDate_value) {
                single.description = description_value;
                single.pubDate = pubDate_value;
            } else {
                const temp = await axios(link);
                single.description = $(temp.data)
                    .find('.works-cont')
                    .html();
                single.pubDate = new Date(
                    $(temp.data)
                        .find('.works-top')
                        .find('.time')
                        .find('em')
                        .text()
                        .replace(/更新于：/g, '')
                ).toUTCString();

                ctx.cache.set(description_key, single.description, 60 * 60);
                ctx.cache.set(pubDate_key, single.pubDate, 60 * 60);
            }

            return Promise.resolve(single);
        })
    );
    ctx.state.data = { title: `${name} 的设计作品 - UI 中国`, link: `https://i.ui.cn/ucenter/${id}.html`, item: result };
};
