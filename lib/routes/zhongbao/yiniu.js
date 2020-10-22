const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const category = ctx.params.category;

    const geturl = `http://zb.16rd.com/tasklist-hd_indus_id-${category}.html`;

    // console.log(geturl)
    const response = await got({
        method: 'get',
        url: `${geturl}`,
        headers: {
            Host: 'zb.16rd.com',
            Referer: 'http://zb.16rd.com/',
        },
        responseType: 'buffer',
    });
    // console.log("get response");

    const responseHtml = iconv.decode(response.data, 'GBK');

    // console.log("decode ok");
    // console.log('responseHtml',responseHtml);
    const $ = cheerio.load(responseHtml);
    const categorytitle = $('title').text().trim();
    const content = $('meta[name="description"]').attr('content');
    const list = $('tr.hover_tr');
    // console.log("list :");
    // console.log('list :' + list.length);

    ctx.state.data = {
        title: `${categorytitle}`,
        link: `${geturl}`,
        description: `${content}`,
        item:
            list &&
            list
                .map((index,item) => {
                    // console.log('index :'+ index);
                    // console.log('item :'+ item);
                    item = $(item);
                    // console.log('item index :'+ item);
                    const info = item.find('div[class="left tasklist-common"]').slice(2).text().substring(5,15);
                    // console.log('info :'+ info.length);
                    // console.log('info :'+ info);
                    const date = new Date(`${info}`);
                    // console.log('date :'+ date);
                    const titlename = item.find('div.title>a').text().trim();
                    // console.log('titlename :'+ titlename);
                    // console.log('link :'+ `http://zb.16rd.com/${item.find('a').attr('href')}`);
                    return {
                        title: `${titlename}`,
                        description: `${titlename}`,
                        pubDate: date.toUTCString(),
                        guid: `${item.find('a').attr('href')}`,
                        link: `http://zb.16rd.com/${item.find('a').attr('href')}`,
                    };
                })
                .get(),
    };
    console.log("title:" + ctx.state.data.title);
    console.log("link:" + ctx.state.data.link);
    console.log("description:" + ctx.state.data.description);
    // console.log("resultItem: "+resultItem.length);
    for (let i = 0; i < ctx.state.data.item.length; i++) {
        console.log(i + ": " + ctx.state.data.item[i].title);
        console.log(i + ": " + ctx.state.data.item[i].pubDate);
    }
};
