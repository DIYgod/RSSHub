const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

const config = {
    community: {
        link: '/section/7fba65e45f678eb8c605d4107de04185',
        title: '社区管理',
    },
    university: {
        link: '/section/4fcab28694a0be93d9297d8cede052d9',
        title: '国内院校',
    },
    entertainment: {
        link: '/section/3497e48bb537373d0f738b41fe53a41b',
        title: '休闲娱乐',
    },
    location: {
        link: '/section/353fdfda1dfe7a714e592bab99c762cd',
        title: '五湖四海',
    },
    game: {
        link: '/section/c8d614e56acb8a192ec4af8b375a5eea',
        title: '游戏运动',
    },
    society: {
        link: '/section/5b634fdc9ecddf6042561c959176c077',
        title: '社会信息',
    },
    romance: {
        link: '/section/1c455a5dccf4242008d188f9676e3f4e',
        title: '知性感性',
    },
    culture: {
        link: '/section/12af235486fde6684e4b9e83f5d2b779',
        title: '文化人文',
    },
    science: {
        link: '/section/4ed7f0d8b621c8ccf9e11eca9991d6dc',
        title: '学术科学',
    },
    technology: {
        link: '/section/4dda79c64b3ffb61f8048d745292ff5d',
        title: '电脑技术',
    },
};

module.exports = async (ctx) => {
    const cfg = config[ctx.params.section];
    if (!cfg) {
        throw Error('Bad section. See <a href="https://docs.rsshub.app/bbs.html#shui-mu-she-qu-fen-qu-wen-zhang">docs</a>');
    }

    const rootUrl = `https://exp.newsmth.net/statistics/hot`;
    const currentUrl = `${rootUrl}${cfg.link}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);

    const list = $('ul.article-list li')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a.article-subject');
            const pubDate = date(item.find('div.article-account-name span').text());

            return {
                title: a.text(),
                link: `https://exp.newsmth.net${a.attr('href')}`,
                pubDate: pubDate,
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    item.description = content('div.show-content').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: cfg.title + ' - 水木社区',
        link: currentUrl,
        item: items,
    };
};
