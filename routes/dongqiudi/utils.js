const dayjs = require('dayjs');
const cheerio = require('cheerio');
const axios = require('../../utils/axios');

module.exports = {
    ProcessFeed: async (ctx, link, api) => {
        const axios_ins = axios.create({
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                Referer: link,
            },
        });

        const response = await axios_ins.get(link);
        const $ = cheerio.load(response.data);
        const name = `${$('h1.name').text()} ${$('span.en_name').text()}`;

        const list = (await axios_ins.get(api)).data.data;
        const out = await Promise.all(
            list.map(async (item) => {
                const itemUrl = item.web_url;
                const res = await axios_ins.get(itemUrl);
                const content = cheerio.load(res.data);

                content('div.video').each((i, v) => {
                    const link = v.attribs.src;
                    switch (v.attribs.site) {
                        case 'qiniu':
                            content('div.video').replaceWith(`<video width="100%" controls> <source src="${link}" type="video/mp4"> Your RSS reader does not support video playback. </video>`);
                            break;
                        case 'youku':
                            content('div.video').replaceWith(`<iframe height='100%' width='100%' src='${link}' frameborder=0 scrolling=no webkitallowfullscreen=true allowfullscreen=true></iframe>`);
                            break;
                        default:
                            break;
                    }
                });

                const serverOffset = new Date().getTimezoneOffset() / 60;
                const single = {
                    title: content('h1').text(),
                    guid: itemUrl,
                    link: itemUrl,
                    description: content('#con > div.left > div.detail > div:nth-child(3)').html(),
                    pubDate: dayjs(content('#con h4 span.time').text())
                        .add(-8 - serverOffset, 'hour')
                        .toISOString(),
                    author: content('#con h4 span.name').text(),
                };
                return Promise.resolve(single);
            })
        );

        ctx.state.data = {
            title: `${name} - 相关新闻`,
            link,
            item: out,
        };
    },
};
