const { news } = require('./data');

module.exports = {
    'sdu.edu.cn': {
        _name: '山东大学',
        'xinwen.wh': Object.entries(news.columns).map(([, value]) => ({
            title: value.name,
            docs: news.docs,
            source: news.source,
            target: '/sdu/wh/' + news.getTarget(value.url),
        })),
    },
};
