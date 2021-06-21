const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'http://k2k.sagawa-exp.co.jp/p/sagawa/web/okurijoinput.jsp';

    let response = await got({
            method: 'get',
            url: rootUrl,
        }),
        $ = cheerio.load(response.data);

    response = await got({
        method: 'post',
        url: rootUrl,
        form: {
            jsf_tree_64: $('#jsf_tree_64').attr('value'),
            jsf_state_64: $('#jsf_state_64').attr('value'),
            jsf_viewid: '/web/okurijoinput.jsp',
            'main:no1': ctx.params.id,
            'main:no2': '',
            'main:no3': '',
            'main:no4': '',
            'main:no5': '',
            'main:no6': '',
            'main:no7': '',
            'main:no8': '',
            'main:no9': '',
            'main:no10': '',
            'main:correlation': 1,
            'main:toiStart': 'Track it',
            main_SUBMIT: 1,
            'main:_link_hidden_': '',
        },
    });

    $ = cheerio.load(response.data);

    let items = $('.table_okurijo_detail2').eq(1).find('tr').slice(1);

    items = items
        .map((index, item) => {
            item = $(item);
            const td = item.find('td');

            let pubDate = td.eq(1).text();
            if (pubDate.length === 79) {
                pubDate = `${new Date().getFullYear()}/${td.eq(1).text()}`;
            }

            const description = index === items.length - 1 ? `<p>${$('.ttl02 tbody tr').eq(1).text().replace('　　', '')}</p>` : '';

            return {
                link: rootUrl,
                title: `${td.eq(1).text()} ${td.eq(0).text()} ${td.eq(2).text()}`,
                pubDate: new Date(pubDate + ' GMT+9').toUTCString(),
                description,
            };
        })
        .get();

    ctx.state.data = {
        title: `佐川急便 - ${ctx.params.id}`,
        link: rootUrl,
        item: items,
    };
};
