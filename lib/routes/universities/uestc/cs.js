const got = require('@/utils/got');
const cheerio = require('cheerio');
// 网站地图 http://www.scse.uestc.edu.cn/index/wzdt.htm
// 通知公告
// 办公室 http://www.scse.uestc.edu.cn/tzgg/bgs.htm
// 组织人事 http://www.scse.uestc.edu.cn/tzgg/zzrs.htm
// 科研科 http://www.scse.uestc.edu.cn/tzgg/kyk.htm
// 研管科 http://www.scse.uestc.edu.cn/tzgg/ygk.htm
// 教务科 http://www.scse.uestc.edu.cn/tzgg/jwk.htm
// 学生科 http://www.scse.uestc.edu.cn/tzgg/xsk.htm
// 国际办 http://www.scse.uestc.edu.cn/tzgg/gjb.htm
// 综合教育 http://www.scse.uestc.edu.cn/tzgg/zhjy.htm
// 创新创业 http://www.scse.uestc.edu.cn/tzgg/cxcy.htm
// Info http://www.scse.uestc.edu.cn/tzgg/Info.htm
// 安全工作 http://www.scse.uestc.edu.cn/tzgg/aqgz.htm

// 学术看板 http://www.scse.uestc.edu.cn/ztlj/xskb.htm

const baseUrl = 'http://www.scse.uestc.edu.cn/';

module.exports = async (ctx) => {
    const type = ctx.params.type || 'ztlj*xskb';

    const allType = type.split('+');
    let listItemsNoDescription = [];
    let headName = '计算机';
    for (const idx in allType) {
        const response = await got({
            method: 'get',
            url: baseUrl + allType[idx].replace('*', '/') + '.htm',
        });
        const data = response.data;
        const $ = cheerio.load(data);
        headName =
            headName +
            '+' +
            $('title')
                .text()
                .split('-')[0];
        const list = $('div#newsList').find('p');

        const t_listItems =
            list &&
            list
                .map((index, item) => {
                    const title = $(item)
                        .find('span a')
                        .text();
                    const link = $(item)
                        .find('span a')
                        .attr('href')
                        .replace('..', baseUrl);
                    return {
                        title,
                        description: '',
                        pubDate: new Date(
                            $(item)
                                .find('span#time')
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
        const t_description = '' + t_data('div#vsb_content');
        listItemsNoDescription[i].description = t_description.replace(reg, '');
    }
    // console.log(listItemsNoDescription)

    ctx.state.data = {
        title: headName,
        link: baseUrl,
        // link: baseUrl + type.replace('*', '/') + '.htm',
        item: listItemsNoDescription,
    };
};
