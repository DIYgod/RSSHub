const got = require('@/utils/got');
const url = require('url');

const rootUrl = 'https://www.kaggle.com/';

const categoryCodes = {
    '': 'All Categories',
    featured: 'Featured',
    research: 'Research',
    recruitment: 'Recruitment',
    gettingStarted: 'Getting started',
    masters: 'Masters',
    playground: 'Playground',
    analytics: 'Analytics',
};

module.exports = async (ctx) => {
    const category = ctx.params.category || '';
    const categoryText = categoryCodes[category];

    const response = await got({
        method: 'get',
        url: `https://www.kaggle.com/competitions.json?sortBy=grouped&group=general&page=1&pageSize=20&category=${category}`,
        headers: {
            Referer: rootUrl,
        },
    });

    const competitions = response.data.fullCompetitionGroups[1].competitions;
    const out = competitions.map((item) => {
        const title = item.competitionTitle;
        const description = item.competitionDescription;
        const author = item.organizationName;
        const itemUrl = url.resolve(rootUrl, item.competitionUrl);

        const single = {
            link: itemUrl,
            title,
            author,
            description,
        };

        return single;
    });

    ctx.state.data = {
        title: `new competition-${categoryText}`,
        link: 'https://www.kaggle.com/competitions',
        item: out,
    };
};
