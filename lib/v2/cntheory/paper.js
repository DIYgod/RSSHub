const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'http://paper.cntheory.com';

    let response = await got({
        method: 'get',
        url: rootUrl,
    });

    response = await got({
        method: 'get',
        url: `${rootUrl}/${id ? response.data.match(/URL=(.*)"/)[1].replace(/xxsb_\w+\.htm$/, `xxsb_${id}.htm`) : response.data.match(/URL=(.*)"/)[1]}`,
    });

    const $ = cheerio.load(response.data);

    const matches = response.data.match(/images\/(\d{4}-\d{2}\/\d{2})\/\w+\/\w+_brief/);
    const link = `${rootUrl}/html/${matches[1]}`;

    let items = $('table')
        .last()
        .find('a')
        .toArray()
        .map((a) => `${link}/${$(a).attr('href')}`);

    if (!id) {
        await Promise.all(
            $('#pageLink')
                .toArray()
                .map((p) => `${link}/${$(p).attr('href').replace(/\.\//, '')}`)
                .map(async (p) => {
                    const pageResponse = await got({
                        method: 'get',
                        url: p,
                    });

                    const page = cheerio.load(pageResponse.data);

                    items.push(
                        ...page('table')
                            .last()
                            .find('a')
                            .toArray()
                            .map((a) => `${link}/${$(a).attr('href')}`)
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
                    title: content('h1').text(),
                    pubDate: parseDate(matches[1], 'YYYY-MM/DD'),
                    enclosure_url: `${rootUrl}${
                        content('.ban_t a')
                            .first()
                            .attr('href')
                            .match(/(\/images.*)/)[1]
                    }`,
                    description: art(path.join(__dirname, 'templates/description.art'), {
                        resource: content('#reslist')
                            .html()
                            .replace(/display:none;/g, ''),
                        description: content('founder-content').html(),
                    }),
                };
            })
        )
    );

    ctx.state.data = {
        title: `学习时报${id ? ` - ${$('.l_t').first().text()}` : ''}`,
        link: rootUrl,
        item: items,
    };
};
