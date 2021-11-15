import url from 'url';
import got from '~/utils/got.js';
import cheerio from 'cheerio';

const root_url = 'https://emi-nitta.net';

const config = {
    updates: {
        link: '/updates',
        title: 'Emi Nitta - Updates',
        description: 'Recent update of Emi Nitta official website',
    },

    news: {
        link: '/contents/news',
        title: 'Emi Nitta - News',
        description: 'News of Emi Nitta',
    },
};

const get_date = (o) => {
    let date;
    const match = /(\d{4}\.\d+\.\d+)/.exec(o.text().trim());
    if (match) {
        [, date] = match;
    } else {
        date = o.attr('datetime');
    }
    return new Date(date + ' GMT+9').toUTCString();
};

export default async (ctx) => {
    const cfg = config[ctx.params.type];
    if (!cfg) {
        throw Error('Bad type');
    }

    const response = await got({
        method: 'get',
        url: url.resolve(root_url, cfg.link),
    });

    const $ = cheerio.load(response.data);
    const list = $('article.details ul.list-unstyled li a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.find('div.title h3').text(),
                link: item.attr('href'),
                pubDate: get_date(item.find('time')),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet('emi-nitta' + item.link, async () => {
                const res = await got({ method: 'get', url: url.resolve(root_url, item.link) });
                const content = cheerio.load(res.data);

                item.description = content('article.details div.body').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: cfg.title,
        description: cfg.description,
        link: root_url,
        item: items,
    };
};
