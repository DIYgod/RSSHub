const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://help.sogou.com/logo/doodle_logo_list.html',
    });

    const data = response.data.split(/\r\n/).slice(1);

    ctx.state.data = {
        title: '搜狗特色LOGO',
        link: 'http://help.sogou.com/logo/',
        item: data.map((item) => {
            item = item.split(',');

            return {
                title: `${item[2]}-${item[5]}`,
                description: `<img src="${item[4]}">`,
                pubDate: new Date(item[5]).toUTCString(),
                link: item[7],
                guid: item[4],
            };
        }),
    };
};
