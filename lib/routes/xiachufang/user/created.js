const { generateUserData } = require('../utils');

export default async (ctx) => {
    ctx.state.data = await generateUserData({
        id: ctx.params.id,
        path: 'created',
    });
};
