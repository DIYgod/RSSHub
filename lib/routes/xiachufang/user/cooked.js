import {generateUserData} from '../utils.js';

export default async (ctx) => {
    ctx.state.data = await generateUserData({
        id: ctx.params.id,
        path: 'cooked',
    });
};
