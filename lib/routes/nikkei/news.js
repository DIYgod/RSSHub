const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const article_type = ctx.params.article_type;
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
    let iconElement = '';
    if (category === 'news') {
        categoryName = '総合';
        list = $('div.k-card.k-card--small.k-card--reverse,.k-card--headline').not('[data-rn-track="hub-ad-recommend"]').not('.k-hub-card--small-title');
        iconElement = 'li.k-card__icon';
    } else {
        categoryName = $('h1.l-miH11_title').text().trim();
        list = $('div#CONTENTS_MAIN').children('div.m-miM09').not('.PRa');
        iconElement = 'span.m-iconMember';
    }

    const deleteItems = [];
    const items = await Promise.all(
        list
            .map(async (index, item) => {
                item = $(item);
                let title = '';
                let link = '';
                const memberLimit = item.find(iconElement).length > 0;

                if (memberLimit && article_type === 'free') {
                    deleteItems.push(title);
                    return {
                        title,
                        description: '',
                        link,
                    };
                } else {
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

                    const tagArr = [];
                    if (categoryName === '総合') {
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
                        item.find('li.k-card__tag')
                            .children()
                            .each((index, item) => {
                                const tagPath = $(item).attr('href');
                                let tag = '';
                                if (tagPath.indexOf('?dw') >= 0) {
                                    tag = $('a[href="https://www.nikkei.com' + tagPath.replace('?', '/?') + '"]')
                                        .parent()
                                        .parent()
                                        .parent()
                                        .parent()
                                        .parent()
                                        .children('a')
                                        .text();
                                } else if (tagPath.indexOf('style') >= 0) {
                                    tag = 'ライフ';
                                } else {
                                    tag = tagTable[tagPath.split('/')[1]];
                                }
                                tag = tag ? tag : 'コラム';
                                if (tag !== 'トップ' && tagArr.indexOf(tag) < 0) {
                                    tagArr.push(tag);
                                }
                            });
                        const start = tagArr.indexOf('コラム');
                        if (start >= 0 && tagArr.length > 1) {
                            tagArr.splice(start, 1);
                        }
                    }
                    if (memberLimit) {
                        tagArr.push('会員限定');
                    }
                    if (tagArr.length > 0) {
                        title = '[' + tagArr.join(' ') + '] ' + title;
                    }

                    const description = await ctx.cache.tryGet(link, async () => {
                        const response = await got.get(link);
                        const $ = cheerio.load(response.data);
                        if ($('section.container_cz8tiun').length > 0) {
                            $('section.container_cz8tiun')
                                .find('figure')
                                .each((index, item) => {
                                    const imgSrc = $(item).attr('data-src-for-image-viewer');
                                    const $imgElement = $('<img src="' + imgSrc + '"/>');
                                    $(item).prepend($imgElement);
                                });
                            return $('section.container_cz8tiun').html();
                        } else {
                            return $('div.sc-54bcr2-2.jMNzyO').html();
                        }
                    });

                    return {
                        title,
                        description,
                        link,
                    };
                }
            })
            .get()
    );

    for (const deleteItem of deleteItems) {
        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            if (item.title === deleteItem) {
                items.splice(index, 1);
                break;
            }
        }
    }

    ctx.state.data = {
        title: '日本経済新聞-' + categoryName,
        link: url,
        item: items,
    };
};
