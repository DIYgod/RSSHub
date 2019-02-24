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
            const guid = $(item)
                .find('.iInspir-title')
                .find('a')
                .attr('href');
            const temp = await axios(link);
            const description = $(temp.data)
                .find('.works-cont')
                .html();
            const pubDate = new Date(
                $(temp.data)
                    .find('.works-top')
                    .find('.time')
                    .find('em')
                    .text()
                    .replace(/更新于：/g, '')
            ).toUTCString();
            const single = {
                title: title,
                link: link,
                guid: guid,
                pubDate: pubDate,
                description: description,
            };
            return Promise.resolve(single);
        })
    );
    ctx.state.data = { title: `${name} 的设计作品 - UI 中国`, link: `https://i.ui.cn/ucenter/${id}.html`, item: result };
};
