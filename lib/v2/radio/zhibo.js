const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const CryptoJS = require('crypto-js');

module.exports = async (ctx) => {
    const KEY = 'f0fc4c668392f9f9a447e48584c214ee';

    const id = ctx.params.id;
    const size = ctx.query.limit ?? '100';

    const params = `columnId=${id}&pageNo=0&pageSize=${size}`;

    const rootUrl = 'https://www.radio.cn';
    const apiRootUrl = 'https://ytmsout.radio.cn';

    const iconUrl = `${rootUrl}/pc-portal/image/icon_32.jpg`;
    const currentUrl = `${rootUrl}/pc-portal/sanji/zhibo_2.html?name=${id}`;
    const apiUrl = `${apiRootUrl}/web/appProgram/pageByColumn?${params}`;

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

    const data = response.data.data.data;

    const items = data.map((item) => {
        let enclosure_url = item.playUrlHigh ?? item.playUrlLow;
        enclosure_url = /\.m3u8$/.test(enclosure_url) ? item.downloadUrl : enclosure_url;

        const enclosure_type = `audio/${enclosure_url.match(/\.(\w+)$/)[1]}`;

        const date = new Date(item.startTime);
        const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

        return {
            guid: item.id,
            title: `${dateString} ${item.name}`,
            link: enclosure_url,
            description: art(path.join(__dirname, 'templates/description.art'), {
                description: item.des,
                enclosure_url,
                enclosure_type,
            }),
            pubDate: parseDate(item.startTime),
            enclosure_url,
            enclosure_type,
            itunes_duration: item.durationStr,
            itunes_item_image: iconUrl,
        };
    });

    ctx.state.data = {
        title: `云听 - ${data[0].name}`,
        link: currentUrl,
        item: items,
        image: iconUrl,
        itunes_author: 'radio.cn',
        description: data[0].des,
    };
};
