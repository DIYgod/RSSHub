const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let mode = ctx.params.mode;
    let title;
    if (mode === 'serial') {
        mode = '%E9%80%A3%E8%BC%89';
        title = 'Vol.moe - serial';
    } else if (mode === 'finish') {
        mode = '%E5%AE%8C%E7%B5%90';
        title = 'Vol.moe - finish';
    } else {
        mode = 'all';
        title = 'Vol.moe';
    }
    const link = `https://vol.moe/l/all,all,${mode},lastupdate,all,all,none/`;
    const listData = await got.get(link);
    const $list = cheerio.load(listData.data);
    const items = $list('.listbg td')
        .map((_, el) => {
            const $el = $list(el);
            const title = $el.find('a').last().text();
            const imgEL = $el.find('a').first();
            const link = imgEL.attr('href');
            const imgSrc = String(imgEL.find('.img_book').attr('style'))
                .replace(/.*\s?url\(["']?/, '')
                .replace(/["']?\).*/, '');
            const match = $el.text().match(/\[[\S\s]*?]/g);
            const detail = $el.find('.pagefoot').text();
            const date = $el.find('.filesize').text();
            return {
                title: `${title} ${detail} ${match}`,
                description: `
            <img src="${imgSrc}" />
            <h1>${title}</h1>
            <h2>${match}</h2>
            <h2>${detail}</h2>
            <h2>${date}</h2>
        `.trim(),
                link,
                pubDate: new Date(date).toUTCString(),
            };
        })
        .get();
    ctx.state.data = {
        title,
        link,
        item: items,
    };
};
