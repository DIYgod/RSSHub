const { template, getVideoComments } = require('./utils');

module.exports = async (ctx) => {
    const utype = ctx.params.utype;
    const uid = ctx.params.uid;

    if (utype === 'userposts') {
        const uid = ctx.params.uid;
        const link = `http://www.javlibrary.com/cn/userposts.php?u=${uid}`;
        const items = await getVideoComments(link);
        ctx.state.data = {
            title: `Javlibrary - ${uid} 发表的文章`,
            link: link,
            item: items,
        };
    } else {
        ctx.state.data = {
            link: `http://www.javlibrary.com/cn/${utype}.php?u=${uid}`,
        };
        await template(ctx);
    }
};
