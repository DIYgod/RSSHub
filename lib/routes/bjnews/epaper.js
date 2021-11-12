const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const cat = ctx.params.cat.toUpperCase();

    const today = new Date();
    const year = today.getFullYear(); // 获取时间
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    // 获取当天报纸的首页
    const response = await got({
        method: 'get',
        url: `http://epaper.bjnews.com.cn/html/${year}-${month}/${day}/node_1.htm`,
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const listdata = $('div#artcile_list_wapper tr').get();
    // 根据必选参数判断是哪一叠
    const list = cat.indexOf('SPECIAL') === -1 ? listdata.filter((e) => $(e).find('a').text().substring(1, 2) === cat) : listdata.filter((e) => $(e).find('a').text().substring(1, 2) === '0');
    // 遍历该叠面里第N版导航链接,数组内容为A01头版内容，A02等
    const articledata = await Promise.all(
        list.map(async (item) => {
            const link = `http://epaper.bjnews.com.cn/html/${year}-${month}/${day}/${$(item).find('a').attr('href')}`;
            // 缓存某叠下版面链接
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response2 = await got({
                method: 'get',
                url: link,
            });

            const articleHtml = response2.data;
            const $2 = cheerio.load(articleHtml);
            const paperarea = $2('ul.jcul li').get();
            // 遍历某板块，N版面的内容，到一个数组里。
            const innercontents = await Promise.all(
                paperarea.map(async (item) => {
                    const contentdataurl = `http://epaper.bjnews.com.cn/html/${year}-${month}/${day}/${$(item).find('a').attr('href')}`;
                    const response3 = await got({
                        method: 'get',
                        url: contentdataurl,
                    });

                    const contentHtml = response3.data;
                    const $3 = cheerio.load(contentHtml);

                    const ititle = $3('div.rit h1').text();
                    const iprecontent = $3('div.tpnr').html();
                    const imaincontent = $3('founder-content').html();
                    // 这里查看是正常输出的！
                    const icontent = `<hr><hr><br><strong>${ititle}</strong><br><br>${iprecontent}${imaincontent}<hr><br><br>`;
                    return Promise.resolve(icontent);
                })
            );
            // end
            const single = {
                description: innercontents,
                title: `${year}-${month}-${day}|${$(item).text()}`,
                link,
            };
            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `新京报电子报|${cat}叠`,
        link: `http://epaper.bjnews.com.cn/html/${year}-${month}/${day}/node_1.htm`,
        item: list.map((item, index) => ({
            title: articledata[index].title,
            description: articledata[index].description,
            link: articledata[index].link,
        })),
    };
};
