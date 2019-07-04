module.exports = async (ctx) => {
  ctx.state.data = await require('./util').getPage(ctx, {
    url: `https://www.twocomic.com/html/${ctx.params.id}.html`,
    site: '動漫易',
    title: 'h2.white',
    intro: '.main div>ul>li:nth-child(7)',
    chapter: '.Ch'
  });
};
