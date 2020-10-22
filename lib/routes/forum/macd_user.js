const logger = require('../../utils/logger');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const config = require('@/config').value;
const domain_name = 'bbs.macd.cn';
const http_name = 'http';
module.exports = async (ctx) => {

    const param = ctx.params.param;
    const geturl = `${http_name}://${domain_name}/space-uid-${param}.html`;  // https://bbs.macd.cn/space-uid-3833326.html
    console.log(geturl);
    const response = await got({
        method: 'get',
        url: `${geturl}`,
        headers: {
            Host: `${domain_name}`,
            Referer: `${http_name}://${domain_name}/`,
            Cookie: config.macd.cookies,
        },
        responseType: 'buffer',
    });
    console.log("get url");
    const responseHtml = iconv.decode(response.data, 'gbk');
    // console.log("decode")
    const $ = cheerio.load(responseHtml);
    // console.log("load")
    const categorytitle = $('title').text();
    // console.log("categorytitle :" + categorytitle);
    const content = $('meta[name="description"]').attr('content');
    try {
        // const list = $('div[id=postlist]>div'); //.filter((item) => item.find('pl_reply_list'))
    } catch (e) {
        console.log("error:" + e);
    }
    const list = $('div.flw_feed>ul[id=followlist]>li');
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
                    if (item.attr("class") === "pl_reply_list")
                    {
                        return null;
                    }
                    // console.log('item index :'+ item);
                    const author = item.find('div.flw_article>div.flw_author>a').text();
                    // console.log('author :'+ author);
                    const time = item.find('div.flw_article>div.flw_author>span').text().trim();
                    // console.log('time :'+ time);
                    const date = new Date(`${time}`);
                    // console.log('date :'+ date);
                    const descrip = item.find('div.flw_article>div[class="flw_quotenote xs2 pbw"]').text().trim();
                    // console.log('descrip :'+ descrip);
                    var titlestr = 0;
                    try {
                        var titlestr = descrip + "---" + author;
                    } catch (e) {
                        console.log("error:" + e);
                        var titlestr = author;
                    }
                    const titlename = `${titlestr}`;
                    // console.log('titlename :'+ titlename);
                    let postid = 0;
                    try {
                        postid = item.find('div.flw_article>div.flw_quote>h2>a').attr('href').split('-')[1];
                        // console.log('postid :'+ postid);
                    } catch (e) {
                        console.log("error:" + e);
                        postid = 0;
                        // postid = item.find('div.flw_article>div[class="flw_quotenote xs2 pbw"]>h2>a').attr('href').split('-')[1]
                    }

                    const linkurl = `${http_name}://${domain_name}/forum.php?mod=viewthread&extra=&tid=${postid}&authorid=${param}&page=99999#f_pst`;
                    // console.log('linkurl :'+ linkurl);
                    const gid = item.find('div.flw_article>div[class="pbm c cl"]').attr('id');

                    return {
                        title: `${titlename}`,
                        description: `${descrip}`,
                        pubDate: date.toUTCString(),
                        guid: `${item.attr('id')}`,
                        link: `${linkurl}`,
                    };
                })
                .get(),
    };
    console.log("title:" + ctx.state.data.title);
    console.log("link:" + ctx.state.data.link);
    console.log("description:" + ctx.state.data.description);
    console.log("resultItem: " + ctx.state.data.item.length);
    for (let i = 0; i < ctx.state.data.item.length; i++) {
        console.log(i + ": " + ctx.state.data.item[i].title);
        console.log(i + ": " + ctx.state.data.item[i].pubDate);
    }

    logger.info("macd resultItem: " + ctx.state.data.item.length);
};
