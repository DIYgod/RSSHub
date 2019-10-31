const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const ptype = {
        navall: { name: '主板+中小企业+创业板', tabkey: 'tab0', dataNum: 0, dataCategory: '全部', dataArr: [] },
        nav1: { name: '主板', tabkey: 'tab1', dataNum: 0, dataCategory: '主板', dataArr: [] },
        nav2: { name: '中小企业板', tabkey: 'tab2', dataNum: 1, dataCategory: '中小企业板', dataArr: [] },
        nav3: { name: '创业板', tabkey: 'tab3', dataNum: 2, dataCategory: '创业板', dataArr: [] },
    };
    function getUrl(params) {
        const $ = cheerio.load(params);
        const url = $('a').attr('encode-open');
        return url;
    }
    function restUrl(params) {
        const $ = cheerio.load(params);
        const getText = $('a').text();
        const url = $('a').attr('encode-open');
        const resthref = `http://reportdocs.static.szse.cn${url}`;
        if (params !== '') {
            params = `<a href='${resthref}'>${getText}</a>`;
        } else {
            params = '';
        }
        return params;
    }
    for (const key in ptype) {
        if (key !== 'navall') {
            const host = 'http://www.szse.cn/';
            const link = `http://www.szse.cn/api/report/ShowReport/data?SHOWTYPE=JSON&CATALOGID=main_wxhj&TABKEY=${ptype[key].tabkey}&loading=first`;
            // eslint-disable-next-line no-await-in-loop
            const response = await got.get(link, {
                Referer: host,
            });
            const datNum = ptype[key].dataNum;
            const temp = response.data;
            ptype[key].dataArr = temp[datNum].data;
            for (let i = 0; i < ptype[key].dataArr.length; i++) {
                ptype[key].dataArr[i].category = ptype[key].dataCategory;
            }
        }
    }

    let outList;
    switch (type) {
        case 'nav1':
            outList = ptype.navall.dataArr.concat(ptype.nav1.dataArr);
            break;
        case 'nav2':
            outList = ptype.navall.dataArr.concat(ptype.nav2.dataArr);
            break;
        case 'nav3':
            outList = ptype.navall.dataArr.concat(ptype.nav3.dataArr);
            break;
        default:
            outList = ptype.navall.dataArr.concat(ptype.nav1.dataArr, ptype.nav2.dataArr, ptype.nav3.dataArr);
            break;
    }
    ctx.state.data = {
        title: `深圳证券交易所——【${ptype[type].name}】问询函件`,
        link: `http://www.szse.cn/disclosure/supervision/inquire/index.html`,
        description: `深圳证券交易所/信息披露/监管信息公开/问询函件`,
        item: outList.map((item) => ({
            title: `【${item.category}】` + item.gsjc,
            category: item.category,
            author: item.category,
            description:
                `
            <table border="1">
            <tr><td > 公司代码 : </td><td>${item.gsdm}</td></tr>
            <tr><td> 公司简称 : </td><td>${item.gsjc}</td></tr>
            <tr><td> 发函日期 : </td><td>${item.fhrq}</td></tr>
            <tr><td> 函件类别 : </td><td>${item.hjlb}</td></tr>
            <tr><td> 函件内容 : </td><td>` +
                restUrl(item.ck) +
                `</td></tr>
            <tr><td> 公司回复 : </td><td>` +
                restUrl(item.hfck) +
                `</td></tr>
            </table>`,
            pubDate: new Date(item.fhrq).toUTCString(),
            link: `http://reportdocs.static.szse.cn` + getUrl(`${item.ck}`),
        })),
    };
};
