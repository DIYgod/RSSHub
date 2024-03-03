const javbus = {
    _name: 'JavBus',
    www: [
        {
            title: '有码 - 首页',
            docs: 'https://docs.rsshub.app/routes/multimedia#javbus',
            source: '/',
            target: '/javbus',
        },
        {
            title: '有码 - 分类',
            docs: 'https://docs.rsshub.app/routes/multimedia#javbus',
            source: '/genre/:id',
            target: '/javbus/genre/:id',
        },
        {
            title: '有码 - 演员',
            docs: 'https://docs.rsshub.app/routes/multimedia#javbus',
            source: '/star/:id',
            target: '/javbus/star/:id',
        },
        {
            title: '有码 - 系列',
            docs: 'https://docs.rsshub.app/routes/multimedia#javbus',
            source: '/series/:id',
            target: '/javbus/series/:id',
        },
        {
            title: '有码 - 制作商',
            docs: 'https://docs.rsshub.app/routes/multimedia#javbus',
            source: '/studio/:id',
            target: '/javbus/studio/:id',
        },
        {
            title: '有码 - 发行商',
            docs: 'https://docs.rsshub.app/routes/multimedia#javbus',
            source: '/label/:id',
            target: '/javbus/label/:id',
        },
        {
            title: '有码 - 导演',
            docs: 'https://docs.rsshub.app/routes/multimedia#javbus',
            source: '/director/:id',
            target: '/javbus/director/:id',
        },
        {
            title: '有码 - 搜索',
            docs: 'https://docs.rsshub.app/routes/multimedia#javbus',
            source: '/search/:keyword',
            target: '/javbus/search/:keyword',
        },
        {
            title: '无码 - 首页',
            docs: 'https://docs.rsshub.app/routes/multimedia#javbus',
            source: '/uncensored',
            target: '/javbus/uncensored',
        },
        {
            title: '无码 - 分类',
            docs: 'https://docs.rsshub.app/routes/multimedia#javbus',
            source: '/uncensored/genre/:id',
            target: '/javbus/uncensored/genre/:id',
        },
        {
            title: '无码 - 演员',
            docs: 'https://docs.rsshub.app/routes/multimedia#javbus',
            source: '/uncensored/star/:id',
            target: '/javbus/uncensored/star/:id',
        },
        {
            title: '无码 - 系列',
            docs: 'https://docs.rsshub.app/routes/multimedia#javbus',
            source: '/uncensored/series/:id',
            target: '/javbus/uncensored/series/:id',
        },
        {
            title: '无码 - 制作商',
            docs: 'https://docs.rsshub.app/routes/multimedia#javbus',
            source: '/uncensored/studio/:id',
            target: '/javbus/uncensored/studio/:id',
        },
        {
            title: '无码 - 搜索',
            docs: 'https://docs.rsshub.app/routes/multimedia#javbus',
            source: '/uncensored/search/:keyword',
            target: '/javbus/uncensored/search/:keyword',
        },
    ],
};

const westernJavbus = {
    _name: 'JavBus',
    www: [
        {
            title: '欧美 - 首页',
            docs: 'https://docs.rsshub.app/routes/multimedia#javbus',
            source: '/',
            target: '/javbus/western',
        },
        {
            title: '欧美 - 分类',
            docs: 'https://docs.rsshub.app/routes/multimedia#javbus',
            source: '/genre/:id',
            target: '/javbus/western/genre/:id',
        },
        {
            title: '欧美 - 演员',
            docs: 'https://docs.rsshub.app/routes/multimedia#javbus',
            source: '/star/:id',
            target: '/javbus/western/star/:id',
        },
        {
            title: '欧美 - 系列',
            docs: 'https://docs.rsshub.app/routes/multimedia#javbus',
            source: '/series/:id',
            target: '/javbus/western/series/:id',
        },
        {
            title: '欧美 - 制作商',
            docs: 'https://docs.rsshub.app/routes/multimedia#javbus',
            source: '/studio/:id',
            target: '/javbus/western/studio/:id',
        },
        {
            title: '欧美 - 搜索',
            docs: 'https://docs.rsshub.app/routes/multimedia#javbus',
            source: '/search/:keyword',
            target: '/javbus/western/search/:keyword',
        },
    ],
};

export default {
    'javbus.com': javbus,
    'javsee.club': javbus,
    'javsee.icu': javbus,
    'javsee.work': javbus,
    'seejav.bar': javbus,
    'seejav.bid': javbus,
    'seejav.blog': javbus,
    'seejav.cloud': javbus,
    'seejav.club': javbus,
    'seejav.men': javbus,
    'seejav.pw': javbus,

    'javbus.one': westernJavbus,
    'javbus.org': westernJavbus,
    'javbus.red': westernJavbus,
};
