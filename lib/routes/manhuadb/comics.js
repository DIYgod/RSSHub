const axios = require('@/utils/axios');
const host = 'https://www.manhuadb.com';
const cheerio = require('cheerio');

async function load(link, ctx) {
    // 定义cache 存储通过link获取到的缓存内容
    const cache = await ctx.cache.get(link);
    // 如果缓存已经存在,则直接返回,否则对其进行解析
    if (cache) {
        return cache;
    }
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);

    // const cc_id = String($('body > script:nth-child(15)').text()).substring(323, 330);
    const cc_id = $('cc_id');
    console.log(cc_id);
    const imgSrc = $('#all > div > div.text-center > img').attr('src');
    const image = `<img src="${host + imgSrc}" referrerpolicy="no-referrer" />`;
    // const detailResult = `${image}`;
    console.log(image);
    return {
        title: '标题占位符',
        description: image,
        link: link,
    };
}
module.exports = async (ctx) => {
    const id = ctx.params.id;
    const comicPage = host + `/manhua/${id}`;
    const response = await axios({
        method: 'get',
        url: comicPage,
    });
    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('li[data-sort] > a');

    const comicTitle = $('.comic-title').text();

    const results = new Array();
    // const results = await Promise.all(

    list.map(async (i, item) => {
        // 定义itemUrl
        const itemUrl = host + $(item).attr('href');
        const other = await load(itemUrl, ctx);
        // return other;
        results.push(other);
    });
    // )

    ctx.state.data = {
        title: '漫画DB - ' + comicTitle,
        link: comicPage,
        description: '漫画DB',
        item: results,
    };
};
