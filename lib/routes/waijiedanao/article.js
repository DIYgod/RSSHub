const got = require('@/utils/got');

const config = {
    all: {
        tag: '',
        title: '全部',
    },
    news: {
        tag: '5d5cd50782339df472961be2',
        title: '新闻',
    },
    finance: {
        tag: '5d54f50982339df47289354b',
        title: '金融',
    },
    blockchain: {
        tag: '5d7b034682339df472b3e449',
        title: '区块链',
    },
    internet: {
        tag: '5d7b034682339df472b3e453',
        title: '互联网',
    },
    tech: {
        tag: '5d54f50982339df472893547',
        title: '科技',
    },
    newmedia: {
        tag: '5d5cd50782339df472961bdb',
        title: '新媒体',
    },
    business: {
        tag: '5d7b034682339df472b3e44b',
        title: '商业思考',
    },
    hundred: {
        tag: '5d7b034682339df472b3e44f',
        title: '行业 100 强',
    },
    ecommerce: {
        tag: '5d7b034682339df472b3e456',
        title: '电商',
    },
    entertainment: {
        tag: '5d54f50982339df472893543',
        title: '娱乐',
    },
    life: {
        tag: '5d7b034682339df472b3e45a',
        title: '生活',
    },
};

module.exports = async (ctx) => {
    const cfg = config[ctx.params.caty];
    if (!cfg) {
        throw Error('Bad category. See <a href="https://docs.rsshub.app/new-media.html#wai-jie-da-nao-wen-zhang">docs</a>');
    }

    const currentUrl = `https://www.waijiedanao.com/api/posts?tag=${cfg.tag}&page=1&limit=20`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = response.data.data.map((item) => ({
        title: item.title,
        link: item.link,
        description: item.digest,
        pubDate: new Date(item.publishAt).toUTCString(),
    }));

    ctx.state.data = {
        title: `外接大脑 - ${cfg.title}`,
        link: 'https://www.waijiedanao.com/',
        item: list,
    };
};
