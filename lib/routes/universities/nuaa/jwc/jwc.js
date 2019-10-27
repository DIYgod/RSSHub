const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const host = 'http://aao.nuaa.edu.cn/';
const puppeteer = require('puppeteer');

const map = {
    default: 8230,
    jxfw: 8230,//教学服务
    xspy: 8231,//学生培养
    jxjs: 8232,//教学建设
    jxzy: 8233,//教学资源
};

async function load(link, cookie) {
    const response = await got.get(link, {
        headers:{
            cookie
        }
        
    });
    const $ = cheerio.load(response.data);
    const pubDate = new Date(
        $('.release-time')
            .text()
            .slice(-10)
            .match(/\d{4}-\d{2}-\d{2}/)
    ).toUTCString();
    const images = $('img');
    for (let k = 0; k < images.length; k++) {
        $(images[k]).replaceWith(`<img src="${url.resolve(host, $(images[k]).attr('src'))}" />`);
    }
    const description = $('.wp_articlecontent').html();
    return { pubDate, description };
}

module.exports = async (ctx) => {
    const type = ctx.params.type || 'default';
    const listUrl =`${host}${map[type]}/list.htm`
    let response
    const browser = await puppeteer.launch({
        // headless: false,
        ignoreHTTPSErrors: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            `--window-size=800,600`
        ]
    })
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36')
    await page.evaluateOnNewDocument(_=>{
        Object.defineProperty(navigator, 'webdriver', { get: ()=> false });
    })
    //南航的新waf现在采用cookie验证的方法防止爬虫，并且会对chrome headless进行检测

    await page.goto(listUrl, {
        waitUntil: 'networkidle0'
    })

    // let data
    let msg 
    try {
        // data = await page.$('ul.right-ul')
        msg = await page.$$eval('ul.right-ul > li', es => es.map(e => {
            const html = e.innerHTML
    
            let [, title] = html.match(/<a.+?>(.+)<\/a>/)
            if(title.match(/font/)){
                [, title] = title.match(/>(.+)</)
            }
            let [, href] = html.match(/href="(.+?)"/)
            let [, time] = html.match(/-time">(.+?)</)
            return {
                title,
                link: href,
                guid: href,
            }
        }))
    } catch (e) {
        // debugger
    }
    
    let cookie = await page.cookies()
    cookie = cookie.map(({name, value}) => `${name}=${value}`).join('; ')
    msg = await Promise.all(msg.map(async e => {
        const link = url.resolve(host, e.link)
        return {
            ...e,
            link,
            guid: link,
            ...await load(link, cookie)
        }
    }))

    ctx.state.data = {
        title: '南航教务',
        link: host,
        description: '南航教务RSS',
        item: msg,
    }

}