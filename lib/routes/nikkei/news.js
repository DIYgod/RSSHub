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

    let categoryName = '';
    let list = null;
    if (category === 'news') {
        categoryName = '総合';
        list = $('div.k-card.k-card--small.k-card--reverse').not('[data-rn-track="hub-ad-recommend"]').not('.k-hub-card--small-title');
    } else {
        categoryName = $('h1.l-miH11_title').text().trim();
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

                const tagTable = {
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
                    style: 'ライフ',
                };

                let tag = '';
                const tagArr = [];
                if (categoryName === '総合') {
                    item.find('li.k-card__tag')
                        .children()
                        .each((index, item) => {
                            const tagPath = $(item).attr('href');
                            let tagValue = '';
                            if (tagPath.indexOf('?dw') >= 0) {
                                tagValue = $('a[href="https://www.nikkei.com' + tagPath.replace('?', '/?') + '"]')
                                    .parent()
                                    .parent()
                                    .parent()
                                    .parent()
                                    .parent()
                                    .children('a')
                                    .text();
                            } else if (tagPath.indexOf('style') >= 0) {
                                tagValue = 'ライフ';
                            } else {
                                tagValue = tagTable[tagPath.split('/')[1]];
                            }
                            tagValue = tagValue ? tagValue : 'コラム';
                            if (tagValue !== 'トップ' && tagArr.indexOf(tagValue) < 0) {
                                tagArr.push(tagValue);
                            }
                        });
                    const start = tagArr.indexOf('コラム');
                    if (start >= 0) {
                        tagArr.splice(start, 1);
                    }
                }

                const description = await ctx.cache.tryGet(link, async () => {
                    const response = await got.get(link);
                    const $ = cheerio.load(response.data);
                    const regist_text = $('p.m-articleRegist_text');
                    if (regist_text.length > 0) {
                        tagArr.push('会員限定');
                    }
                    return $('div.cmn-article_text.a-cf.JSID_key_fonttxt.m-streamer_medium').html();
                });

                if (tagArr.length > 0) {
                    tag = '[' + tagArr.join(' ') + '] ';
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
        title: '日本経済新聞-' + categoryName,
        link: url,
        item: items,
    };
};
