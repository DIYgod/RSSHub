import utils from './utils.js';

export default async (ctx) => {
    ctx.state.data = await utils.getData({
        site: ctx.params.language === 'chinese' ? 'www' : 'big5',
        channel: ctx.params.channel,
    });
};
