const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://gre.economist.com/api/keywords.json',
    });

    const word = response.data;

    ctx.state.data = {
        title: 'The Economist GRE Vocabulary',
        link: 'https://gre.economist.com/gre-advice/gre-vocabulary/which-words-study/most-common-gre-vocabulary-list-organized-difficulty',
        item: word.map((item) => ({
            title: item,
            description: item,
        })),
    };
};
