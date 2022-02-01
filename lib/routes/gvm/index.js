const got = require('got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'newest';
    let suffix = '/newest';

    const options = {
        newest: '最新文章',
        recommend: '你可能會喜歡',
        opinion: '名家專欄',
        topic: '專題',
        news: '時事熱點',
        politics: '政治',
        society: '社會',
        figure: '人物報導',
        world: '國際',
        world_focus: '全球焦點',
        cross_strait_politics: '兩岸',
        money: '金融理財',
        investment: '投資理財',
        insurance: '保險規劃',
        retire: '退休理財',
        fintech: '金融Fintech',
        real_estate: '房地產',
        economy: '總體經濟',
        tech: '科技',
        tech_trend: '科技趨勢',
        energy: '能源',
        business: '產經',
        industry: '傳產',
        service: '消費服務',
        medical: '生技醫藥',
        family_business_succession: '傳承轉型',
        startup: '創業新創',
        management: '管理',
        agriculture: '農業',
        education: '教育',
        higher_education: '高教',
        technological: '技職',
        parent: '親子教育',
        world_education: '國際文教',
        sports: '體育',
        life: '好享生活',
        art: '時尚設計',
        self_growth: '心靈成長',
        film: '藝文影視',
        travel: '旅遊',
        environment: '環境生態',
        health: '健康',
        food: '美食',
        career: '職場生涯',
        survey: '調查',
        county: '縣市',
        csr: 'CSR',
    };

    if (category !== 'newest' && category !== 'recommend') {
        suffix = `/category/${category}`;
    }

    const response = await got({
        method: 'get',
        url: 'https://www.gvm.com.tw' + suffix,
    });

    const $ = cheerio.load(response.body);

    const articles = $('#article_list .article-list-item .article-list-item__intro')
        .map((index, ele) => ({
            title: $('a', ele).text(),
            link: $('a', ele).attr('href'),
            pubDate: new Date($('.time', ele).text()),
            author: $('.author', ele).text(),
        }))
        .get();

    const item = await Promise.all(
        articles.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got.get(item.link);
                const content = cheerio.load(res.body);
                item.description = content('.article-content').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `遠見 - ${options[category]}`,
        link: 'https://www.gvm.com.tw' + suffix,
        item,
    };
};
