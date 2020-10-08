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
                let title = '';
                let link = '';
                if (category === 'news') {
                    title = item.find('a').eq(0).text();
                    link = item.find('a.k-card__block-link').eq(0).attr('href');
                } else {
                    title = item.children('h3').children('a').text();
                    link = item.find('a').eq(0).attr('href');
                }
                if (link.substring(0, 4) !== 'http') {
                    link = 'https://www.nikkei.com' + link;
                }

                const tag_table = {
                    economy: '経済・金融',
                    politics: '政治',
                    business: 'ビジネス',
                    technology: 'テクノロジー',
                    international: '国際',
                    sports: 'スポーツ',
                    society: '社会・くらし',
                    opinion: 'オピニオン',
                    culture: '文化',
                    local: '地域',
                };

                let tag = '';
                const tag_arr = [];
                if (category_name === '総合') {
                    item.find('li.k-card__tag')
                        .children()
                        .each((index, item) => {
                            const tag_path = $(item).attr('href');
                            let tag_value = '';
                            if (tag_path.indexOf('?dw') >= 0) {
                                tag_value = $('a[href="https://www.nikkei.com' + tag_path.replace('?', '/?') + '"]')
                                    .parent()
                                    .parent()
                                    .parent()
                                    .parent()
                                    .parent()
                                    .children('a')
                                    .text();
                            } else {
                                tag_value = tag_table[tag_path.split('/')[1]];
                            }
                            tag_value = tag_value ? tag_value : 'コラム';
                            if (tag_arr.indexOf(tag_value) < 0) {
                                tag_arr.push(tag_value);
                            }
                        });

                    const start = tag_arr.indexOf('コラム');
                    if (start >= 0) {
                        tag_arr.splice(start, 1);
                    }
                }

                const description = await ctx.cache.tryGet(link, async () => {
                    const response = await got.get(link);
                    const $ = cheerio.load(response.data);
                    const regist_text = $('p.m-articleRegist_text');
                    if (regist_text.length > 0) {
                        tag_arr.push('有料限定');
                    }
                    return $('div.cmn-article_text.a-cf.JSID_key_fonttxt.m-streamer_medium').html();
                });

                if (tag_arr.length > 0) {
                    tag = '[' + tag_arr.join(' ') + tag + '] ';
                }

                return {
                    title: tag + title,
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
