const axios = require('../../../utils/axios');
const utils = require('./utils');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://home.mi.com/lasagne/page/4',
    });

    const data = response.data.floors;

    ctx.state.data = {
        title: '小米有品每日上新',
        link: 'https://home.mi.com/newproduct?pageid=4',
        description: '小米有品每日上新',
        item: utils.generateData(data),
    };
};
