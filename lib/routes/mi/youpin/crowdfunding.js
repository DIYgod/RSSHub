const axios = require('../../../utils/axios');
const utils = require('./utils');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://home.mi.com/lasagne/page/5',
    });

    const data = response.data.floors;

    ctx.state.data = {
        title: '小米有品众筹',
        link: 'https://home.mi.com/crowdfunding?&pageid=5',
        description: '小米有品众筹',
        item: utils.generateData(data),
    };
};
