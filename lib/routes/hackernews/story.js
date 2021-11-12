const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://news.ycombinator.com';
const paths = {
    index: '/',
    new: '/newest',
    past: '/front',
    ask: '/ask',
    show: '/show',
    jobs: '/jobs',
    best: '/best',
};

module.exports = async (ctx) => {
    const section = ctx.params.section;
    const showStory = ctx.params.type !== 'comments';
    const path = paths[section];
    const url = `${host}${path}`;
    const response = await got.get(url);
    const $ = cheerio.load(response.data);

    const items = $('a.storylink')
        .map(function () {
            return {
                title: $(this).text(),
                link: $(this).attr('href'),
                author: 'Hacker News',
                description: '',
            };
        })
        .get();

    $('a.hnuser').each(function (i) {
        items[i].author = $(this).text();
    });

    $('tr.athing').each(function (i) {
        const commURL = `${host}/item?id=` + $(this).attr('id');
        const item = items[i];

        if (showStory) {
            item.description = `Comments: <a href="${commURL}"> ${commURL} </a>`;
        } else {
            item.description = `Link: <a href="${item.link}"> ${item.title} </a>`;
            item.link = commURL;
        }
    });

    let title = `Hacker News: ${section}`;
    if (!showStory) {
        title += '/comments';
    }

    ctx.state.data = {
        title,
        link: url,
        item: items,
    };
};
