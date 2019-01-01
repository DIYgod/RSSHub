const axios = require('../../utils/axios');
const { load } = require('cheerio');

exports.getPage = async (url) => {
    const { data } = await axios.get(url);
    const $ = load(data);

    const pageTitle = `JavBus - ${$('head > title')
        .text()
        .replace(' - JavBus', '')}`;

    return {
        title: pageTitle,
        link: url,
        description: pageTitle,
        item: parseItems($),
    };
};

exports.createHandler = (url) => async (ctx) => {
    ctx.state.data = await exports.getPage(url);
};

const parseItems = ($) =>
    $('.movie-box')
        .map((_, ele) => ({
            title: $(ele)
                .find('img')
                .attr('title'),
            thumb: $(ele)
                .find('img')
                .attr('src'),
            link: $(ele).attr('href'),
            pubDate: new Date(
                $(ele)
                    .find('date:nth-child(4)')
                    .text()
            ).toUTCString(),
            aid: $(ele)
                .find('date:nth-child(3)')
                .text(),
        }))
        .toArray()
        .map(render);

const render = ({ title, thumb, link, pubDate, aid }) => ({
    title,
    link,
    pubDate,
    description: `
        <h1>${aid} - ${title}</h1>
        <br />
        <img referrerpolicy="no-referrer" src="${thumb.replace(/\/thumbs?\//, '/cover/').replace('.jpg', '_b.jpg')}" />
    `.trim(),
});
