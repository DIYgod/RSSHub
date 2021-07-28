const got = require('@/utils/got');

module.exports = async (ctx) => {
    const classes = {
        1: '职业技能',
        7: '企业家/管理者',
        8: '程序员',
        9: '产品经理',
        10: '运营/市场营销',
        11: '人事/培训/行政',
        12: '法律/法务',
        13: '医学/药学/保健',
        14: '银行/金融/证券/保险',
        15: '电商/微商/零售',
        16: '编辑/媒体/出版',
        17: '机械/电子/制造业',
        58: '城市/建筑/房地产',
        59: '其他技能',

        2: '考研考证',
        18: '研究生考试',
        19: '建考',
        20: '法考',
        21: '教师资格证',
        22: '公考',
        23: '英语',
        24: '医考',
        25: '会计师',
        26: '计算机',
        27: '专升本',

        3: '生活娱乐',
        29: '体育',
        30: '音乐',
        31: '影视',
        32: '旅游',
        33: '游戏',
        34: '兴趣',
        56: '生活',

        4: '校园教育',
        35: '大学',
        36: '高中',
        37: '初中',
        38: '小学',
        39: '教育',

        5: '读书笔记',
        40: '文学作品',
        41: '心灵成长',
        42: '经管知识',
        43: '终身学习',
        44: '通用知识',
        45: '知识栏目',

        6: '创意脑图',
        46: '长图',
        47: '鱼骨图',
        48: '时间线',
        49: '圆圈图',
        50: '组织结构',
        51: '树状图',
        57: '程图',
    };

    const classId = ctx.params.classId && ctx.params.classId !== '0' ? '&classId=' + ctx.params.classId : '';
    const order = ctx.params.order || 'PV';
    const sort = ctx.params.sort || 'DESC';
    const search = ctx.params.search || '';
    const lang = ctx.params.lang || 'CN';
    const price = ctx.params.price || '1';

    let currentUrl;

    if (ctx.params.search) {
        currentUrl = `https://masterapi.edrawsoft.cn/api/publish?offset=0&count=30&order=PV&sort=DESC&search=${search}&lang=CN&price=1`;
    } else {
        currentUrl = `https://masterapi.edrawsoft.cn/api/publish${classId === '' ? '' : '2'}?offset=0&count=30${classId}&order=${order}&sort=${sort}&lang=${lang}&price=${price}`;
    }

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = response.data.data.map((item) => ({
        title: item.title,
        author: item.author,
        link: `https://mm.edrawsoft.cn/template/${item.id}`,
        description: `<p>${item.description}</p><img src="https://edrawcloudpubliccn.oss-cn-shenzhen.aliyuncs.com/${item.url}main.svg">`,
        pubDate: new Date(item.created_at).toUTCString(),
    }));

    ctx.state.data = {
        title: `思维导图社区 - ${search === '' ? (classId === '' ? '全部' : classes[ctx.params.classId]) : search}`,
        link: currentUrl,
        item: list,
    };
};
