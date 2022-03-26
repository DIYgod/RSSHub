const got = require('@/utils/got');
const cheerio = require('cheerio');

const categories = {
    obituaries: '/obituaries',
    yoron: '/politics/yoron',
    baseball: '/sports/baseball',
    soccer: '/sports/soccer',
    sumo: '/sports/sumo',
    winter_figureskate: '/sports/winter/figureskate',
    golf: '/sports/golf',
    general: '/sports/general',
    olympics: '/olympics',
    paralympics: '/paralympics',
    eco: '/eco',
    igo: '/igo',
    shougi: '/shougi',
    eldercare: '/national/eldercare',
    hataraku: '/special/hataraku',
    food: '/culture/food',
    gassho: '/edu/gassho',
    suisogaku: '/edu/suisogaku',
    hagukumu: '/edu/hagukumu',
    msta: '/msta',
};

module.exports = async (ctx) => {
    const genre = ctx.params.genre || '';
    const category = ctx.params.category || '';

    const rootUrl = 'https://www.asahi.com';
    let currentUrl;
    if (genre) {
        if (category) {
            if (category in categories) {
                currentUrl = `${rootUrl}${categories[category]}`;
            } else {
                currentUrl = `${rootUrl}/${genre}/list/${category}.html`;
            }
        } else {
            currentUrl = `${rootUrl}/${genre}`;
        }
    } else {
        currentUrl = `${rootUrl}${'/news/history.html'}`;
    }

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('.Time').remove();

    const list = $('#MainInner .Section .List li a')
        .slice(0, 6)
        .map((_, item) => {
            item = $(item);
            const link = item.attr('href');

            return {
                link: link.indexOf('//') < 0 ? `${rootUrl}${link}` : `https:${link}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                content('._30SFw, .-Oj2D, .notPrint').remove();

                item.description = content('._3YqJ1').html();
                item.title = content('meta[name="TITLE"]').attr('content');
                item.pubDate = Date.parse(content('meta[name="pubdate"]').attr('content'));

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
        description: '朝日新聞社のニュースサイト、朝日新聞デジタルの社会ニュースについてのページです',
    };
};
