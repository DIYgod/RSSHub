const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const root_url = 'https://www.chinatimes.com';

const config = {
    realtimenews: {
        link: '/realtimenews/?chdtv',
        title: 'China Times - Real Time News',
    },
    politic: {
        link: '/politic/?chdtv',
        title: 'China Times - Politic',
    },
    opinion: {
        link: '/opinion/?chdtv',
        title: 'China Times - Opinion',
    },
    life: {
        link: '/life/?chdtv',
        title: 'China Times - Life',
    },
    star: {
        link: '/star/?chdtv',
        title: 'China Times - Showbiz',
    },
    money: {
        link: '/money/?chdtv',
        title: 'China Times - Finance',
    },
    society: {
        link: '/society/?chdtv',
        title: 'China Times - Society',
    },
    hottopic: {
        link: '/hottopic/?chdtv',
        title: 'China Times - Hot Topics',
    },
    tube: {
        link: '/tube/?chdtv',
        title: 'China Times - Videos',
    },
    world: {
        link: '/world/?chdtv',
        title: 'China Times - World',
    },
    armament: {
        link: '/armament/?chdtv',
        title: 'China Times - Military',
    },
    chinese: {
        link: '/chinese/?chdtv',
        title: 'China Times - Mainland & Taiwan',
    },
    fashion: {
        link: '/fashion/?chdtv',
        title: 'China Times - Fashion',
    },
    sports: {
        link: '/sports/?chdtv',
        title: 'China Times - Sports',
    },
    technologynews: {
        link: '/technologynews/?chdtv',
        title: 'China Times - Technology News',
    },
    travel: {
        link: '/travel/?chdtv',
        title: 'China Times - Travel',
    },
    album: {
        link: '/album/?chdtv',
        title: 'China Times - Columns',
    },
};

module.exports = async (ctx) => {
    const cfg = config[ctx.params.caty];
    if (!cfg) {
        throw Error('Bad category. See <a href="https://docs.rsshub.app/traditional-media.html#zhong-shi-dian-zi-bao">https://docs.rsshub.app/traditional-media.html#zhong-shi-dian-zi-bao</a>');
    }

    const current_url = url.resolve(root_url, cfg.link);
    const response = await got({
        method: 'get',
        url: current_url,
    });

    const $ = cheerio.load(response.data);
    const list = $('section.article-list ul div.row')
        .map((_, item) => {
            item = $(item);
            const right = item.find('div.col');
            const a = right.find('h3.title a');
            const img = item.find('img.photo').attr('src');
            let desc = '<p>' + right.find('p.intro').text() + '...</p>';
            if (img) {
                desc = `<p><img src="${img}"></p>` + desc;
            }
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: new Date(right.find('div.meta-info time').attr('datetime') + ' GMT+8').toUTCString(),
                description: desc,
            };
        })
        .get();

    ctx.state.data = {
        title: cfg.title,
        link: current_url,
        item: list,
    };
};
