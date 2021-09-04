const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseApiUrl = 'http://pagelet.mafengwo.cn/note/pagelet/recommendNoteApi';
const baseUrl = 'http://www.mafengwo.cn';
const enumType = {
    latest: 3,
    hot: 0,
};

module.exports = async (ctx) => {
    const type = ctx.params.type;
    if (!type || enumType[type] === undefined) {
        return;
    }

    const params = {
        type: enumType[type],
        objid: 0,
        page: 1,
        ajax: 1,
        retina: 0,
    };
    const url = `${baseApiUrl}?params=${encodeURIComponent(JSON.stringify(params))}`;
    const response = await got({
        method: 'get',
        url: url,
        headers: {
            Referer: url,
        },
    });
    const data = response.data;
    const $ = cheerio.load(data.data.html);
    const list = $('.tn-list .tn-item');
    ctx.state.data = {
        title: '马蜂窝游记',
        link: 'http://www.mafengwo.cn',
        description: '马蜂窝!靠谱的旅游攻略,自由行,自助游分享社区,海量旅游景点图片、游记、交通、美食、购物等自由行旅游攻略信息,马蜂窝旅游网获取自由行,自助游攻略信息更全面',
        item:
            list &&
            list
                .map((item, index) => {
                    item = $(index);
                    const link = $(item.find('dt a').not('.tn-from-app')).attr('href');
                    return {
                        title: $(item.find('dt a').not('.tn-from-app')).text(),
                        description: `<img src="${item.find('.tn-image img').attr('src')}"> ${item.find('dd a').text()}`,
                        link: link.indexOf('mafengwo.cn') > -1 ? link : `${baseUrl}${link}`,
                    };
                })
                .get(),
    };
};
