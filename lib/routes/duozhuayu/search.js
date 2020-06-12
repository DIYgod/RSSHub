const got = require('@/utils/got');
const aesjs = require('aes-js');
const queryString = require('query-string');

module.exports = async (ctx) => {
    const wd = ctx.params.wd;
    const link = `https://www.duozhuayu.com/search/${wd}`;

    // token获取见 https://github.com/wong2/userscripts/blob/master/duozhuayu.user.js
    const key = 'DkOliWvFNR7C4WvR'.split('').map(function (c) {
        return c.charCodeAt();
    });
    const iv = 'GQWKUE2CVGOOBKXU'.split('').map(function (c) {
        return c.charCodeAt();
    });
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
            'x-timestamp': timestamp,
            'x-security-key': securityKey,
            'x-user-id': userId,
            'x-request-token': token,
            'x-request-misc': '{"platform":"browser"}',
            'x-api-version': '0.0.15',
            'x-request-id': requestId,
            'x-refer-request-id': requestId,
        };
    };

    const response = await got({
        method: 'get',
        url: 'https://www.duozhuayu.com/api/search',
        searchParams: queryString.stringify({
            type: 'normal',
            q: wd,
        }),
        headers: getCustomRequestHeaders(),
    });
    const books = response.data.data || [];

    const item = books
        .filter((item) => item.type === 'book')
        .map((item) => {
            const book = item.book;
            return {
                title: book.title,
                link: `https://www.duozhuayu.com/books/${book.id}`,
                pubDate: new Date(book.updated).toUTCString(),
                description: `
                <img src="${book.images.origin}" ><br>
                书名：${book.title} ${book.originalTitle}<br>
                作者：${book.rawAuthor}<br>
                ISBN：${book.isbn13}<br>
                出版社：${book.publisher}<br>
                出版时间：${book.publishDate}<br>
                价格：${(book.price / 100).toFixed(2)}元起  <del>${(book.originalPrice / 100).toFixed(2)}元</del><br>
                `,
                guid: book.id,
            };
        });

    ctx.state.data = {
        title: `多抓鱼搜索-${wd}`,
        link,
        description: `多抓鱼搜索-${wd}`,
        item,
    };
};
