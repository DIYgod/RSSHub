const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');
const puppeteer = require('../../utils/puppeteer');

// 加载文章页
async function load(link, token) {

    const response = await axios({
        method: 'get',
        url: link.text(),
        headers: {
            Referer: `https://pubs.acs.org/`,
            Cookie: token,
        },
    });

    const data = response.data; 

    const $ = cheerio.load(response.data);

    // 解析发表日期
    const pubDate = $("div#pubDate").text();

    // 取得摘要
    const $abstract = $("p.articleBody_abstractText").html();

    //$abstract.removeAttr('style');
    const $author = $("div#authors").text();

    //affiliations
    const $orgn = $("div.affiliations").text();

    //abstract image
    const $image = $("#absImg>img").attr("src");
    
    // 内容重排
    const description = "<img src='https://pubs.acs.org" + $image + "' style='float:middle\' >" +
        "<p>" + pubDate + "</p>" +
        "<p><h5>" + "Authors:" + "</h5>"  + $author + "</p>" +
        "<p>" + $orgn + "</p>" + 
        "<p><h5>" + "Abstract:" + "</h5>"  + $abstract + "</p>";

    return {description, pubDate};
};

const ProcessFeed = async (list, caches) => {
    
    const token =  await get_cookies();
    //检查cookie是否获取使用
    //console.log(token);
    return await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const $title = $("title");
            // 链接为绝对链接
            const $url = $("guid");

            // 列表上提取到的信息
            const single = {
                title: $title.text(),
                link: $url.text(),
                guid: $url.text(),
            };

            // 使用tryGet方法从缓存获取内容。
            // 当缓存中无法获取到链接内容的时候，则使用load方法加载文章内容。
            //const other = await caches.tryGet($url, async () => await load($url));
            const other = await caches.tryGet($url, async () => await load($url, token));


            
            // 合并解析后的结果集作为该篇文章最终的输出结果
            return Promise.resolve(Object.assign({}, single, other));
        })
    );
};

module.exports = {
    ProcessFeed,
};

//获取一个一次性的cookie
const get_cookies = async () => {

    const res1 = await axios({
        method: 'get',
        url: 'https://pubs.acs.org/',
    });
    const token = res1.headers['set-cookie'].find((s) => s.startsWith('TS')).split(';')[0];
    return token;
};

