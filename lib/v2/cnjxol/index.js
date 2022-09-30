const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const categories = {
    jxrb: '嘉兴日报',
    nhwb: '南湖晚报',
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'jxrb';
    const id = ctx.params.id;

    const rootUrl = `https://${category}.cnjxol.com`;
    const currentUrl = `${rootUrl}/${category}Paper/pc/layout`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    let $ = cheerio.load(response.data);
    const dateMatch = $('a')
        .first()
        .attr('href')
        .match(/\d{6}\/\d{2}/)[0];

    let items = [];

    if (id) {
        const pageUrl = `${currentUrl}/${dateMatch}/node_${id}.html`;

        const pageResponse = await got({
            method: 'get',
            url: pageUrl,
        });

        $ = cheerio.load(pageResponse.data);

        items = $('#articlelist .clearfix a')
            .toArray()
            .map((a) => `${currentUrl}/${$(a).attr('href')}`.replace(/layout\/\.\.\/\.\.\/\.\.\//g, ''));
    } else {
        await Promise.all(
            $('#list li a')
                .toArray()
                .map(async (p) => {
                    const pageResponse = await got({
                        method: 'get',
                        url: `${currentUrl}/${$(p).attr('href')}`,
                    });

                    const page = cheerio.load(pageResponse.data);

                    items.push(
                        ...page('#articlelist .clearfix a')
                            .toArray()
                            .map((a) => `${currentUrl}/${page(a).attr('href')}`.replace(/layout\/\.\.\/\.\.\/\.\.\//g, ''))
                    );
                })
        );
    }

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item,
                });

                const content = cheerio.load(detailResponse.data);

                return {
                    link: item,
                    title: content('#Title').text(),
                    pubDate: parseDate(content('date').text()),
                    description: art(path.join(__dirname, 'templates/description.art'), {
                        attachment: content('.attachment').html(),
                        content: content('founder-content').html(),
                    }),
                };
            })
        )
    );

    ctx.state.data = {
        title: `${categories[category]}${id ? ` - ${$('#layout').text()}` : ''}`,
        link: currentUrl,
        item: items,
    };
};
