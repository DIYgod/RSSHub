import utils from '../../utils';
import api from './api';

const handler = async (ctx) => {
    const keyword = ctx.req.param('keyword');
    const limit = ctx.req.query('limit') ?? 50;
    await api.init();
    const data = await api.getSearch(keyword, { count: limit });

    return {
        title: `Twitter Keyword - ${keyword}`,
        link: `https://x.com/search?q=${encodeURIComponent(keyword)}`,
        item: utils.ProcessFeed(ctx, {
            data,
        }),
        allowEmpty: true,
    };
};
export default handler;
