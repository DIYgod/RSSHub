const got = require('@/utils/got');

function generateExhibitionItem(result) {
    return {
        title: result.title,
        link: `https://www.metmuseum.org${result.url}`,
        description: result.description,
        pubDate: result.startDate,
        guid: result.id,
    };
}

module.exports = async (ctx) => {
    const searchType = ctx.query.searchType ? ctx.query.searchType : 'current';

    const url = `https://www.metmuseum.org/ghidorah/ExhibitionListing/Search?searchType=${searchType}`;

    const response = await got({
        url,
        method: 'GET',
        insecureHTTPParser: true,
    });

    const data = response.data.data;

    ctx.state.data = {
        title: 'The Metropolitan Museum of Art - Exhibitions',
        link: 'https://www.metmuseum.org/exhibitions',
        item: data.results.map(generateExhibitionItem),
    };
};
