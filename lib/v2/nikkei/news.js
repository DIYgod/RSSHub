const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.nikkei.com';
    const { category, article_type = 'paid' } = ctx.params;
    let url = '';
    if (category === 'news') {
        url = `${baseUrl}/news/category/`;
    } else {
        url = `${baseUrl}/${category}/archive/`;
    }

    const response = await got(url);
    const data = response.data;
    const $ = cheerio.load(data);

    let categoryName = '';
    const listSelector = $('div#CONTENTS_MAIN').children('div.m-miM09').not('.PRa');
    const paidSelector = 'span.m-iconMember';

    let list = listSelector.toArray().map((item) => {
        item = $(item);
        item.find('p a').remove();
        return {
            title: item.find('.m-miM09_titleL').text(),
            link: `${baseUrl}${item.find('.m-miM09_title a').attr('href')}`,
            image: item.find('.m-miM09_thumb img').removeAttr('style').removeAttr('width').removeAttr('height').parent().html(),
            category: item
                .find('.m-miM09_keyword a')
                .toArray()
                .map((item) => $(item).text()),
            paywall: !!item.find(paidSelector).length,
        };
    });

    if (category === 'news') {
        categoryName = '総合';
        list = list.concat(
            $('div#CONTENTS_MAIN .m-miM32_itemTitle')
                .toArray()
                .map((item) => {
                    item = $(item);
                    const a = item.find('a').first();
                    return {
                        title: a.text(),
                        link: `${baseUrl}${a.attr('href')}`,
                        category: item
                            .find('.m-miM32_itemkeyword a')
                            .toArray()
                            .map((item) => $(item).text()),
                        paywall: !!item.find(paidSelector).length,
                    };
                })
        );
    } else {
        categoryName = $('h1.l-miH11_title').text().trim();
    }

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                $('.notFloated_n1oadkwi').remove();

                item.pubDate = parseDate($('meta[property="article:published_time"]').attr('content'));
                item.description = art(path.join(__dirname, 'templates/news.art'), {
                    item,
                    description: $('section[class^=container_]').html(),
                });

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '日本経済新聞 - ' + categoryName,
        description: $('meta[name="description"]').attr('content'),
        link: url,
        image: $('meta[property="og:image"]').attr('content'),
        language: 'ja',
        item: article_type === 'free' ? items.filter((item) => !item.paywall) : items,
    };
};
