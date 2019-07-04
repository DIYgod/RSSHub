module.exports = async (ctx) => {
    ctx.state.data = await require('./util').getPage(ctx, {
        url: `https://www.gufengmh8.com/manhua/${ctx.params.id}/`,
        site: '古风漫画',
        title: '.book-title > h1',
        intro: '#intro-all',
        chapter: '[id^="chapter-list"]>li>a',
    });
};
