const logger = require('../../utils/logger');
const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    
    const param = ctx.params.param;
    const geturl = `https://bbs.macd.cn/forum.php?mod=viewthread&extra=&${param}`;
    console.log(geturl);
    const response = await axios({
        method: 'get',
        url: `${geturl}`,
        headers: {
            Host: 'bbs.macd.cn',
            Referer: 'https://bbs.macd.cn/',
            Cookie:'Hm_lvt_31e224298e0c18290ae5ea193982cf78=1537929952,1538969650,1538984263; Hm_lpvt_31e224298e0c18290ae5ea193982cf78=1538984271; vClickLastTime=a%3A8%3A%7Bi%3A0%3Bb%3A0%3Bi%3A2851780%3Bi%3A1538928000%3Bi%3A2792641%3Bi%3A1538928000%3Bi%3A2856078%3Bi%3A1538928000%3Bi%3A2856927%3Bi%3A1538928000%3Bi%3A2856924%3Bi%3A1538928000%3Bi%3A2856878%3Bi%3A1538928000%3Bi%3A2835280%3Bi%3A1538928000%3B%7D; rVTN_4d0a_sid=fJz1xB; rVTN_4d0a_saltkey=hl4X1HyH; rVTN_4d0a_lastvisit=1538978267; rVTN_4d0a_lastact=1538984270%09misc.php%09patch; rVTN_4d0a_st_p=1865921%7C1538984268%7C0e79a432c01c60579ab0ed6ebeb82aeb; rVTN_4d0a_visitedfid=25; rVTN_4d0a_viewid=tid_2851780; rVTN_4d0a_sendmail=1; rVTN_4d0a_auth=5b56hbLKZr8E9qy%2F8VFIJZopBj27XWj8t9%2F%2FjEavgKnoH380H%2Fl1U7IqvIu8lHPlC1bEpStwHPtymbEUaN1wESHKcJUl; rVTN_4d0a_lip=36.45.166.174%2C1538981830; rVTN_4d0a_connect_is_bind=0; rVTN_4d0a_ulastactivity=268234KN9CT38pbSglGzN7ClOL3JnqsgHeHdVuGjOrA%2FLipAIToG; rVTN_4d0a_lastcheckfeed=1865921%7C1538984262; rVTN_4d0a_smile=1D1'
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
