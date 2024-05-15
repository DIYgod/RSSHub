const { generateUserData } = require('../utils');

module.exports = async (ctx) => {
    ctx.state.data = await generateUserData({
        id: ctx.params.id,
        path: 'cooked',
    });
};
