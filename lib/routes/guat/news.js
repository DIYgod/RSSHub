/*
 * @Author: Kingsr
 * @Date: 2020-03-04 15:59:49
 * @LastEditors: Kingsr
 * @LastEditTime: 2020-03-04 17:39:01
 * @Description: 桂林航天工业学院RSSHub规则
 */
const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://www.guat.edu.cn';
const urls = {
    ghyw: {
        url: `${host}/index/ghyw.htm`,
        title: '桂航要闻',
    },
    ybdt: {
        url: `${host}/index/ybdt.htm`,
        title: '院部动态',
    },
    tzgg: {
        url: `${host}/index/tzgg.htm`,
        title: '通知公告',
    },
    xxgk: {
        url: `${host}/index/xxgk.htm`,
        title: '信息公开',
    },
    ghdjt: {
        url: `${host}/index/ghdjt.htm`,
        title: '桂航大讲堂',
    },
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'ghyw';
    if (!urls[type]) {
        throw Error('参数不在可选范围之内');
    }
    const url = urls[type].url;
    const title = urls[type].title;
    const response = await got({
        method: 'get',
        url: url,
    });
    const data = response.data;
    const $ = cheerio.load(data);

    const list = new Array();
    // 适应桂航的奇葩规则
    for (let index = 0; index < 19; index++) {
        const element = $(`#line_u8_${index}`);
        const item_title = element.find('a').first().text();
        const item_link = element.find('a').first().attr('href').replace('../', host);

        list.push({
            title: item_title,
            description: `${title} - ${item_title}`,
            link: item_link,
        });
    }

    ctx.state.data = {
        title: `桂林航天工业学院 - ${title}`,
        link: 'https://www.guat.edu.cn',
        item: list,
    };
};
