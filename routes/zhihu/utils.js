const config = require('../../config');

module.exports = {
    header: {
        'User-Agent': config.ua,
        cookie: config.zhihu.cookie,
        'x-api-version': '3.0.40',
        'x-udid': 'AMAiMrPqqQ2PTnOxAr5M71LCh-dIQ8kkYvw=',
    },
};
