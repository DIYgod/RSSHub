const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'http://www.yinwang.org/',
        responseType: 'arraybuffer',
        headers: {
            Referer: 'http://www.yinwang.org/',
            "User-Agent": 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'
        },
    });
    // var ctype = response.headers["content-type"];

    // if (ctype.includes("charset=GB2312"))
    //     var data = iconv.decode(response.data, 'gb2312');
    // else
    //     data = iconv.decode(response.data, 'utf-8');
     const data = iconv.decode(response.data, 'utf-8');

    const $ = cheerio.load(data);
    const list = $('ul.list-group').find('li');
    var millsec=new Date().getTime();
    ctx.state.data = {
        title: '王垠老师的blog',
        link: 'http://www.yinwang.org/',
        description: '王垠老师的blog',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    var a=item.find('a');
                    var strlist=item.find('a').attr('href').split("/");
                    var it=parseInt(strlist.shift());
                    while(isNaN(it)){
                        it=parseInt(strlist.shift());
                    }
                    if(it){
                        var year=it;
                        var month=parseInt(strlist.shift());
                        var day=parseInt(strlist.shift());

                        return {
                            title: a.text(),
                            description: `${a.text()}`,
                            pubDate: new Date(year,month,day).toUTCString(),
                            link: `${a.attr('href')}`,
                        };
                     }else{
                         return undefined;
                     }
                })
                .get(),
    };
};