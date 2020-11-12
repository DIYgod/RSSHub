const got = require('@/utils/got');
const cheerio = require('cheerio');
module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `http://jwch.fzu.edu.cn/plus/json.aspx?jid=J131925584886784703&classid=1809&page=1&column=infoid%2Cclassid%2Ctitle%2Cdefaultpic%2Cintro%2Cadddate%2Curl%2Cclassname`,
        headers: {
            Referer: `http://jwch.fzu.edu.cn/zjjz/`,
        },
    });
    const data = response.data.data;

    const urls = [];
    for (const key of data) {
        urls.push(key.url);
    };

    const mains = [];
    for (const key of urls) {
        const response = await got(key);
        const data1 = response.data;
        const $ = cheerio.load(data1);
        $('.padTB15').remove();
        $('.c-txt').remove();
        const main = $('.xl_main');
        mains.push(main.html());
    }

    /*
        const mains = [];
        await Promise.all(urls.map(async (item) => {
            console.log(item);
            const response = await got({
                method: 'get',
                url: item,
                headers: {
                    Referer: `http://jwch.fzu.edu.cn/jxtz/`,
                },
            });
            const data1 = response.data;
            const $ = cheerio.load(data1);
            $('.padTB15').remove();
            $('.c-txt').remove();
            const main = $('.xl_main');
            console.log(item);
            mains.push(main.html());
            return mains;
        }));
    */

    let i = -1;
    ctx.state.data = {
        title: `福州大学教务处专家讲座`,
        link: `http://jwch.fzu.edu.cn/zjjz/`,
        description: `福州大学教务处加锡讲坛/信息素养讲座通知`,
        item: data.map((item) => {
            i++;
            return {
                title: item.title,
                description: `${mains[i]}`,
                pubDate: `${item.adddate}`,
                link: `${item.url}`,
            };
        }),
    };
};
