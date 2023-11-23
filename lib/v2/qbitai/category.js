const got = require('@/utils/got');
const xml2js = require('xml2js');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { category } = ctx.params;

    const { data } = await got(`https://www.qbitai.com/category/${category}/feed`, {
        headers: {
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        },
        searchParams: {
            per_page: ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30,
        },
    });

    // 将 HTML 响应解析为 xml
    let parsed_data;
    const xml_parser = new xml2js.Parser();
    xml_parser.parseString(data, (err, result) => {
        parsed_data = result.rss.channel[0].item;
    });

    // 从 API 响应中提取相关数据
    const items = parsed_data.map((item) => ({
        // 文章标题
        title: item.title[0],
        // 文章链接
        link: item.link[0],
        // 文章正文
        description: item['content:encoded'][0],
        // 文章发布日期
        pubDate: parseDate(item.pubDate),
        // 如果有的话，文章作者
        author: '量子位',
        // 如果有的话，文章分类
        category: item.category,
    }));

    ctx.state.data = {
        // 源标题
        title: `量子位-${category}`,
        // 源链接
        link: `https://www.qbitai.com/category/${category}`,
        // 源文章
        item: items,
    };
};
