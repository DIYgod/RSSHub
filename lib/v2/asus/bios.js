const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const getProductID = async (model) => {
    const searchAPI = `https://odinapi.asus.com.cn/recent-data/apiv2/SearchSuggestion?SystemCode=asus&WebsiteCode=cn&SearchKey=${model}&SearchType=ProductsAll&RowLimit=4&sitelang=cn`;
    const response = await got(searchAPI);

    return {
        productID: response.data.Result[0].Content[0].DataId,
        url: response.data.Result[0].Content[0].Url,
    };
};

module.exports = async (ctx) => {
    const model = ctx.params.model;
    const { productID, url } = await getProductID(model);
    const biosAPI = `https://www.asus.com.cn/support/api/product.asmx/GetPDBIOS?website=cn&model=${model}&pdid=${productID}&sitelang=cn`;

    const response = await got(biosAPI);
    const biosList = response.data.Result.Obj[0].Files;

    const items = biosList.map((item) => ({
        title: item.Title,
        description: art(path.join(__dirname, 'templates/bios.art'), {
            item,
        }),
        guid: url + item.Version,
        pubDate: parseDate(item.ReleaseDate, 'YYYY/MM/DD'),
        link: url,
    }));

    ctx.state.data = {
        title: `${model} BIOS`,
        link: url,
        item: items,
    };
};
