const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const languages = {
    english: 'https://sputniknews.com',
    spanish: 'https://mundo.sputniknews.com',
    german: 'https://snanews.de',
    french: 'https://fr.sputniknews.com',
    greek: 'https://sputniknews.gr',
    italian: 'https://it.sputniknews.com',
    czech: 'https://cz.sputniknews.com',
    polish: 'https://pl.sputniknews.com',
    serbian: 'https://rs.sputniknews.com',
    latvian: 'https://sputniknewslv.com',
    lithuanian: 'https://lt.sputniknews.com',
    moldavian: 'https://md.sputniknews.com',
    belarusian: 'https://bel.sputnik.by',
    armenian: 'https://armeniasputnik.am',
    abkhaz: 'https://sputnik-abkhazia.info',
    ssetian: 'https://sputnik-ossetia.com',
    georgian: 'https://sputnik-georgia.com',
    azerbaijani: 'https://sputnik.az',
    arabic: 'https://arabic.sputniknews.com',
    turkish: 'https://tr.sputniknews.com',
    persian: 'https://ir.sputniknews.com',
    dari: 'https://af.sputniknews.com',
    kazakh: 'https://sputniknews.kz',
    kyrgyz: 'https://kg.sputniknews.com',
    uzbek: 'https://oz.sputniknews-uz.com',
    tajik: 'https://sputnik-tj.com',
    vietnamese: 'https://vn.sputniknews.com',
    japanese: 'https://jp.sputniknews.com',
    chinese: 'http://sputniknews.cn',
    portuguese: 'https://br.sputniknews.com',
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'news';
    const language = ctx.params.language ?? 'english';

    const rootUrl = languages[language];
    const currentUrl = `${rootUrl}/services/${category}/more.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.list__title')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.pubDate = parseDate(content('a[data-unixtime]').attr('data-unixtime') * 1000);

                item.category = content('.tag__text')
                    .toArray()
                    .map((tag) => content(tag).text());

                content('.article__meta, .article__title, .article__info, .article__quote-bg, .article__google-news, .article__footer, .m-buy, .photoview__ext-link').remove();
                content('div[data-type="article"]').remove();

                item.description = content('.article').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${category} - Sputnik News`,
        link: `${rootUrl}/${category}`,
        item: items,
    };
};
