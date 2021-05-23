const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://gre.economist.com/api/gre-vocabulary.json',
    });

    const wordInfo = response.data[0];
    const time = wordInfo.publishedDate;

    ctx.state.data = {
        title: 'The Economist GRE Vocabulary',
        link: 'https://gre.economist.com/gre-vocabulary',
        item: [
            {
                title: `${wordInfo.word} - ${time}`,
                description: `
                    <img src="${wordInfo.image.url}"><br>
                    Source: <a href="${wordInfo.sourceUrl}">${wordInfo.sourceTitle}</a>
                `,
                pubDate: new Date(time).toUTCString(),
                link: wordInfo.url,
            },
        ],
    };
};
