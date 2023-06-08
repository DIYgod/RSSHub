const got = require('@/utils/got');
const md5 = require('@/utils/md5');

function encryptData(data, options) {
    options = options || {};
    const wbiKey = getWbiKey(options),
        imgKey = wbiKey.imgKey,
        subKey = wbiKey.subKey;
    if (imgKey && subKey) {
        const mixinKey = getMixinKey(imgKey + subKey),
            timestamp = Math.round(Date.now() / 1000),
            dataWithTimestamp = Object.assign({}, data, { wts: timestamp }),
            sortedKeys = Object.keys(dataWithTimestamp).sort(),
            encodedPairs = [],
            specialChars = /[!'()*]/g;
        for (let i = 0; i < sortedKeys.length; i++) {
            const key = sortedKeys[i];
            let value = dataWithTimestamp[key];
            if (value && typeof value === 'string') {
                value = value.replace(specialChars, '');
            }
            if (value !== null) {
                encodedPairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            }
        }
        const encodedString = encodedPairs.join('&'),
            hash = md5(encodedString + mixinKey);
        return {
            w_rid: hash,
            wts: timestamp.toString(),
        };
    }
    return null;
}

function getWbiKey(options) {
    if (options.useAssignKey) {
        return {
            imgKey: options.wbiImgKey,
            subKey: options.wbiSubKey,
        };
    }
    const imgURL = getLocal('wbi_img_url'),
        subURL = getLocal('wbi_sub_url'),
        imgKey = imgURL ? getKeyFromURL(imgURL) : options.wbiImgKey,
        subKey = subURL ? getKeyFromURL(subURL) : options.wbiSubKey;
    return {
        imgKey,
        subKey,
    };
}

function getMixinKey(key) {
    const indices = [
        46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
        36, 20, 34, 44, 52,
    ];
    const result = [];
    indices.forEach((index) => {
        if (key.charAt(index)) {
            result.push(key.charAt(index));
        }
    });
    return result.join('').slice(0, 32);
}

function getLocal(key) {
    if (key === 'wbi_img_url') {
        return 'https://i0.hdslb.com/bfs/wbi/e130e5f398924e569b7cca9f4713ec63.png';
    }
    if (key === 'wbi_sub_url') {
        return 'https://i0.hdslb.com/bfs/wbi/65c711c1f26b475a9305dad9f9903782.png';
    }
    return null;
    // try {
    //     return localStorage.getItem(key);
    // } catch (error) {
    //     return null;
    // }
}

function getKeyFromURL(url) {
    return url.substring(url.lastIndexOf('/') + 1, url.length).split('.')[0];
}

module.exports = async (ctx) => {
    const query = {
        limit: 10,
        platform: 'web',
    };
    const { w_rid, wts } = encryptData(query);
    const url = `https://api.bilibili.com/x/web-interface/wbi/search/square?limit=10&platform=web&wts=${wts}&w_rid=${w_rid}`;
    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: `https://api.bilibili.com`,
        },
    });
    const trending = response?.data?.data?.trending;
    const title = trending?.title;
    const list = trending?.list || [];
    ctx.state.data = {
        title,
        link: url,
        description: 'bilibili热搜',
        item: list.map((item) => ({
            title: item.keyword,
            description: `${item.keyword}<br>${item.icon ? `<img src="${item.icon}">` : ''}`,
            link: item.link || item.goto || `https://search.bilibili.com/all?${new URLSearchParams({ keyword: item.keyword })}&from_source=webtop_search`,
        })),
    };
};
