module.exports = {
    'uibe.edu.cn': {
        _name: '对外经济贸易大学',
        hr: [
            {
                title: '人力资源处',
                docs: 'https://docs.rsshub.app/university.html#dui-wai-jing-ji-mao-yi-da-xue-ren-li-zi-yuan-chu',
                source: ['/:category/:type', '/:category', '/'],
                target: '/uibe/hr/:category?/:type?',
            },
        ],
        yjsy: [
            {
                title: '研究生院',
                docs: 'https://docs.rsshub.app/university.html#dui-wai-jing-ji-mao-yi-da-xue-ren-li-zi-yuan-chu',
                source: ['/cms/info.do?columnId=:type'],
                target: '/uibe/yjsy/:type',
            },
        ],
    },
};
