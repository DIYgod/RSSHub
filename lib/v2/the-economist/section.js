const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.economist.com';
    const section = ctx.params.section;
    const curUrl = `${rootUrl}/${section}`;

    const response = await got({
        method: 'get',
        url: curUrl,
    });
    const $ = cheerio.load(response.data);

    function fix_url(href, domain = rootUrl) {
        if (href.startsWith(domain)) {
            return href;
        } else {
            const sub_href = href.substring(`/${section}`.length);
            return `${domain}/${section}${sub_href}`;
        }
    }

    const list = $('[data-test-id="Article Teaser"]')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.find('h2 a .teaser__headline').text(),
                subtitle: item.find('h2 a .teaser__subheadline').text(),
                link: item.find('h2 a').attr('href'),
                fixed_link: fix_url(item.find('h2 a').attr('href')),
                pic: item.find('img').attr('src'),
                desc: item.find('[data-test-id="Description"]').text(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: fix_url(item.link),
                });
                const content = cheerio.load(detailResponse.data);
                item.description = content('[data-test-id="Article"]').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `the economist - ${section}`,
        link: curUrl,
        item: items,
    };

    ctx.state.json = {
        // list,
        items,
    };
};
