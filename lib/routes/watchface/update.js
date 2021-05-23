const got = require('@/utils/got');

const watch_names = {
    mi4: '小米手环4',
    gtr47: '华米GTR 47mm',
    gvlite: '华米智能手表青春版',
};

const list_names = {
    0: '最新上传',
    1: '最多下载',
    2: '试试手气',
    recommends: '编辑推荐',
};

module.exports = async (ctx) => {
    const watch_type = ctx.params.watch_type ? ctx.params.watch_type : 'mi4';
    const list_type = ctx.params.list_type ? ctx.params.list_type : '0';
    const watch_name = watch_names[watch_type] ? watch_names[watch_type] : watch_type;
    const list_name = list_names[list_type] ? list_names[list_type] : list_type;

    const response = await got({
        method: 'get',
        url: `http://212.64.68.41:8081/watchface/list/${list_type}/1/10`,
        headers: {
            type: watch_type,
        },
    });
    const list = response.data.data;

    ctx.state.data = {
        title: `米坛社区表盘 - ${watch_name} - ${list_name}`,
        link: 'http://watchface.pingx.tech/h5/',
        item: list.map((item) => ({
            title: item.name,
            author: item.nickname,
            description: `<img src="${item.preview}" /><p>${item.desc}</p>`,
            pubDate: new Date(item.updatedAt * 1),
            link: `http://watchface.pingx.tech/h5/#/pages/detail/detail?id=${item.id}`,
        })),
    };
};
