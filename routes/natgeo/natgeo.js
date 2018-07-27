const cheerio = require('cheerio');
const config = require('../../config');
const axios = require('../../utils/axios');

const axios_ins = axios.create({
    headers: {
        'User-Agent': config.ua,
        Reference: 'https://www.natgeomedia.com',
    },
});

module.exports = async (ctx) => {
    const option = `${ctx.params.option ? ctx.params.option : ''}`;
    const url = `https://www.natgeomedia.com/category/${ctx.params.cat}/${ctx.params.type}`;
    const res = await axios_ins.get(url);
    const data = res.data;
    const $ = cheerio.load(data);

    const list = $('.td-ss-main-content').find('.td-animation-stack');

    const out = [];
    for (let i = 0; i < list.length; i++) {
        const each = $(list[i]);
        const storyLink = each.find('a[itemprop=url]').attr('href');
        const item = {
            title: each.find('a[itemprop=url]').attr('title'),
            pubDate: each.find('time').attr('datetime'),
            link: storyLink,
            guid: storyLink.match(/\d+/g)[0],
        };
        if (option !== 'full') {
            item.description = each.find('.td-excerpt').text();
        } else {
            const value = await ctx.get(item.guid);
            if (value) {
                item.description = value;
            } else {
                // 获取全文
                const storyDetail = await axios({
                    method: 'get',
                    url: item.link,
                    headers: {
                        'User-Agent': config.ua,
                        Referer: url,
                    },
                });
                const data = storyDetail.data;
                const $ = cheerio.load(data);
                item.description = $('.td-post-content').html();
                ctx.set(item.guid, item.description, 24 * 60 * 60);
            }
        }
        out.push(item);
    }
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};
