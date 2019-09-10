const got = require('@/utils/got');
const config = require('@/config');

module.exports = async (ctx) => {
    const url = 'http://chuiniu.duanshu.com';
    const column_id = ctx.params.id;

    let response = await got({
        method: 'get',
        url: 'http://api.duanshu.com/fairy/api/v1/shop/identifier/',
        headers: {
            Origin: url,
            Referer: url,
        },
    });
    const shop_id = response.data.shop_id;

    response = await got({
        method: 'get',
        url: `http://api.duanshu.com/h5/content/free/column/detail/${column_id}?shop_id=${shop_id}`,
        headers: {
            Referer: url,
        },
    });
    const title = response.data.response.data.title;
    const description = response.data.response.data.brief;

    response = await got({
        method: 'get',
        url: `http://api.duanshu.com/h5/content/column/contents?page=1&count=10&column_id=${column_id}&shop_id=${shop_id}`,
        headers: {
            Referer: url,
        },
    });
    const list = response.data.response.data;

    const out = await Promise.all(
        list.map(async (item) => {
            const title = item.title;
            const brief = item.brief;
            const up_time = item.up_time;
            const content_id = item.content_id;

            const member = config.chuiniu.member;
            let content;
            try {
                const response = await got({
                    method: 'get',
                    url: `http://api.duanshu.com/h5/content/detail/${content_id}?shop_id=${shop_id}`,
                    headers: {
                        Referer: url,
                        'x-member': member,
                    },
                });
                content = response.data.response.data.content;
            } catch (error) {
                content = brief + '<br>...<br>正文内容需会员登录后查看';
            }

            const single = {
                pubDate: new Date(up_time).toUTCString(),
                link: `http://chuiniu.duanshu.com/#/brief/article/${content_id}`,
                title: title,
                description: content,
            };

            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title,
        description,
        link: url,
        item: out,
    };
};
