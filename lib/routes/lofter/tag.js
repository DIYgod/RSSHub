const got = require('@/utils/got');
const cheerio = require('cheerio');

const titles = {
    date: '日榜',
    week: '周榜',
    month: '月榜',
    total: '总榜',
    new: '最新',
};

module.exports = async (ctx) => {
    const name = ctx.params.name;
    const type = ctx.params.type ? ctx.params.type : 'new';

    const url = `http://www.lofter.com/tag/${encodeURIComponent(name)}/${type}/`;

    const response = await got.get(url);
    const $ = cheerio.load(response.data);

    const list = $('.m-mlist > .mlistcnt').slice(1).toArray();

    ctx.state.data = {
        title: `lofter话题 - ${name} - ${titles[type]}`,
        link: url,
        item: list.map((item) => {
            item = $(item);

            const author = item.find('.w-who > .ptag').first().text().trim();

            const images = item.find('img[data-origin]');
            for (let k = 0; k < images.length; k++) {
                $(images[k]).replaceWith(`<img src="${$(images[k]).attr('data-origin')}" />`);
            }

            item.find('.imgc[style]').removeAttr('style');

            item.find('.js-digest').remove();

            item.find('a:not([href])').each(function () {
                $(this).replaceWith($(this).html());
            });

            const title = item.find('.tit');

            return {
                title: title.length === 0 ? `${author}的图片` : title.text().trim(),
                author: author,
                description: item.find('.m-icnt.ctag > .cnt').html(),
                link: item.find('a.isayc').attr('href'),
                pubDate: new Date(item.find('a.isayc').attr('data-time') * 1),
            };
        }),
    };
};
