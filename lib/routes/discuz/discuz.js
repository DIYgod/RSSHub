const buildData = require('@/utils/common-config');
module.exports = async (ctx) => {
    let link = ctx.params.link;
    link = link.replace(/:\/\//, ':/').replace(/:\//, '://');
    ctx.state.data = await buildData({
        link,
        url: link,
        title: `%title%`,
        params: {
            title: `$('head > title').text()`,
        },
        item: {
            item: 'tbody[id^="normalthread"] tr',
            title: `$('a.xst').text()`,
            link: `$('a.xst').attr('href')`,
            description: `$('a.xst').text()`,
            pubDate: `require('@/utils/date')($('td.by:nth-child(3) em span').last().text())`,
            guid: `$('a.xst').attr('href')`,
        },
    });
};
