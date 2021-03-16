const got = require('@/utils/got');
const config = require('@/config').value;

function reset() {
    config.xhu = {
        access_token: '',
        count: 0,
    };
}

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

        if (config.xhu.access_token === '') {
            const res = await got.get('https://xhu.privacyhide.com/regToken');
            config.xhu.access_token = res.data.access_token || '';
            config.xhu.headers = res.data.headers;
        }

        if (config.xhu.access_token === '') {
            throw 'get access_token failed';
        }

        return config.xhu;
    },
};
