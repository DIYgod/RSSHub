module.exports = async (ctx) => {
    ctx.state.data = await require('./util').getPage(ctx, {
        url: `https://www.laimanhua.com/kanmanhua/${ctx.params.id}/`,
        site: '来漫画',
        title: '.title>h1',
        intro: '[href="#intro1"]',
        chapter: '.plist a',
    });
};
