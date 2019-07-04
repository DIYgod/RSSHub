module.exports = async (ctx) => {
    ctx.state.data = await require('./util').getPage(ctx, {
        url: `https://www.177mh.net/colist_${ctx.params.id}.html`,
        site: '新新漫画',
        title: '.ar_list_coc>li>h1',
        intro: '.d_sam',
        chapter: '.ar_list_col>li>a',
    });
};
