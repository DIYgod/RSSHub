const cheerio = require('cheerio');
const got = require('@/utils/got');
const config = require('@/config').value;

module.exports = async (ctx) => {
    if (!config.feature.allow_user_supply_unsafe_domain) {
        ctx.throw(403, `This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }
    const url = `http://${ctx.params.url}`;
    const res = await got.get(`${url}/archives/`);
    const $ = cheerio.load(res.data);

    const list = $('.list-group-item');

    const count = [];
    for (let i = 0; i < Math.min(list.length, 5); i++) {
        count.push(i);
    }
    const out = await Promise.all(
        count.map(async (i) => {
            const each = $(list[i]);
            const storyLink = each.attr('href');
            const item = {
                title: each.find('.archive-post-title').text(),
                link: new URL(storyLink, url),
            };
            const key = item.link;
            const value = await ctx.cache.get(key);

            if (value) {
                item.description = value;
            } else {
                const storyDeatil = await got.get(item.link);
                const data = storyDeatil.data;
                const $ = cheerio.load(data);
                item.pubDate = $('time').attr('datetime');
                item.description = $('.markdown-body').html();
                ctx.cache.set(key, item.description);
            }
            return Promise.resolve(item);
        })
    );
    ctx.state.data = {
        title: $('.navbar-brand strong').text(),
        link: url,
        description: $('[name=description]').attr('content'),
        item: out,
    };
};
