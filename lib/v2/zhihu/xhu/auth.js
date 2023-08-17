const got = require('@/utils/got');
const config = require('@/config').value;

function reset() {
    config.xhu = {
        cookie: undefined,
        udid: '',
        sn: '',
        access_token: '',
        count: 0,
    };
}

const ProcessCookie = (cookie) => cookie.map((cookie) => cookie.split(';')[0]).join('; ');

const ProcessNewCookie = (oldCookie, newCookie) => {
    const oldCookieArray = oldCookie.split('; ');
    const newCookieArray = newCookie.map((cookie) => cookie.split(';')[0]);
    return oldCookieArray.concat(newCookieArray).join('; ');
};

module.exports = {
    Reset: () => {
        reset();
    },
    Get: async () => {
        if (!config.xhu) {
            reset();
        }

        if (config.xhu.count++ > 512) {
            reset();
        }

        if (config.xhu.cookie === undefined) {
            const udidResponse = await got({
                method: 'get',
                url: 'https://api.zhihuvvv.workers.dev/appcloud/v1/device',
                headers: {
                    Referer: 'https://api.zhihuvvv.workers.dev',
                },
            });
            config.xhu.udid = udidResponse.data.udid;
            config.xhu.sn = udidResponse.data.sn;
            config.xhu.cookie = ProcessCookie(udidResponse.headers['set-cookie']);
            const accessTokenResponse = await got({
                method: 'get',
                url: 'https://api.zhihuvvv.workers.dev/guests/token',
                headers: {
                    Referer: 'https://api.zhihuvvv.workers.dev',
                    Cookie: config.xhu.cookie,
                },
            });
            config.xhu.access_token = accessTokenResponse.data.access_token;
            config.xhu.cookie = ProcessNewCookie(config.xhu.cookie, accessTokenResponse.headers['set-cookie']);
        }

        if (config.xhu.access_token === '') {
            throw new Error('get access_token failed');
        }

        return config.xhu;
    },
};
