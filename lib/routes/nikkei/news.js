const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    let url = '';
    if (category === 'news') {
        url = `https://www.nikkei.com`;
    } else {
        url = `https://www.nikkei.com/${category}/archive`;
    }

    const response = await got({
        method: 'get',
        url: url,
    });
    const data = response.data;
    const $ = cheerio.load(data);

    let category_name = '';
    let list = null;
    if (category === 'news') {
        category_name = '総合';
        list = $('div.k-card.k-card--small.k-card--reverse').not('[data-rn-track="hub-ad-recommend"]').not('.k-hub-card--small-title');
    } else {
        category_name = $('h1.l-miH11_title').text().trim();
        list = $('div#CONTENTS_MAIN').children('div.m-miM09').not('.PRa');
    }

    const items = await Promise.all(
        list
            .map(async (index, item) => {
                item = $(item);
                let link = '';
                if (category === 'news') {
                    link = item.find('a.k-card__block-link').eq(0).attr('href');
                } else {
                    link = item.find('a').eq(0).attr('href');
                }
                if (link.substring(0, 4) !== 'http') {
                    link = 'https://www.nikkei.com' + link;
                }

                const description = await ctx.cache.tryGet(link, async () => {
                    const response = await got.get(link);
                    const $ = cheerio.load(response.data);
                    return $('div.cmn-article_text.a-cf.JSID_key_fonttxt.m-streamer_medium').html();
                });

                let tag = '';
                if (category_name === '総合') {
                    item.find('li.k-card__tag')
                        .children('a')
                        .each((index, value) => {
                            tag += $(value).text() + ' ';
                        });
                    tag = '[' + tag.substring(0, tag.length - 1) + '] ';
                }

                return {
                    title: tag + item.find('a').eq(0).text(),
                    description,
                    link,
                };
            })
            .get()
    );

    ctx.state.data = {
        title: '日本経済新聞-' + category_name,
        link: url,
        item: items,
    };
};
