import utils from './utils.js';

export default async (ctx) => {
    const {
        name
    } = ctx.params;
    const url = `https://dribbble.com/${name}`;

    const title = `Dribbble - user ${name}`;

    ctx.state.data = await utils.getData(ctx, url, title);
};
