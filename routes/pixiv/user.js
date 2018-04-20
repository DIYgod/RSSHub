const axios = require('axios');
const art = require('art-template');
const path = require('path');
const config = require('../../config');
const logger = require('../../utils/logger');
const FormData = require('form-data');

const pixivConfig = config.pixiv;

if (!pixivConfig) {
    logger.info('Pixiv RSS disable.');
    module.exports = () => {};
    return;
}

const authorizationInfo = {
    client_id: pixivConfig.client_id,
    client_secret: pixivConfig.client_secret,
    username: pixivConfig.username,
    password: pixivConfig.password
};

const maskHeader = {
    'App-OS': 'ios',
    'App-OS-Version': '10.3.1',
    'App-Version': '6.7.1',
    'User-Agent': 'PixivIOSApp/6.7.1 (iOS 10.3.1; iPhone8,1)'
};

let token = null;

async function getToken() {
    const data = new FormData();
    const jsonData = {
        ...authorizationInfo,
        get_secure_url: 1,
        grant_type: 'password'
    };
    for (const key in jsonData) {
        if (jsonData.hasOwnProperty(key)) {
            const element = jsonData[key];
            data.append(key,element);
        }
    }
    const response = await axios.post('https://oauth.secure.pixiv.net/auth/token', data, {
        headers: {
            ...maskHeader,
            ...data.getHeaders()
        }
    });
    return response.data.response;
}

async function refreshToken(refresh_token) {
    const data = new FormData();
    const jsonData = {
        ...authorizationInfo,
        get_secure_url: 1,
        grant_type: 'refresh_token',
        refresh_token: refresh_token
    };
    for (const key in jsonData) {
        if (jsonData.hasOwnProperty(key)) {
            const element = jsonData[key];
            data.append(key,element);
        }
    }
    const response = await axios.post('https://oauth.secure.pixiv.net/auth/token', data, {
        headers: {
            ...maskHeader,
            ...data.getHeaders()
        }
    });
    return response.data.response;
}

function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function tokenLoop() {
    const res = await getToken();
    logger.info('Pixiv login success.');
    token = res.access_token;
    let refresh_token = res.refresh_token;
    let expires_in = res.expires_in * 0.9;
    while (true) {
        await wait(expires_in * 1000);
        try {
            const refresh_res = await refreshToken(refresh_token);
            logger.debug('Pixiv refresh token success.');
            token = refresh_res.access_token;
            refresh_token = refresh_res.refresh_token;
            expires_in = refresh_res.expires_in * 0.9;
        } catch (err) {
            expires_in = 30;
            logger.err('Pixiv refresh token failed, retry in ${expires_in} seconds.', err);
        }
    }
}

tokenLoop();

module.exports = async (ctx) => {
    const id = ctx.params.id;

    if (typeof token === 'null') {
        ctx.throw(500);
        return;
    }

    const response = await axios({
        method: 'get',
        url: 'https://app-api.pixiv.net/v1/user/illusts',
        headers: {
            ...maskHeader,
            'Authorization': 'Bearer ' + token
        },
        params: {
            user_id: id,
            filter: 'for_ios',
            type: 'illust'
        },
    });

    const illusts = response.data.illusts;
    const username = illusts[0].user.name

    ctx.body = art(path.resolve(__dirname, '../../views/rss.art'), {
        title: `${username} 的 Pixiv 动态`,
        link: `https://music.163.com/#/playlist?id=${id}`,
        description: `${username} 的 Pixiv 最新动态`,
        lastBuildDate: new Date().toUTCString(),
        item: illusts.map((illust) => {
            const images = [];
            if (illust.page_count === 1) {
                images.push(`<p><img referrerpolicy="no-referrer" src="https://pixiv.cat/${illust.id}.jpg"/></p>`);
            } else {
                for (let i = 0; i < illust.page_count; i++) {
                    images.push(`<p><img referrerpolicy="no-referrer" src="https://pixiv.cat/${illust.id}-${i+1}.jpg"/></p>`);
                }
            }
            return {
                title: illust.title,
                description: `<p>画师：${username} - 上传于：${new Date(illust.create_date).toLocaleString('zh-cn')} - 阅览数：${illust.total_view} - 收藏数：${illust.total_bookmarks}</p>${images.join('')}`,
                link: `https://www.pixiv.net/member_illust.php?mode=medium&illust_id=${illust.id}`
            };
        })
    });
};