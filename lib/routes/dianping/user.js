const got = require('@/utils/got');
const date = require('@/utils/date');

function addPictureAndVideo(item) {
    let content = '';
    content += item.pictureList
        ? item.pictureList
              .map(function (ele) {
                  return `<img src="${ele.picUrl}" />`;
              })
              .join('<br>')
        : '';
    content += item.videoUrl ? `<img src="${item.videoUrl}" />` : '';
    return content;
}

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1';
    const userPage = `https://m.dianping.com/userprofile/${id}`;

    const pageResponse = await got({
        method: 'get',
        url: userPage,
        headers: {
            'User-Agent': userAgent,
        },
    });
    const nickNameReg = /window\.nickName = "(.*?)"/g;
    const nickName = nickNameReg.exec(pageResponse.data)[1];

    const response = await got({
        method: 'get',
        url: `https://m.dianping.com/member/ajax/NobleUserFeeds?userId=${id}`,
        headers: {
            'User-Agent': userAgent,
            Referer: userPage,
        },
    });

    const data = response.data.data;
    const starMap = {
        0: '无',
        10: '一星',
        20: '二星',
        30: '三星',
        35: '三星半',
        40: '四星',
        45: '四星半',
        50: '五星',
    };
    const out = data.map(function (item) {
        let link = '';
        let title = '';
        let content = '';
        const pubDate = date(item.addTime);
        const poi = item.poi ? `地点：<a href="http://www.dianping.com/shop/${item.poi.shopId}">${item.poi.name} - ${item.poi.regionCategory}</a>` : '';
        const poiName = item.poi ? item.poi.name : '';
        if (item.feedType === 1101) {
            // 签到成功
            link = `https://m.dianping.com/ugcdetail/${item.mainId}?sceneType=0&bizType=3`;
            content = poi;
            title = `签到成功: ${poiName} `;
        } else if (item.feedType === 101) {
            // 对商户、地点发布点评
            link = `https://m.dianping.com/ugcdetail/${item.mainId}?sceneType=0&bizType=1`;
            content = item.content.replace(/\n+/g, '<br>') + '<br>';
            content += `评分：${starMap[item.star]}<br>`;
            content += poi + '<br>';
            content += addPictureAndVideo(item);
            title = `发布点评: ${poiName}`;
        } else if (item.feedType === 131) {
            // 发布点评
            link = `https://m.dianping.com/ugcdetail/${item.mainId}?sceneType=0&bizType=29`;
            content = item.content.replace(/\n+/g, '<br>') + '<br>';
            content += addPictureAndVideo(item);
            title = `发布点评: ${content}`;
        } else if (item.feedType === 4208) {
            // 发布攻略
            link = `https://m.dianping.com/cityinsight/${item.mainId}`;
            content = item.content.replace(/\n+/g, '<br>') + '<br>';
            content += poi + '<br>';
            content += item.moreDesc ? `<a href='${link}'>${item.moreDesc}</a><br>` : '';
            content += addPictureAndVideo(item);
            title = `发布攻略: ${poiName}`;
        }

        const info = {
            description: content,
            title: title,
            link: link,
            pubDate: pubDate,
        };
        return info;
    });

    ctx.state.data = {
        title: `大众点评 - ${nickName}`,
        link: userPage,
        description: `大众点评 - ${nickName}`,
        item: out,
    };
};
