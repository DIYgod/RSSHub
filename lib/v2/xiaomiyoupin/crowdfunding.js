const { parseModule, parseFloorItem } = require('./utils');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got('https://m.xiaomiyoupin.com/homepage/main/v1005');
    const floors = parseModule(response.data.data.homepage.floors, 'crowd_funding');
    const items = parseFloorItem(floors);

    ctx.state.data = {
        title: '小米有品众筹',
        link: floors.jump_url,
        description: '小米有品众筹',
        item: items,
    };
};
