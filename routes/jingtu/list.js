const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://api.yii.dgtle.com/v2/whale-picture/list?page=1&dateline=0&version=3.9&sift=dateline&perpage=100',
    });
    const data = response.data.list;
    ctx.state.data = {
        title: '鲸图',
        from: '数字尾巴手机端鲸图',
        link: 'http://www.dgtle.com/',
        item: data.map((item) => ({
            title: item.content,
            author: item.author,
            description: item.content,
            type: item.type,
            link: item.pic_url,
            width: item.width,
            height: item.height,
        })),
    };
};
