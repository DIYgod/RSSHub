module.exports = async (ctx) => {
    ctx.state.data = await require('./util').getPage(ctx, {
        url: `https://n.kukudm.com/comiclist/${ctx.params.id}/index.htm`,
        site: 'KuKu动漫',
        title: '[rowspan="3"] [colspan="2"]',
        intro: '#ComicInfo',
        chapter: '#comiclistn dd>a:nth-child(1)',
    });
};
