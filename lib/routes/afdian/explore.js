const got = require('@/utils/got');

const categoryMap = {
    所有: '',
    绘画: '1d2c1ac230dd11e88a2052540025c377',
    视频: '68cf9fc630dd11e8aca852540025c377',
    写作: '9db3776230dd11e89c6c52540025c377',
    游戏: 'ed45455e30dc11e89fd452540025c377',
    音乐: 'f89c99b22e6f11e8940c52540025c377',
    播客: '5378451a30dd11e8bd4f52540025c377',
    摄影: 'ffa47c662e6f11e8b26952540025c377',
    技术: 'f62d3e58c39211e88abd52540025c377',
    Vtuber: 'e4f952e865cc11e98fb252540025c377',
    舞蹈: '98a30fda836b11e9bbf152540025c377',
    体育: 'f2212a3c836c11e9842d52540025c377',
    旅游: '3935643c836e11e98cc552540025c377',
    美食: 'c8d2eaae837011e9bfb652540025c377',
    时尚: '05e960f6837311e9984952540025c377',
    数码: 'd6163d8c837611e98ac352540025c377',
    动画: '67498b10837711e99f0652540025c377',
    其他: 'b1643af4328011e8b5b152540025c377',
};

const typeToLabel = {
    rec: '推荐',
    hot: '人气',
};

module.exports = async (ctx) => {
    const { type = 'rec', category = '所有' } = ctx.params;
    const baseUrl = 'https://afdian.net';
    const link = `${baseUrl}/api/creator/list`;
    const res = await got(link, {
        searchParams: {
            type,
            category_id: categoryMap[category],
        },
    });
    const list = res.data.data.list.map((item) => {
        const { doing, monthly_fans, detail } = item.creator;
        return {
            title: item.name,
            description: `正在创作 ${doing}<br/>
            ${monthly_fans}发电人次/月<br/>
            详情:<br/>
            ${detail}<br/>
            `,
            link: `${baseUrl}/@${item.url_slug}`,
        };
    });
    ctx.state.data = {
        title: `爱发电-创作者 (按 ${category}/${typeToLabel[type]})`,
        description: `爱发电-发现创作者 (按 ${category}/${typeToLabel[type]})`,
        link: `${baseUrl}/explore`,
        item: list,
    };
};
