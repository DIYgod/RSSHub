const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://www.cn-healthcare.com';
module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `${baseUrl}/api/article/articlelist?data={%22start%22:%221%22,%22size%22:%2250%22,%22arctype%22:%220%22,%22wmstart%22:%220%22,%22flag%22:%222%22}`,
    });
    const data = response.data.data;
    const name = '健康界 [cn-healthcare] ';
    ctx.state.data = {
        // 源标题
        title: name,
        // 源链接
        link: 'https://www.cn-healthcare.com',
        // 源说明
        description: `${name} - RSS`,
        // 遍历此前获取的数据
        item: data.datalist.map((item) => ({
            // 文章标题
            title: item.title,
            // 文章正文
            description: item.content,
            // 文章发布时间
            pubDate: parseDate(item.createdate),
            // 文章链接
            link: `${baseUrl}${item.url}`,
        })),
    };
};
