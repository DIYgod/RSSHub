const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const apiForCategory = 'https://community-api.tesla.cn/api/category?type=2';
    const category = await got(apiForCategory);
    let catagoryId = '';
    if (ctx.params.category) {
        const target = category.data.data.filter((item) => item.name === ctx.params.category)[0];
        if (target) {
            catagoryId = target.id || '';
            ctx.state.data = target.name;
        }
    }
    const pageParams = {
        pageSize: 10,
        pageNumber: 0,
        ifShowInBenefitList: true,
    };
    const apiForList = 'https://community-api.tesla.cn/api/voucherpackage/merchant';
    const itemList = await got(apiForList, { searchParams: { benefitCategoryId: catagoryId, ...pageParams } });
    ctx.state.data = {
        title: 'Tesla权益中心',
        link: 'https://cx.tesla.cn/user-right/list/',
        item: itemList.data.data.pageDatas.map((item) => ({
            guid: item.id,
            title: item.title,
            link: `https://cx.tesla.cn/user-right/detail/${item.id}`,
            author: 'Tesla',
            category: item.categories,
            pubDate: parseDate(item.publishedAt),
            description: item.description,
        })),
    };
};
