const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'http://jsxy.zucc.edu.cn/';
const vpnUrl = 'http://jsxy.webvpn.zucc.edu.cn/';
const maps = {
    search: '/module/sitesearch/index.jsp?keyword=vc_title&columnid=0&webid=2&modalunitid=13014',
};

function convert(raw) {
    return unescape(raw.replace(/&#x/g, '%u').replace(/;/g, ''));
}

module.exports = async (ctx) => {
    const keyVal = ctx.params.key || encodeURIComponent('白卡');
    const pageNum = 1;
    const vpnBool = Number.parseInt(ctx.params.webVpn) || 0;
    const response = await got({
        method: 'get',
        url: baseUrl + maps.search.concat('&keyvalue=', encodeURIComponent(keyVal), '&currpage=', pageNum.toString()),
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const resItem = [];
    $('a').each((index, el) => {
        if ($(el).attr('target') === '_blank') {
            const item = {};
            item.title = convert($(el).html());
            item.link = vpnBool === 0 ? $(el).attr('href') : vpnUrl + $(el).attr('href').slice(24);
            const dateList = $(el)
                .attr('href')
                .match(/\/\d+/g)
                .map((ele) => ele.toString().replace('/', ''));
            item.pubDate = new Date(dateList.join('-')).toUTCString();
            item.description = '<br/>' + $(el).attr('title') + '<br/>部分全文内容需使用校园网或VPN获取';
            item.guid = convert($(el).html());
            resItem.push(item);
        }
    });

    ctx.state.data = {
        title: '浙江大学城市学院计算分院全站搜索:' + keyVal,
        link: vpnBool === 0 ? baseUrl : vpnUrl,
        item: resItem,
    };
};
