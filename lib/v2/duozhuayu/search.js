const got = require('@/utils/got');
const aesjs = require('aes-js');
const { art } = require('@/utils/render');
const { join } = require('path');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const wd = ctx.params.wd;
    const baseUrl = 'https://www.duozhuayu.com';
    const type = 'book';
    const link = `${baseUrl}/search/${type}/${wd}`;

    // token获取见 https://github.com/wong2/userscripts/blob/master/duozhuayu.user.js
    const key = 'DkOliWvFNR7C4WvR'.split('').map((c) => c.charCodeAt());
    const iv = 'GQWKUE2CVGOOBKXU'.split('').map((c) => c.charCodeAt());
    const aesCfb = new aesjs.ModeOfOperation.cfb(key, iv);

    const encrypt = (text) => {
        const textBytes = aesjs.utils.utf8.toBytes(text);
        const encryptedBytes = aesCfb.encrypt(textBytes);
        return aesjs.utils.hex.fromBytes(encryptedBytes);
    };

    const getCustomRequestHeaders = () => {
        const timestamp = Date.now();
        const userId = 0;
        const securityKey = Math.floor(1e8 * Math.random());
        const token = encrypt([timestamp, userId, securityKey].join(':'));
        const requestId = [userId, timestamp, Math.round(1e5 * Math.random())].join('-');
        return {
            'x-api-version': '0.0.48',
            'x-refer-request-id': requestId,
            'x-request-id': requestId,
            'x-request-misc': '{"platform":"browser","originSource":"search","originFrom":"normal","webVersion":"1.2.201774"}',
            'x-request-token': token,
            'x-security-key': securityKey,
            'x-timestamp': timestamp,
            'x-user-id': userId,
        };
    };

    const response = await got({
        method: 'get',
        url: `${baseUrl}/api/search/book`,
        searchParams: {
            type: 'normal',
            q: wd,
        },
        headers: getCustomRequestHeaders(),
    });

    const item = response.data.data
        .filter((item) => item.type === type)
        .map(({ [type]: item }) => ({
            title: item.title,
            link: `${baseUrl}/books/${item.id}`,
            pubDate: parseDate(item.updated), // 2023-05-07T13:33:09+08:00
            description: art(join(__dirname, 'templates/book.art'), { item }),
        }));

    ctx.state.data = {
        title: `多抓鱼搜索-${wd}`,
        link,
        description: `多抓鱼搜索-${wd}`,
        item,
    };
};
