const got = require('@/utils/got');
const cheerio = require('cheerio');



const GetContent = async(type) => {
   const URL = {
       jxdt: ['http://jwc.hnust.edu.cn/jxzt/'],
       jxyx: [
                'http://jwc.hnust.edu.cn/gzzd2_20170827120536008171/jwk3_20170827120536008171/',
                'http://jwc.hnust.edu.cn/gzzd2_20170827120536008171/jyk3_20170827120536008171/',
                'http://jwc.hnust.edu.cn/gzzd2_20170827120536008171/jck3_20170827120536008171/'
             ]
   };
   let url = [];
   if (type == 'jxdt' || type == 'jxyx') url = URL[type];
   else url = URL['jxdt'].concat(URL['jxyx']);

   let result = [];

   
    for(let cur = 0; cur < url.length; cur++) {     
        const response = await got.get(url[cur]+'index.htm');
        const data = response.data;

        const $ = cheerio.load(data);

        $('.articleList2 li').each(
            function(i, e) {
                const $t = cheerio.load(e);
                result.push({
                    title: $t('a').text().trim(),
                    link: url[cur] + $t('a').attr('href'),
                    pubDate: new Date($t('span').text()).toUTCString()
                });
        });
    }

       



   return result;
}
module.exports = {
    GetContent
}

