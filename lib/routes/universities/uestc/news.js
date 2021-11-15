import got from '~/utils/got.js';
import cheerio from 'cheerio';

const listUrl = 'http://www.new1.uestc.edu.cn//?n=UestcNews.Front.Category.Page&CatId=';
const baseUrl = 'http://www.new1.uestc.edu.cn';
const map = {
    academy: '66',
    culture: '67',
    announcement: '68',
    notification: '72',
};
export default async (ctx) => {
    const {
        type = 'announcement'
    } = ctx.params;

    const {
        data
    } = await got({
        method: 'get',
        url: listUrl + map[type],
    });
    const $ = cheerio.load(data);
    ctx.state.data = {
        title: '电子科技大学新闻中心',
        link: baseUrl,
        item: $('div[id="Degas_news_list"] ul li h3 a')
            .slice(0, 10)
            .map((_, elem) => ({
                link: baseUrl + elem.attribs.href,
                title: $(elem).text(),
                pubDate: new Date($(elem).parent('h3').next('span').text()).toUTCString(),
            }))
            .get(),
    };
};
