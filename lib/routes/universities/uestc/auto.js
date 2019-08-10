const got = require('@/utils/got');
const cheerio = require('cheerio');
// 通知公告 http://www.auto.uestc.edu.cn/index/tzgg1.htm
// 学术看板 http://www.auto.uestc.edu.cn/index/xskb1.htm
// 焦点新闻 http://www.auto.uestc.edu.cn/index/jdxw.htm
// 综合新闻 http://www.auto.uestc.edu.cn/index/zhxw1.htm

const baseUrl = 'http://www.auto.uestc.edu.cn/';
const baseIndexUrl = 'http://www.auto.uestc.edu.cn/index/';

module.exports = async (ctx) => {
    const type = ctx.params.type || 'tzgg1';
    const allType = type.split('+');
    let listItemsNoDescription = [];
    let headName = '自动化';
    for (const idx in allType) {
        // console.log(baseIndexUrl + allType[idx] + '.htm')
        const idxResponse = await got({
            method: 'get',
            url: baseIndexUrl + allType[idx] + '.htm',
        });

        const $ = cheerio.load(idxResponse.data);
        headName =
            headName +
            '+' +
            $('title')
                .text()
                .split('-')[0];
        const list = $('dl.clearfix');
        const t_listItems =
            list &&
            list
                .map((index, item) => {
                    const title = $(item)
                        .find('h6 a')
                        .text();
                    const link = $(item)
                        .find('h6 a')
                        .attr('href')
                        .replace('..', baseUrl);
                    return {
                        title,
                        description: '',
                        pubDate: new Date(
                            $(item)
                                .find('span')
                                .text()
                                .replace(/-/g, '/')
                        ).toUTCString(),
                        link,
                    };
                })
                .get();
        listItemsNoDescription = listItemsNoDescription.concat(t_listItems);
    }

    for (const i in listItemsNoDescription) {
        const t_response = await got({
            method: 'get',
            url: listItemsNoDescription[i].link,
        });
        const t_data = cheerio.load(t_response.data);

        // 将style去掉
        const reg = /style\s*?=\s*?([‘"])[\s\S]*?\1/gi;
        const t_description = '' + t_data('div.v_news_content');
        listItemsNoDescription[i].description = t_description.replace(reg, '');
    }

    ctx.state.data = {
        title: headName,
        link: baseUrl,
        item: listItemsNoDescription,
    };
};
