const got = require('@/utils/got');
const cheerio = require('cheerio');

const config = {
    this: '2037295071',
    back: '2330861071',
    next: '2037296071',
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'this';

    const node = config[type];
    if (!node) {
        throw Error('Bad type. See <a href="https://docs.rsshub.app/reading.html#kindle-unlimited-hui-yuan-xian-shi-mian-fei-du-shu-dan">docs</a>');
    }

    const rootUrl = `https://www.amazon.cn/b?node=${node}`;
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('.apb-browse-searchresults-product .a-spacing-top-small a')
        .map((_, item) => {
            item = $(item);
            return {
                link: 'https://www.amazon.cn' + item.attr('href'),
                title: item.text().trim(),
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

                item.author = content('span.author').text();
                item.description = content('#ebooks-img-canvas').html() + content('#detailBullets_feature_div').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `KU会员限时免费读 - ${$('title').text().split('-')[1]}`,
        link: rootUrl,
        item: items,
    };
};
