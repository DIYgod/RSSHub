module.exports = async (ctx) => {
  ctx.state.data = await require('./util').getPage(ctx, {
    url: `https://www.manhuadb.com/manhua/${ctx.params.id}`,
    site: '漫画DB',
    title: '.comic-title',
    intro: '.comic_story',
    chapter: '.tab-pane>ol a'
  });
};
