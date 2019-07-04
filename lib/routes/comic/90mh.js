module.exports = async (ctx) => {
    ctx.state.data = await require('./util').getPage(ctx, {
        url: `http://www.90mh.com/manhua/${ctx.params.id}/`,
        site: '90漫画',
        title: '.book-title>h1',
        intro: '#intro-all',
        chapter: '.chapter-body>ul>li>a',
    });
};
