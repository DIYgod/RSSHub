const buildData = require('@/utils/common-config');
const dateUtil = require('@/utils/date');
module.exports = async (ctx) => {
    const link = `http://bbs.gfan.com/forum.php?mod=forumdisplay&fid=62&filter=author&orderby=dateline`;
    ctx.state.data = await buildData({
        link,
        url: link,
        title: `%title%`,
        params: {
            title: '机锋论坛-Android安卓软件',
        },
        item: {
            item: 'tbody[id^="normalthread"] tr',
            title: `$('a.xst').text()`,
            link: `$('a.xst').attr('href')`,
            description: `$('a.xst').text()`,
            pubDate: dateUtil(`$('td.by span').text()`),
            guid: `$('a.xst').attr('href')`,
        },
    });
};
