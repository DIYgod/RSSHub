const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'https://item.jd.com';
    const currentUrl = `${rootUrl}/${id}.html`;
    const apiUrl = `http://p.3.cn/prices/mgets?skuIds=J_${id}`;

    const apiResponse = await got({
        method: 'get',
        url: apiUrl,
    });

    const data = apiResponse.data[0];

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const title = response.data.match(/name: '(.*?)'/)[1];

    ctx.state.data = {
        title: `京东商品价格 - ${title}`,
        link: currentUrl,
        item: [
            {
                guid: data.p,
                title: data.p,
                link: currentUrl,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    p: data.p,
                    op: data.op,
                    m: data.m,
                }),
            },
        ],
    };
};
