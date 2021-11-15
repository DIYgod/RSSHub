import utils from './utils/js';

export default async (ctx) => {
    const keyword = ctx.params.keyword;
    const url = `https://dribbble.com/search/shots/recent?q=${keyword}`;

    const title = `Dribbble - keyword ${keyword}`;

    ctx.state.data = await utils.getData(ctx, url, title);
};
