const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const category = ctx.params.category.toLowerCase();

    let host = `https://minapp.com/api/v5/trochili/post/?category=${category}&post_type=article&limit=10`;

    if (category === 'all') {
        host = 'https://minapp.com/api/v5/trochili/post/?post_type=article&limit=10';
    }

    let title;
    switch (category) {
        case 'news':
            title = '小程序资讯';
            break;
        case 'cloud':
            title = '知晓云';
            break;
        case 'recommendation':
            title = '小程序推荐';
            break;
        case 'rank':
            title = '榜单';
            break;
        case 'group':
            title = '晓组织';
            break;
        case 'capability':
            title = '新能力';
            break;
        case 'qa':
            title = '小程序问答';
            break;
        default:
            break;
    }

    const response = await axios.get(host);

    const list = response.data.objects;

    const out = list.map((item) => ({
        title: item.title,
        link: `https://minapp.com/article/${item.id}`,
        author: item.created_by.nickname,
        description: item.content,
        pubDate: new Date(item.created_at * 1000).toUTCString(),
    }));

    ctx.state.data = {
        title: `知晓程序${title ? ' - ' + title : ''}`,
        description: '知晓程序 | 一扫即用的小程序大全',
        link: `https://minapp.com/article/?page=1&category=${category}`,
        item: out,
    };
};
