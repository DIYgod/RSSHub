const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {

    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: 'https://cn.eagle.cool/changelog',
        headers: {
            Referer: `https://cn.eagle.cool/`,
        },
    });

    // 使用 cheerio 加载返回的 HTML
    const data = response.data;
    const $ = cheerio.load(data);

    const list = $('.version');

    ctx.state.data = {
        // 源标题
        title: 'Eagle 更新日志',
        // 源链接
        link: 'https://cn.eagle.cool/changelog',
        // 源说明
        description: `Eagle 更新日志`,

        // 遍历此前获取的数据
        item:
            list &&
            list.map((index, item) => {
                item = $(item);
                // 对获取的日期进行格式化处理
                function getDate() {
                    const str = item.find('.date').text();
                    const patt = /[0-9]\d*/g;
                    let result;
                    let date = "";
                    while ((result = patt.exec(str)) !== null) {
                        date += result + '-';
                    }
                    return date.replace(/-$/g, "");
                }

                return {
                    title: item.find('.ver').text(),
                    description: item.find('.logs').html(),
                    link: 'https://cn.eagle.cool/changelog',
                    pubDate: new Date(getDate()).toUTCString(),
                };
            })
                .get(),
    };
};
