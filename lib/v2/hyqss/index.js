const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'hyrb';
    const isDaily = type === 'hyrb';

    const id = ctx.params.id;

    const rootUrl = 'http://epaper.hyqss.cn';
    const currentUrl = `${rootUrl}${isDaily ? '' : `/${type}`}`;

    let response = await got({
        method: 'get',
        url: currentUrl,
    });

    const url = response.data.match(/URL=(.*)"/)[1];

    response = await got({
        method: 'get',
        url: `${currentUrl}/${id ? url.replace(/node_\d+\.htm/, `node_19${isDaily ? '62' : '74'}${id}.htm`) : url}`,
    });

    const $ = cheerio.load(response.data);

    const matches = url.match(/html\/(.*)\/node/);
    const link = `${rootUrl}/${isDaily ? '' : 'hywb/'}html/${matches[1]}`;

    let items = $('#main-ed-articlenav-list')
        .first()
        .find('a')
        .toArray()
        .map((a) => `${link}/${$(a).attr('href')}`);

    if (!id) {
        await Promise.all(
            $('#bmdhTable')
                .find('#pageLink')
                .toArray()
                .map((p) => `${link}/${$(p).attr('href')}`)
                .map(async (p) => {
                    const pageResponse = await got({
                        method: 'get',
                        url: p,
                    });

                    const page = cheerio.load(pageResponse.data);

                    items.push(
                        ...page('#main-ed-articlenav-list')
                            .first()
                            .find('a')
                            .toArray()
                            .map((a) => `${link}/${page(a).attr('href')}`)
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
                    title: content('.font01').text(),
                    description: content('#ozoom').html(),
                    pubDate: timezone(parseDate(matches[1], 'YYYY-MM/DD'), +8),
                };
            })
        )
    );

    ctx.state.data = {
        title: `衡阳${isDaily ? '日' : '晚'}报${id ? ` - ${$('strong').first().parent().text()}` : ''}`,
        link: currentUrl,
        item: items,
        allowEmpty: true,
    };
};
