const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const response = await got('https://www.nintendo.com/nintendo-direct/archive/');
    const data = response.data;

    const $ = cheerio.load(data);
    const nextData = JSON.parse($('script#__NEXT_DATA__').text());

    delete nextData.props.pageProps.initialApolloState.ROOT_QUERY;
    const result = Object.values(nextData.props.pageProps.initialApolloState).map((item) => ({
        title: item.name,
        pubDate: parseDate(item.startDate),
        link: `https://www.nintendo.com/nintendo-direct/${item.slug}/`,
        description: art(path.join(__dirname, 'templates/direct.art'), {
            publicId: item.thumbnail.publicId,
            content: item.description.json.content,
        }),
    }));

    ctx.state.data = {
        title: 'Nintendo Direct（任天堂直面会）',
        link: 'https://www.nintendo.com/nintendo-direct/archive/',
        description: '最新的任天堂直面会日程信息',
        item: result,
    };
};
