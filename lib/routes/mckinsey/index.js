const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || '';
    const title = {
        autos: '汽车',
        'banking-insurance': '金融服务',
        'business-technology': '数字化',
        consumers: '消费者',
        'healthcare-pharmaceuticals': '医药与医疗',
        'mckinsey-global-institute': '麦肯锡全球研究院',
        全球基础材料: '全球基础材料',
        innovation: '创新',
        macroeconomy: '宏观经济',
        manufacturing: '制造业',
        'talent-leadership': '人才与领导力',
        'technology-media-and-telecom': '技术，媒体与通信',
        'urbanization-sustainability': '城市化与可持续发展',
        'capital-projects-infrastructure': '资本项目和基础设施',
        交通运输与物流: '旅游、运输和物流',
    };
    const response = await got.get(`https://www.mckinsey.com.cn/insights/${category}`);
    const $ = cheerio.load(response.data);

    const articles = $('.fusion-column h4 a')
        .map((index, ele) => ({
            title: $(ele).text(),
            link: $(ele).attr('href'),
        }))
        .get();

    const item = await Promise.all(
        articles.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got.get(item.link);
                const doc = cheerio.load(res.data);
                item.description = doc('#content').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: category ? `McKinsey Greater China - ${title[category]}` : `McKinsey Greater China`,
        link: 'https://www.mckinsey.com.cn/',
        item,
    };
};
