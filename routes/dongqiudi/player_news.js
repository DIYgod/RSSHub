const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const dayjs = require('dayjs');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const link = `https://www.dongqiudi.com/player/${id}.html`;
    const api = `https://www.dongqiudi.com/data/person/archive?person=${id}`;

    const axios_ins = axios.create({
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            Referer: link,
        },
    });

    const response = await axios_ins.get(link);
    const $ = cheerio.load(response.data);
    const playerName = `${$('h1.name').text()} ${$('span.en_name').text()}`;

    const list = (await axios_ins.get(api)).data.data;

    const out = await Promise.all(
        list.map(async (item) => {
            const itemUrl = item.web_url;
            const res = await axios_ins.get(itemUrl);
            const content = cheerio.load(res.data);

            if (itemUrl.includes('/video/')) {
                content('div.video').each((i, v) => {
                    const link = v.attribs.src;
                    content('div.video').replaceWith(`<video width="100%" controls> <source src="${link}" type="video/mp4"> Your RSS reader does not support video playback. </video>`);
                });
            }

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
        title: `${playerName} - 相关新闻`,
        link,
        item: out,
    };
};
