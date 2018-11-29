const axios = require('../../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');

const baseTitle = "南信大研究生院学科建设处";
const baseUrl = "http://yjs.nuist.edu.cn";
const map = {
    2: "学科建设",
    3: "招生工作",
    4: "培养工作",
    5: "学位工作",
    6: "学生工作",
    7: "就业工作",
    8: "国际合作",
    9: "文件下载",
    10: "工作动态",
    11: "通知公告"
};


module.exports = async (ctx) => {
    const category = map.hasOwnProperty(ctx.params.category) ? ctx.params.category : 11;
    const link = baseUrl + '/Show.aspx?CI=' + category;

    const response = await axios.get(link);
    const $ = cheerio.load(response.data);

    /* 👇学校外包网站质量是真的6，看这个超长ID名，笑出声👇 */
    const list = $('#ctl00_ctl00_ContentPlaceHolder2_mainbody_rightbody_listcontent_NewsList')
        .find('.gridline')
        .slice(0, 6)
        .map((index, item) => {
            item = $(item);
            return {
                title: item.find('.Title').text(),
                link: url.resolve(baseUrl, item.find('.Title').attr('href')),
                pubDate: new Date(item.find('.gridlinedate').text().match(/\d+/g)).toUTCString()
            };
        })
        .get();

    const items = await Promise.all(
        [...list].map(async (item) => {
            const cache = await ctx.cache.get(item.link);
            if (cache) {
                return JSON.parse(cache);
            }

            const response = await axios.get(item.link);
            const $ = cheerio.load(response.data);
            const article = $('#ctl00_ctl00_ContentPlaceHolder2_mainbody_rightbody_listcontent_lmnr')

            item.author = article.find('.zzxx span').eq(0).text();
            item.description = article.find('.xwco').html();
            item.category = map[category];

            await ctx.cache.set(item.link, JSON.stringify(item), 24 * 60 * 60);
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: baseTitle + ':' + map[category],
        link: link,
        item: items.filter((x) => x),
    };
};
