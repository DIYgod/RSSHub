module.exports = async (ctx) => {
  ctx.state.data = await require('./util').getPage(ctx, {
    url: `https://www.manhuadui.com/manhua/${ctx.params.id}/`,
    site: '漫画堆',
    title: '.comic_deCon>h1',
    intro: '.comic_deCon_d',
    chapter: '[id^="chapter-list-"]>li>a'
  });
};
