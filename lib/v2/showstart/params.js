const { TITLE, HOST } = require('./const');
const { fetchCityList, fetchStyleList } = require('./service');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    switch (type) {
        case 'city':
            ctx.state.data = {
                title: `${TITLE} - 演出城市`,
                link: `HOST`,
                item: await fetchCityList(),
            };
            break;
        case 'style':
            ctx.state.data = {
                title: `${TITLE} - 演出风格`,
                link: HOST,
                item: await fetchStyleList(),
            };
            break;
    }
};
