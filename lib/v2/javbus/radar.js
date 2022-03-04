const westernJavbus = {
    _name: 'JavBus',
    www: [
        {
            title: '首页 / 欧陆风云',
            docs: 'https://docs.rsshub.app/multimedia.html#javbus',
            source: '/',
            target: '/javbus/western/home',
        },
        {
            title: '分类 / 欧陆风云',
            docs: 'https://docs.rsshub.app/multimedia.html#javbus',
            source: '/genre/:gid',
            target: '/javbus/western/genre/:gid',
        },
        {
            title: '演员 / 欧陆风云',
            docs: 'https://docs.rsshub.app/multimedia.html#javbus',
            source: '/star/:sid',
            target: '/javbus/western/star/:sid',
        },
        {
            title: '系列 / 欧陆风云',
            docs: 'https://docs.rsshub.app/multimedia.html#javbus',
            source: '/series/:seriesid',
            target: '/javbus/western/series/:seriesid',
        },
    ],
};

module.exports = {
    'javbus.com': {
        _name: 'JavBus',
        www: [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/multimedia.html#javbus',
                source: '/',
                target: '/javbus/home',
            },
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/multimedia.html#javbus',
                source: '/genre/:gid',
                target: '/javbus/genre/:gid',
            },
            {
                title: '演员',
                docs: 'https://docs.rsshub.app/multimedia.html#javbus',
                source: '/star/:sid',
                target: '/javbus/star/:sid',
            },
            {
                title: '系列',
                docs: 'https://docs.rsshub.app/multimedia.html#javbus',
                source: '/series/:seriesid',
                target: '/javbus/series/:seriesid',
            },
            {
                title: '制作商',
                docs: 'https://docs.rsshub.app/multimedia.html#javbus',
                source: '/studio/:studioid',
                target: '/javbus/studio/:studioid',
            },
            {
                title: '发行商',
                docs: 'https://docs.rsshub.app/multimedia.html#javbus',
                source: '/label/:labelid',
                target: '/javbus/label/:labelid',
            },
            {
                title: '首页 / 步兵',
                docs: 'https://docs.rsshub.app/multimedia.html#javbus',
                source: '/uncensored',
                target: '/javbus/uncensored/home',
            },
            {
                title: '分类 / 步兵',
                docs: 'https://docs.rsshub.app/multimedia.html#javbus',
                source: '/uncensored/genre/:gid',
                target: '/javbus/uncensored/genre/:gid',
            },
            {
                title: '演员 / 步兵',
                docs: 'https://docs.rsshub.app/multimedia.html#javbus',
                source: '/uncensored/star/:sid',
                target: '/javbus/uncensored/star/:sid',
            },
            {
                title: '系列 / 步兵',
                docs: 'https://docs.rsshub.app/multimedia.html#javbus',
                source: '/uncensored/series/:seriesid',
                target: '/javbus/uncensored/series/:seriesid',
            },
        ],
    },
    'javbus.one': westernJavbus,
    'javbus.org': westernJavbus,
};
