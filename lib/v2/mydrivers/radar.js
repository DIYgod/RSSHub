module.exports = {
    'mydrivers.com': {
        _name: '快科技',
        m: [
            {
                title: '最新',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-zui-xin',
                source: ['/'],
                target: '/mydrivers/new',
            },
            {
                title: '热门',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-re-men',
                source: ['/'],
                target: '/mydrivers/hot',
            },
            {
                title: '发布会',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fa-bu-hui',
                source: ['/'],
                target: '/mydrivers/zhibo',
            },
            {
                title: '排行',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-pai-hang',
                source: ['/newsclass.aspx'],
                target: '/mydrivers/rank',
            },
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx'],
                target: (params, url) => {
                    url = new URL(url);

                    const theParam = [...url.searchParams.entries()]
                        .filter(([key, value]) => key && value !== '')
                        .map(([key, value]) => `${key}/${value}`)
                        .pop();

                    return `/mydrivers/${theParam}`;
                },
            },
            {
                title: '板块 - 电脑',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?bcid=801'],
                target: '/mydrivers/bcid/801',
            },
            {
                title: '板块 - 手机',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?bcid=802'],
                target: '/mydrivers/bcid/802',
            },
            {
                title: '板块 - 汽车',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?bcid=807'],
                target: '/mydrivers/bcid/807',
            },
            {
                title: '板块 - 业界',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?bcid=803'],
                target: '/mydrivers/bcid/803',
            },
            {
                title: '板块 - 游戏',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?bcid=806'],
                target: '/mydrivers/bcid/806',
            },
            {
                title: '话题 - 科学',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?tid=1000'],
                target: '/mydrivers/tid/1000',
            },
            {
                title: '话题 - 排行',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?tid=1001'],
                target: '/mydrivers/tid/1001',
            },
            {
                title: '话题 - 评测',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?tid=1002'],
                target: '/mydrivers/tid/1002',
            },
            {
                title: '话题 - 一图',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?tid=1003'],
                target: '/mydrivers/tid/1003',
            },
            {
                title: '品牌 - 安卓',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?icid=121'],
                target: '/mydrivers/icid/121',
            },
            {
                title: '品牌 - 阿里',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?icid=270'],
                target: '/mydrivers/icid/270',
            },
            {
                title: '品牌 - 微软',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?icid=90'],
                target: '/mydrivers/icid/90',
            },
            {
                title: '品牌 - 百度',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?icid=67'],
                target: '/mydrivers/icid/67',
            },
            {
                title: '品牌 - PS5',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?icid=6950'],
                target: '/mydrivers/icid/6950',
            },
            {
                title: '品牌 - Xbox',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?icid=194'],
                target: '/mydrivers/icid/194',
            },
            {
                title: '品牌 - 华为',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?icid=136'],
                target: '/mydrivers/icid/136',
            },
            {
                title: '品牌 - 小米',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?icid=9355'],
                target: '/mydrivers/icid/9355',
            },
            {
                title: '品牌 - VIVO',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?icid=288'],
                target: '/mydrivers/icid/288',
            },
            {
                title: '品牌 - 三星',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?icid=154'],
                target: '/mydrivers/icid/154',
            },
            {
                title: '品牌 - 魅族',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?icid=140'],
                target: '/mydrivers/icid/140',
            },
            {
                title: '品牌 - 一加',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?icid=385'],
                target: '/mydrivers/icid/385',
            },
            {
                title: '品牌 - 比亚迪',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?icid=770'],
                target: '/mydrivers/icid/770',
            },
            {
                title: '品牌 - 小鹏',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?icid=7259'],
                target: '/mydrivers/icid/7259',
            },
            {
                title: '品牌 - 蔚来',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?icid=7318'],
                target: '/mydrivers/icid/7318',
            },
            {
                title: '品牌 - 理想',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?icid=12947'],
                target: '/mydrivers/icid/12947',
            },
            {
                title: '品牌 - 奔驰',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?icid=429'],
                target: '/mydrivers/icid/429',
            },
            {
                title: '品牌 - 宝马',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?icid=461'],
                target: '/mydrivers/icid/461',
            },
            {
                title: '品牌 - 大众',
                docs: 'https://docs.rsshub.app/routes/new-media#kuai-ke-ji-fen-lei',
                source: ['/newsclass.aspx?icid=481'],
                target: '/mydrivers/icid/481',
            },
        ],
    },
};
