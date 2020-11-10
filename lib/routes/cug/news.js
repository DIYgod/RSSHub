const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    // 发起 HTTP GET 请求

    const baseUrl = 'http://xxhb.cug.edu.cn/zqxt/zqjsjg.jsp?wbtreeid=1283&selectType=1&searchScope=0';

    const response = await got({
        method: 'get',
        url: baseUrl,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('form[id=searchlistform1] > table.listFrame > tbody > tr > td');
    const titleList = $('span.titlefontstyle206274');
    const timeList = $('span.timefontstyle206274');

    var results = [];
    var item = {};
    for(var i=0;i < list.length; i++){
        const d=$(list[i]);
        const title = d.find('span.titlefontstyle206274');
        const description = d.find('span.contentfontstyle206274');
        const time = d.find('span.timefontstyle206274');

        if(title.length){
            d.find('i').remove();
            item['title']=d.find('span.titlefontstyle206274').text()
            item['link']=d.find('a').attr('href');
        }else if(description.length){
            item['description'] = item['description'] ? item['description']+ d.text():d.text();
        }else if(time.length){
            item['pubDate'] = new Date(time.text().replace('发表时间:','').replace('年', '-').replace('月', '-').replace('日', '')).toUTCString();
            results.push(item);
            item = {};
        }else{

        }
    }

    const out = await Promise.all(
        results
            .map(async (element, index) => {
                const link = element.link;
                element.description = await ctx.cache.tryGet(link, async () => {
                    const result = await got.get(link);
                    if(result.status!=200){
                        return element.description;
                    }
                    const $ = cheerio.load(result.data);
                    return $('.v_news_content').html();
                });
                return Promise.resolve(element);
            })
    );

    ctx.state.data = {
        title: '中国地质大学(武汉)今日新闻',
        link: baseUrl,
        item: out,
    };
};
