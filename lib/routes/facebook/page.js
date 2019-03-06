const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const getArticle = require('./article');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const { data: html } = await axios.get(`https://mbasic.facebook.com/${encodeURIComponent(id)}/`);
    const $ = cheerio.load(html);
    ctx.state.data = {
        title: $('#m-timeline-cover-section h1 span').text(),
        link: `https://www.facebook.com/${encodeURIComponent(id)}/`,
        description: $('#sub_profile_pic_content>div>div:nth-child(3) div>span')
            .find('br')
            .replaceWith('\n')
            .text(),
        item: await Promise.all(
            $('div[role=article]>div:nth-child(2)>div:nth-child(2)>span+a')
                .toArray()
                .map((x) => $(x).attr('href'))
                .map(async (url) => {
                    const d = await getArticle('https://mbasic.facebook.com' + url);
                    return {
                        title: d.title,
                        description: d.imgs.map((u) => `<img referrerpolicy="no-referrer" src="${u}">`).join('\n') + d.content.replace(/\n/g, '<br>'),
                        link: d.url,
                    };
                })
        ),
    };
    return $;
};
