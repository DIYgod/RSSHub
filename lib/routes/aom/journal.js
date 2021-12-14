const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'https://journals.aom.org';

const config = {
    annals: {
        title: 'Academy of Management Annals',
        link: `${rootUrl}/journal/annals`,
    },
    amd: {
        title: 'Academy of Management Discoveries',
        link: `${rootUrl}/journal/amd`,
    },
    amgblproc: {
        title: 'Academy of Management Global Proceedings',
        link: `${rootUrl}/toc/amgblproc/current`,
    },
    amj: {
        title: 'Academy of Management Journal',
        link: `${rootUrl}/journal/amj`,
    },
    amle: {
        title: 'Academy of Management Learning & Education',
        link: `${rootUrl}/journal/amle`,
    },
    amp: {
        title: 'Academy of Management Perspectives',
        link: `${rootUrl}/journal/amp`,
    },
    amproc: {
        title: 'Academy of Management Proceedings',
        link: `${rootUrl}/toc/amproc/current`,
    },
    amr: {
        title: 'Academy of Management Review',
        link: `${rootUrl}/toc/amr/0`,
    },
};

module.exports = async (ctx) => {
    const cfg = config[ctx.params.id];
    if (!cfg) {
        throw Error('Bad id. See <a href="https://docs.rsshub.app/journal.html#academy-of-management-journal">docs</a>');
    }

    const currentUrl = cfg.link;

    const firstResponse = await got({
        method: 'get',
        url: rootUrl,
    });

    const headers = {
        cookie: `JSESSIONID=${firstResponse.headers['set-cookie'].join(' ').match(/JSESSIONID=(\S+);/)[1]}`,
    };

    const response = await got({
        method: 'get',
        url: currentUrl,
        headers,
    });
    const $ = cheerio.load(response.data);

    $('div[data-widget-def="topContentActionWidget"]').eq(2).remove();
    $('div[data-widget-def="topContentActionWidget"]').eq(1).remove();

    const list = $('h5')
        .not('.border-top')
        .map((_, item) => {
            item = $(item);
            const a = item.parent().get(0).tagName === 'a' ? item.parent() : item.find('a');
            return {
                title: a.attr('title'),
                link: `${rootUrl}${a.attr('href')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    headers,
                });
                const content = cheerio.load(detailResponse.data);

                content('.author-info').remove();

                item.author = content('.loa-accordion').text();
                item.doi = content('meta[name="dc.Identifier"]').attr('content');
                item.description = content('.abstractInFull').html();
                item.pubDate = new Date(content('meta[name="dc.Date"]').attr('content')).toUTCString();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: cfg.title,
        link: currentUrl,
        item: items,
    };
};
