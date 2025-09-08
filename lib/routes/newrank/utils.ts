import cache from '@/utils/cache';
import md5 from '@/utils/md5';
import got from '@/utils/got';
import { config } from '@/config';
const newrank_cookie_token = 'newrank_cookie_token';
const query_count = 'newrank_cookie_count';
const max_query_count = 30;

const random_nonce = (count) => {
    const arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    const shuffled = [...arr];
    let i = arr.length,
        temp,
        index,
        str = '';
    const min = i - count;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        str = str + temp;
    }
    return str;
};

const decrypt_login_xyz = (username, decrypt_password, nonce) => {
    const str = '/nr/user/login/loginByAccount?AppKey=joker&account=' + username + '&password=' + decrypt_password + '&state=1&nonce=' + nonce;
    return md5(str);
};

const decrypt_wechat_detail_xyz = (uid, nonce) => {
    const str = '/xdnphb/detail/v1/rank/article/lists?AppKey=joker&account=' + uid + '&nonce=' + nonce;
    return md5(str);
};

const decrypt_douyin_account_xyz = (nonce) => {
    const str = '/xdnphb/nr/cloud/douyin/detail/accountInfoAll?AppKey=joker&nonce=' + nonce;
    return md5(str);
};

const decrypt_douyin_detail_xyz = (nonce) => {
    const str = '/xdnphb/nr/cloud/douyin/detail/aweme?AppKey=joker&nonce=' + nonce;
    return md5(str);
};

const flatten = (arr) => {
    const result = [];
    for (const val of arr) {
        if (Array.isArray(val)) {
            result.push(...flatten(val));
        } else {
            result.push(val);
        }
    }
    return result;
};

function shouldUpdateCookie(forcedUpdate = false) {
    if (forcedUpdate) {
        cache.set(query_count, 0);
    } else {
        const count = cache.get(query_count);
        if (count) {
            if (count > max_query_count) {
                cache.set(query_count, 0);
                clearCookie();
            } else {
                cache.set(query_count, count + 1);
            }
        } else {
            cache.set(query_count, 1);
        }
    }
}

function clearCookie() {
    cache.set(newrank_cookie_token, null);
}

// 加了验证码失效了
async function getCookie() {
    // Check if this key should be replace? every 30 times should be fine.
    shouldUpdateCookie();
    let token = await cache.get(newrank_cookie_token);
    const username = String(config.newrank.username);
    const password = md5(md5(String(config.newrank.password)) + 'daddy');
    const nonce = random_nonce(9);
    const xyz = decrypt_login_xyz(username, password, nonce);
    if (!token) {
        const indexResponse = await got({
            method: 'post',
            url: 'https://www.newrank.cn/nr/user/login/loginByAccount',
            form: {
                account: username,
                password,
                state: 1,
                nonce,
                xyz,
            },
        });
        const set_cookie = indexResponse.headers['set-cookie'];
        if (set_cookie) {
            for (const e of set_cookie) {
                if (e.indexOf('token') === 0) {
                    token = e.split(';')[0];
                }
            }
        }
        cache.set(newrank_cookie_token, token, 600);
        // We have acquired new cookie. It may due to cache timeout.
        // Force update counter and don't wait it finished.
        shouldUpdateCookie(true);
    }
    return token;
}

export default { getCookie, random_nonce, decrypt_wechat_detail_xyz, decrypt_douyin_account_xyz, decrypt_douyin_detail_xyz, flatten };
