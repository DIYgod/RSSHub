const got = require('@/utils/got');

module.exports = async (ctx) => {
    const category = ctx.params.category ? ctx.params.category : 'women';
    const url = `https://style.uniqlo.com/api/v2/styleSearch.json?dptId=${category}&lang=en&limit=50&locale=my&offset=0`;

    const response = await got({
        method: 'get',
        url: url,
    });

    const data = response.data.result.styles;

    ctx.state.data = {
        title: `Uniqlo styling book`,
        link: `https://www.uniqlo.com/my/stylingbook/pc/${category}`,
        description: `Uniqlo styling book`,
        item: data.map((item) => ({
            title: item.styleId,
            description: `<img src="${item.styleImgUrl}">`,
            link: `https://www.uniqlo.com/my/stylingbook/pc/style/` + item.styleId,
        })),
    };
};
