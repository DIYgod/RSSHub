const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const url = 'http://adr.meizitu.net/wp-json/wp/v2/tags?orderby=count&order=desc&per_page=100';

    const response = await axios({
        method: 'get',
        url: url,
    });
    const data = response.data;

    ctx.state.data = {
        title: '妹子图专题',
        link: 'http://www.mzitu.com/zhuanti',
        description: '妹子图美女专题栏目,为您精心准备各种美女图片专题,包括名站美女写真,妹子特点分类,美女大全等专题。',
        item: data.map((item) => ({
            title: item.name,
            description: `${item.name}`,
            link: `http://www.mzitu.com/tag/${item.slug}`,
        })),
    };
};
