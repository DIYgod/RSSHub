const got = require('@/utils/got');
const dateParser = require('@/utils/dateParser');
const MarkdownIt = require('markdown-it');

module.exports = async (ctx) => {
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: 'https://www.lanqiao.cn/api/v2/questions/?topic_type=newest&sort=created_time/',
        headers: {
            Referer: 'https://www.lanqiao.cn/questions/',
        },
    });

    const data = response.data.results; // response.data 为 HTTP GET 请求返回的数据对象
    // 这个对象中包含了数组名为 results，所以 response.data.results 则为需要的数据
    const md = new MarkdownIt();
    const items = await Promise.all(
        data.map((item) =>
            ctx.cache.tryGet(`https://www.lanqiao.cn/api/v2/questions/${item.id}/`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: `https://www.lanqiao.cn/api/v2/questions/${item.id}/`,
                });
                const detail = detailResponse.data;

                item.title = detail.title;
                item.description = md.render(detail.content);
                item.author = detail.author.name;
                item.pubDate = dateParser(detail.created_at);
                item.link = `https://www.lanqiao.cn/questions/${detail.id}/`;
                return item;
            })
        )
    );
    ctx.state.data = {
        // 源标题
        title: '蓝桥云课社区技术问答',
        // 源链接
        link: 'https://www.lanqiao.cn/questions/',
        // 源说明
        description: '蓝桥云课社区最新技术问答',
        // 遍历此前获取的数据
        item: items,
    };
};
