const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const link = `http://dajia.qq.com/tanzi_diceng.htm#!/${uid}`;

    const info_api = `http://i.match.qq.com/ninjayc/dajialanmu?action=lanmu&channelid=${uid}`;
    const info_response = await got.get(info_api);
    const name = info_response.data.data.channel.n_cname;
    const description = info_response.data.data.channel.n_describe;

    const article_api = `http://i.match.qq.com/ninjayc/dajiawenzhanglist?action=wz&channelid=${uid}`;
    const response = await got.get(article_api);
    const list = response.data.data;

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.n_title;
            const date = info.n_publishtime;
            const itemUrl = info.n_mobile_url;
            const author = info.name;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);
            const description = $('#articleContent')
                .html()
                .replace(/src="\//g, 'src="http:/')
                .trim();

            const single = {
                title: title,
                link: itemUrl,
                description: description,
                author: author,
                pubDate: new Date(date).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${name}——腾讯大家`,
        link: link,
        description: description,
        item: out,
    };
};
