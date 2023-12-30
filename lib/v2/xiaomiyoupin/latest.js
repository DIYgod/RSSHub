const got = require('@/utils/got');
const { parseModule, parseFloorItem } = require('./utils');

module.exports = async (ctx) => {
    const response = await got('https://m.xiaomiyoupin.com/homepage/main/v1005');
    const floors = parseModule(response.data.data.homepage.floors, 'product_hot');
    const items = parseFloorItem(floors);

    ctx.state.data = {
        title: '小米有品每日上新',
        link: 'https://m.xiaomiyoupin.com/w/newproduct?pageid=1605',
        description: '小米有品每日上新',
        item: items,
    };
};
