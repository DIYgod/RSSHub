const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const res = await got.get('https://xiaomi.eu/community/forums/miui-rom-releases.103/');
    const $ = cheerio.load(res.data);
    const threads = await Promise.all(
        $('.structItem--thread')
            .map(async (idx, th) => {
                const $th = $(th);
                const $ver = $th.find('.structItem-title>a:nth-child(1)');
                const $title = $th.find('.structItem-title>a:nth-child(2)');
                const title = `[${$ver.text()}] ${$title.text()}`;
                const link = `https://xiaomi.eu${$title.attr('href')}`;
                const res = await got.get(link);
                const $$ = cheerio.load(res.data);
                const floors = $$('.bbWrapper');
                const description = $$(floors[0]).html() + $$(floors[1]).html();
                const pubDate = new Date($$('time').attr('datetime')).toUTCString();
                return { title, description, link, pubDate };
            })
            .toArray()
    );
    ctx.state.data = {
        title: 'Xiaomi.eu ROM Releases',
        link: 'https://xiaomi.eu/community/forums/miui-rom-releases.103/',
        item: threads,
    };
};
