const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const CryptoJS = require('crypto-js');

module.exports = async (ctx) => {
    const KEY = 'f0fc4c668392f9f9a447e48584c214ee';

    const id = ctx.params.id;
    const size = ctx.query.limit ? parseInt(ctx.query.limit) : 100;

    const rootUrl = 'https://www.radio.cn';
    const apiRootUrl = 'https://ytmsout.radio.cn';
    const detailRootUrl = 'https://ytapi.radio.cn';

    const iconUrl = `${rootUrl}/pc-portal/image/icon_32.jpg`;
    const currentUrl = `${rootUrl}/pc-portal/sanji/detail.html?columnId=${id}`;
    const detailUrl = `${detailRootUrl}/ytsrv/srv/wifimusicbox/demand/detail`;

    const detailResponse = await got({
        method: 'post',
        url: detailUrl,
        form: {
            pageIndex: '0',
            sortType: '2',
            mobileId: '',
            providerCode: '25010',
            pid: id,
            paySongFlag: '1',
            richText: '1',
            h5flag: '1',
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            version: '4.0.0',
            providerCode: '25010',
            equipmentSource: 'WEB',
        },
    });

    const data = detailResponse.data;

    const count = data.count;

    let pageNo = 1,
        pageSize = count - size;

    if (pageSize <= 0) {
        pageNo = 0;
        pageSize = count;
    }

    const params = `albumId=${id}&pageNo=${pageNo}&pageSize=${pageSize}`;
    const apiUrl = `${apiRootUrl}/web/appSingle/pageByAlbum?${params}`;

    const timestamp = new Date().getTime();
    const sign = CryptoJS.MD5(`${params}&timestamp=${timestamp}&key=${KEY}`).toString().toUpperCase();

    const response = await got({
        method: 'get',
        url: apiUrl,
        headers: {
            sign,
            timestamp,
            'Content-Type': 'application/json',
            equipmentId: '0000',
            platformCode: 'WEB',
        },
    });

    const items = response.data.data.data.map((item) => {
        let enclosure_url = item.playUrlHigh ?? item.playUrlLow;
        enclosure_url = /\.m3u8$/.test(enclosure_url) ? item.downloadUrl : enclosure_url;

        const enclosure_type = `audio/${enclosure_url.match(/\.(\w+)$/)[1]}`;

        return {
            guid: item.id,
            title: item.name,
            link: enclosure_url,
            description: art(path.join(__dirname, 'templates/description.art'), {
                description: item.des,
                enclosure_url,
                enclosure_type,
            }),
            author: data.anchorpersons,
            pubDate: parseDate(item.publishTime),
            enclosure_url,
            enclosure_type,
            enclosure_length: item.fileSize,
            itunes_duration: item.duration,
            itunes_item_image: iconUrl,
        };
    });

    ctx.state.data = {
        title: `云听 - ${data.columnName}`,
        link: currentUrl,
        item: items,
        image: iconUrl,
        itunes_author: data.anchorpersons,
        description: data.descriptions ?? data.descriptionSimple,
        itunes_category: data.atypeInfo.map((c) => c.categoryName).join(),
    };
};
