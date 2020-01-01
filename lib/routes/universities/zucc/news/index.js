const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');


const baseUrl = 'http://www.zucc.edu.cn';
const maps = {
    'news':"/col/col16/index.html?uid=457"
};

// 完整文章页
async function load(link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const description = $('#zoom').html()
    return { description };
}

const ProcessFeed = async (item, caches) => {
    return await Promise.all(
        item.map(async (item) => {
            // item提取到的信息
            const single = {
                title: item.title,
                link: item.link,
                author: 'zhang-wangz',
                pubDate: item.pubDate,
            };
            const other = await caches.tryGet(item.link, async () => await load(item.link));
            return Promise.resolve(Object.assign({}, single, other));
        })
    );
};


module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: baseUrl + maps["news"],
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const xml = $('#457 > script');
    const xmlGet = xml.html().toString();
    var match = "<li>.*?<a.*?href=\".*?\".*?title=\".*?\".*?target=\".*?\">.*?</a><span>.*?</span>.*?</li>";
    var reg = new RegExp(match,'g')
    const res = (xmlGet.match(reg))
    console.log(res.length)

    const item = res.map((elem,index) => ({
        link: baseUrl + elem.match("href=\".*?\"")[0].toString().slice(6,-1),
        title: elem.match("title=\".*?\"")[0].toString().slice(7,-1),
        pubDate:elem.match("<span>.*?</span>")[0].toString().slice(6,-7),
    }));

    const chapteritem = item

    ctx.state.data = {
        title: '浙江大学城市学院新闻报道',
        link: baseUrl,
        item: chapteritem,
    };
};
