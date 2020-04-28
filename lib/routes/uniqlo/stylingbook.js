const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://style.uniqlo.com/api/v2/styleSearch.json?dptId=women&lang=en&limit=50&locale=my&offset=0`,
    });

    const data = response.data.result.styles;

    ctx.state.data = {
        title: `Uniqlo styling book`,
        link: `https://www.uniqlo.com/my/stylingbook/pc/women`,
        description: `Uniqlo styling book`,
        //遍历此前获取的数据
        item: data.map((item) => ({
            // 文章标题
            title: item.styleId,
            // 文章正文
            description: `<img src="${item.styleImgUrl}">`,
            // 文章链接
            link: `https://www.uniqlo.com/my/stylingbook/pc/style/` + item.styleId,
        })),
    };
};
