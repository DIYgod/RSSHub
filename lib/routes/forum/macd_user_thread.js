const logger = require('../../utils/logger');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const config = require('@/config').value;
const domain_name = 'bbs.macd.cn';
const http_name = 'http';
module.exports = async (ctx) => {

    const param = ctx.params.param;
    const geturl_th = `${http_name}://${domain_name}/home.php?mod=space&uid=${param}&do=thread&view=me&from=space`;  // https://bbs.macd.cn/space-uid-3833326.html
    console.log(geturl_th);
    const response_th = await got({
        method: 'get',
        url: `${geturl_th}`,
        headers: {
            Host: `${domain_name}`,
            Referer: `${http_name}://${domain_name}/`,
            Cookie: config.macd.cookies,
        },
        responseType: 'buffer',
    });
    console.log("get url");
    const responseHtml_th = iconv.decode(response_th.data, 'gbk');
    console.log("decode");
    const $ = cheerio.load(responseHtml_th);
    console.log("load");
    const categorytitle = $('title').text();
    console.log("categorytitle :" + categorytitle);
    const content = $('meta[name="description"]').attr('content');
    console.log($('div[class=tl]>form>table').find('a[class=xi2]').attr('href'));
    const thread_id = $('div[class=tl]>form>table').find('a[class=xi2]').attr('href').split('-')[1];
    const thread_title = $('div[class=tl]>form>table').find('a[class=xi2]').text();
    console.log("thread_title " + thread_title);
    const geturl = `${http_name}://${domain_name}/forum.php?mod=viewthread&extra=&tid=${thread_id}&authorid=${param}&page=99999#f_pst`;
    console.log("url " + geturl);


    console.log("items ");
    const item = {
                        title: `${thread_title}`,
                        description: `${thread_title}`,
                        guid: `${thread_id}`,
                        link: `${geturl}`,
                    };
    const items = [ ];
    items.push(item);
    console.log("item ");

    ctx.state.data = {
                        title: `${categorytitle}`,
                        description: `${content}`,
                        link: `${geturl_th}`,
                        item: ``,
                    };
    ctx.state.data.item = items;
    console.log("data ");

    console.log("title:" + ctx.state.data.title);
    console.log("link:" + ctx.state.data.link);
    console.log("description:" + ctx.state.data.description);
    console.log("resultItem: " + ctx.state.data.item.length);
    for (let i = 0; i < ctx.state.data.item.length; i++) {
        console.log(i + ": " + ctx.state.data.item[i].title);
        console.log(i + ": " + ctx.state.data.item[i].pubDate);
        console.log(i + ": " + ctx.state.data.item[i].link);
    }
    logger.info("macd resultItem: " + ctx.state.data.item.length);

};
