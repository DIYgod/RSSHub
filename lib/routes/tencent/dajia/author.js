const axios = require('../../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const link = `http://dajia.qq.com/author_personal.htm#!/${uid}`;

    const info_api = `http://i.match.qq.com/ninjayc/dajiazuozheye?action=zuojia&authorid=${uid}`;
    const info_response = await axios.get(info_api);
    const author_name = info_response.data.data.author.name;
    const description = info_response.data.data.author.description;

    const article_api = `http://i.match.qq.com/ninjayc/dajiawenzhanglist?action=wz&authorid=${uid}`;
    const response = await axios.get(article_api);
    const list = response.data.data;

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.n_title;
            const date = info.n_publishtime;
            const itemUrl = info.n_mobile_url;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await axios.get(itemUrl);
            const $ = cheerio.load(response.data);
            const description = $('#articleContent')
                .html()
                .replace(/src="\//g, 'src="http:/')
                .trim();

            const single = {
                title: title,
                link: itemUrl,
                description: description,
                pubDate: new Date(date).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single), 24 * 60 * 60);
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${author_name}的文章——腾讯大家`,
        link: link,
        description: description,
        item: out,
    };
};
