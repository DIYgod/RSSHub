const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const lang = ctx.params.language;

    let index_url;
    let character_set;
    switch (lang) {
        case 'zh_tw':
            index_url = 'http://www.soomal.com/doc/index201000_0001_00.htm';
            character_set = 'big5';
            break;
        case 'en':
            index_url = 'http://eng.soomal.com/edoc/index101000_0001_00.htm';
            character_set = 'ISO-8859-5';
            break;
        default:
            index_url = 'http://www.soomal.com/doc/index101000_0001_00.htm';
            character_set = 'gbk';
            break;
    }

    let category_list;
    let url_list;

    const category_url = await ctx.cache.tryGet([lang, category], async () => {
        const front_page = await got.get(index_url, {
            responseType: 'buffer',
        });

        const front_data = iconv.decode(front_page.data, character_set);

        const $ = cheerio.load(front_data);
        if (lang !== 'en') {
            const container_list = $('div.container.cf').slice(0, 2);
            category_list = container_list
                .find('ul.ul-reset')
                .find('h3')
                .children()
                .get()
                .map((item) => $(item).text());
            url_list = container_list
                .find('ul.ul-reset')
                .find('h3')
                .children()
                .get()
                .map((item) => $(item).attr('href'));
        } else {
            category_list = $('div.menu')
                .find('a')
                .get()
                .map((item) => $(item).text());
            url_list = $('div.menu')
                .find('a')
                .get()
                .map((item) => $(item).attr('href'));
        }

        return url.resolve(index_url, url_list[category_list.indexOf(category)]);
    });

    const response = await got.get(category_url, {
        responseType: 'buffer',
    });

    const data = iconv.decode(response.data, character_set);
    const $ = cheerio.load(data);

    const list = $('div.item')
        .find('div.title')
        .children('a')
        .get()
        .map((item) => url.resolve(category_url, $(item).attr('href')));

    const out = await Promise.all(
        list.map(async (link) => {
            const [title, author, pubDate, description] = await ctx.cache.tryGet(link, async () => {
                const response = await got.get(link, {
                    responseType: 'buffer',
                });

                const data = iconv.decode(response.data, character_set);
                const $ = cheerio.load(data);

                let [title, author, pubDate, description] = '';
                if (lang !== 'en') {
                    title = $('div.titlebox').find('div.title').text();
                    author = $('div.titlebox').find('div.info').children('a').text();
                    pubDate = Date.parse(
                        $('div.titlebox')
                            .find('div.info')
                            .text()
                            .match(/\d{4}([.\-/ ])\d{2}\1\d{2}\s\d{2}[:]\d{2}[:]\d{2}/)[0]
                    );

                    $('div.toolbar,div.grade').remove();
                    description = $('div.Doc').html();
                } else {
                    title = $('div.titlebox').find('div.title').text();
                    author = $('div.titlebox').find('div.infobox').children('a').text();
                    pubDate = new Date();

                    $('div.grade').remove();
                    description = $('div.textbox').html();
                }

                return [title, author, pubDate, description];
            });

            const item = {
                title: title,
                description: description,
                pubDate: pubDate,
                link: link,
                author: author,
            };
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: 'Soomal.com - ' + category,
        link: category_url,
        item: out,
    };
};
