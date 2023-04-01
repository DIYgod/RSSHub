const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://jnmhc.jinan.gov.cn';
    const url = 'https://jnmhc.jinan.gov.cn/module/web/jpage/dataproxy.jsp?page=1&webid=28&path=/&columnid=14418&unitid=18878&webname=%25E6%25B5%258E%25E5%258D%2597%25E5%25B8%2582%25E5%258D%25AB%25E7%2594%259F%25E5%2581%25A5%25E5%25BA%25B7%25E5%25A7%2594%25E5%2591%2598%25E4%25BC%259A&permissiontype=0';

    const res = await got.get(url);
    const $ = cheerio.load(res.data, {xmlMode: true});
    
    const list = $('record');
    
    ctx.state.data = {
        title: '济南卫建委-执业考试通知',
        link: `${baseUrl}/col/col14418/index.html`,
        item: 
            list.map((_, item) => {
            item = $(item).text(); //获取每个item对应的html字符串
            
            const html = cheerio.load(item); //解析上一步中的html
            
            const title = html('td[width="620"] a').attr('title');
            const link = html('td[width="620"] a').attr('href');
            const date = timezone(parseDate(html('td[width="100"]').text()), +8);
            return {
                title: title,
                //description: title, 
                link: link,
                author: '济南市卫生健康委员会',
                pubDate: date,
            }
        })
        .get(),
    };
};
