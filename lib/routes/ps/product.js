const got = require('@/utils/got');
const dayjs = require('dayjs');

module.exports = async (ctx) => {
    const { gridName, lang } = ctx.params;

    // 默认语言
    let langurl = 'zh/HK';
    let textshow = {
        tprice: `价格`,
        tdiscount: `优惠`,
        tplusfree: `PLUS 免费`,
        tendtime: `此优惠仅限`,
        endtimeformat: `YYYY.MM.DD h.mm A`,
        treleasedate: `发行日期`,
        releasedateformat: `YYYY.MM.DD`,
        tsize: `大小`,
        tdevice: `设备`,
        ttype: `类型`,
        trating: `评分`,
        tdescribe: `描述`,
        tpreview: `预览`,
        tnopreview: `无`,
    };
    // 繁体
    if (lang === 'zh-hant-hk') {
        langurl = `ch/HK`;
    }
    if (lang === 'zh-hant-tw') {
        langurl = `ch/TW`;
    }
    if (lang.indexOf('hant')) {
        textshow = {
            tprice: `價格`,
            tdiscount: `優惠`,
            tplusfree: `PLUS 免費`,
            tendtime: `此優惠僅限`,
            endtimeformat: `YYYY.MM.DD h.mm A`,
            treleasedate: `發售日`,
            releasedateformat: `YYYY.MM.DD`,
            tsize: `檔案大小`,
            tdevice: `播放裝置`,
            ttype: `類型`,
            trating: `評價`,
            tdescribe: `描述`,
            tpreview: `預覽`,
            tnopreview: `無`,
        };
    }
    // English
    if (lang.indexOf('-') && lang.indexOf('zh') === -1) {
        langurl = ctx.params.lang.replace('-', '/');
        textshow = {
            tprice: `Price`,
            tdiscount: `SAVE`,
            tplusfree: `Free For Plus`,
            tendtime: `Only in`,
            endtimeformat: `MM/DD/YYYY h:mm A`,
            treleasedate: `Release Date`,
            releasedateformat: `MMMM D, YYYY`,
            tsize: `File Size`,
            tdevice: `Playable On`,
            ttype: `Genre`,
            trating: `Rating`,
            tdescribe: `Description`,
            tpreview: `Preview`,
            tnopreview: `None`,
        };
    }

    const response = await got({
        method: 'get',
        url: `https://store.playstation.com/valkyrie-api/${langurl}/999/resolve/${gridName}?depth=2`,
    });
    const data = response.data;
    const item = data.included?.filter((item) => item.id === gridName) ?? [];
    ctx.state.data = {
        title: `PlayStation Store - ${item[0].attributes?.name ?? 'Unknown Name'}`,
        link: `https://store.playstation.com/${ctx.params.lang}/product/${gridName}`,
        item: item.map((item) => {
            let discount = '';
            // 折扣，另外这是选择带有特殊字符的JSON数据方法！
            let npdiscount = '';
            if (item.attributes['badge-info']['non-plus-user']) {
                npdiscount = `${textshow.tdiscount} ${item.attributes['badge-info']['non-plus-user']['discount-percentage']}%`;
            }
            if (
                (item.attributes['badge-info']['non-plus-user'] && item.attributes['badge-info']['non-plus-user']['discount-percentage'] === 100) ||
                (item.attributes['badge-info']['non-plus-user'] && item.attributes['badge-info']['non-plus-user']['discount-percentage'] === 0)
            ) {
                npdiscount = `${textshow.tprice}:${item.attributes.skus[0].prices['non-plus-user']['actual-price'].display}`;
            }

            // PLUS折扣
            let pdiscount = '';
            if (item.attributes['badge-info']['plus-user']) {
                pdiscount = `PLUS ${textshow.tdiscount} ${item.attributes['badge-info']['plus-user']['discount-percentage']}%`;
            }
            if (
                (item.attributes['badge-info']['plus-user'] && item.attributes['badge-info']['plus-user']['discount-percentage'] === 100) ||
                (item.attributes['badge-info']['plus-user'] && item.attributes['badge-info']['plus-user']['discount-percentage'] === 0)
            ) {
                pdiscount = textshow.tplusfree;
            }

            // 优惠时限&判断
            let endtime = ``;
            if (item.attributes.skus[0].prices['plus-user'].availability['end-date']) {
                endtime = `${textshow.tendtime} ${dayjs(item.attributes.skus[0].prices['plus-user'].availability['start-date']).format(textshow.endtimeformat)}--${dayjs(
                    item.attributes.skus[0].prices['plus-user'].availability['end-date']
                ).format(textshow.endtimeformat)}。<br><br>`;
            }
            // 价格，如果有折扣添加折扣信息至标题。
            let price = `${textshow.tprice}：${item.attributes.skus[0].prices['non-plus-user']['actual-price'].display} | PLUS${textshow.tprice}：${item.attributes.skus[0].prices['plus-user']['actual-price'].display}`;
            if (item.attributes['badge-info']['non-plus-user']) {
                price = `${textshow.tprice}：${item.attributes.skus[0].prices['non-plus-user']['actual-price'].display} | PLUS${textshow.tprice}：${item.attributes.skus[0].prices['plus-user']['actual-price'].display}<br><br>${endtime}`;
                discount = `|${npdiscount} | ${pdiscount}`;
            }

            return {
                title: `${item.attributes.name}${discount}`,
                description: `${price}<br>${textshow.treleasedate}：${dayjs(item.attributes['release-date']).format(textshow.releasedateformat)}<br><br>
					${textshow.tsize}：${item.attributes['file-size'].value}${item.attributes['file-size'].unit}<br><br>
					${textshow.tdevice}：${item.attributes.platforms.join(', ')}<br><br>
					${textshow.ttype}：${item.attributes.genres.join(', ')}<br><br>
					${textshow.trating}：${item.attributes['star-rating'].score}<br><br>
					${textshow.tdescribe}：${item.attributes['long-description']}<br><br>
					${textshow.tpreview}：${item.attributes['media-list'].preview[0] ? `<video src="${item.attributes['media-list'].preview[0].url}" controls="controls" style="width: 100%"></video>` : textshow.tnopreview}`,
                link: `https://store.playstation.com/${ctx.params.lang}/product/${gridName}`,
            };
        }),
    };
};
