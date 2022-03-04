const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { aid, sortType, count = 10 } = ctx.params;

    const response = await got(`https://ieeexplore.ieee.org/rest/author/${aid}`);
    const author = response.data[0];

    const { data: papers } = await got.post('https://ieeexplore.ieee.org/rest/search', {
        json: {
            rowsPerPage: count,
            searchWithin: [`"Author Ids": ${aid}`],
            sortType,
        },
    });

    ctx.state.data = {
        title: `${author.preferredName} on IEEE Xplore`,
        link: `https://ieeexplore.ieee.org/author/${aid}`,
        description: author.bioParagraphs.join('<br/>'),
        item: papers.records.map((item) => ({
            title: item.articleTitle,
            author: item.authors.map((author) => author.preferredName).join(', '),
            category: item.articleContentType,
            description: item.abstract,
            pubDate: item.publicationDate,
            link: `https://ieeexplore.ieee.org${item.documentLink}`,
        })),
    };
};
