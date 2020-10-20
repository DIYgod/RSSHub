const logger = require('../../utils/logger');
const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const config = require('../../config');
const domain_name = 'bbs.macd.cn'
const http_name = 'http'
module.exports = async (ctx) => {
    
    const param = ctx.params.param;
    const geturl = `${http_name}://${domain_name}/forum.php?mod=viewthread&extra=&${param}#f_pst`;
    console.log(geturl);

    const response = await axios({
        method: 'get',
        url: `${geturl}`,
        headers: {
            Host: `${domain_name}`,
            Referer: `${http_name}://${domain_name}/`,
            Cookie: config.macd.cookies,
        },
        responseType: 'arraybuffer',
    });
    //console.log("get url")
    const responseHtml = iconv.decode(response.data, 'gbk');
    //console.log("decode")
    const $ = cheerio.load(responseHtml);
    //console.log("load")
    const categorytitle = $('title').text();
    //console.log("categorytitle :" + categorytitle);
    const content = $('meta[name="description"]').attr('content');
    try {
        //const list = $('div[id=postlist]>div'); //.filter((item) => item.find('pl_reply_list'))
    } catch (e) {
        console.log("error:"+e);
    }
    const list = $('div[id=postlist]>div');
    //console.log("list :");
    //console.log('list :' + list.length);

    ctx.state.data = {
        title: `${categorytitle}`,
        link: `${geturl}`,
        description: `${content}`,
        item:
            list &&
            list
                .map((index,item) => {
                    //console.log('index :'+ index);
                    //console.log('item :'+ item);
                    item = $(item);
                    if(item.attr("class")==="pl_reply_list")
                    {
                        return null;
                    }
                    //console.log('item index :'+ item);
                    const author = item.find('td.pls>div.pls_panel>div>div.pi>div.authi>a').text();
                    //console.log('author :'+ author);
                    const time = item.find('td.plc>div.pi>div.pti>div.authi>em').text().slice(4);
                    //console.log('time :'+ time);
                    const date = new Date(`${time}`);
                    //console.log('date :'+ date);
                    const titlename = author +" post at "+ date;
                    //console.log('titlename :'+ titlename);
                    try {
                    const descrip = item.find('td.plc>div.pct').html();
                    var img = item.find('td.plc>div.pct>div.pcb').find('div[class="mbn savephotop"]>img');
                    if(img)
                    {
                        img = img.map(function(idx,obj) {return `<img referrerpolicy="no-referrer" src="${$(obj).attr("file")}" >`;}).get();
                        //console.log('img :'+ img);
                        //console.log('img length:'+ img.length);
                    }
                    const descrips = descrip + img;
                    
                    return {
                        title: `${titlename}`,
                        description: `${descrips}`,
                        pubDate: date.toUTCString(),
                        guid: `${item.attr('id')}`,
                        link: `${geturl}`,
                    };
                    } catch (e) {
                      
                    console.log("error:"+e);

                    }
                })
                .get(),
    };
    console.log("title:"+ctx.state.data['title']);
    console.log("link:"+ctx.state.data['link']);
    console.log("description:"+ctx.state.data['description']);
    console.log("resultItem: "+ctx.state.data['item'].length);
    for (let i = 0; i < ctx.state.data['item'].length; i++) {
        console.log(i+": "+ctx.state.data['item'][i].title);
        console.log(i+": "+ctx.state.data['item'][i].pubDate);
    }

    logger.info("macd resultItem: "+ctx.state.data['item'].length);
};
