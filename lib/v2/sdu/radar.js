const { wh } = require('./data');

module.exports = {
    'sdu.edu.cn': {
        _name: '山东大学',
        'xinwen.wh': Object.entries(wh.news.columns).map(([, value]) => ({
            title: wh.news.titlePrefix + value.name,
            docs: wh.news.docs,
            source: wh.news.source,
            target: '/sdu/wh' + wh.news.getTarget(value.url),
        })),
    },
};
