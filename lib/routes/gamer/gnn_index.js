const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    let url = '';
    if (category === 'index') {
        url = 'https://gnn.gamer.com.tw/';
    } else {
        url = `https://gnn.gamer.com.tw/index.php?k=${category}`;
    }

    let category_name = '';
    switch (parseInt(category)) {
        case 'index':
            category_name = '首页';
            break;
        case 1:
            category_name = 'PC';
            break;
        case 3:
            category_name = 'TV 掌機';
            break;
        case 4:
            category_name = '手機遊戲';
            break;
        case 5:
            category_name = '動漫畫';
            break;
        case 9:
            category_name = '主題報導';
            break;
        case 11:
            category_name = '活動展覽';
            break;
        case 13:
            category_name = '電競';
            break;
        default:
            category_name = '首页';
    }

    const response = await got({
        method: 'get',
        url: url,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('div.BH-lbox.GN-lbox2').children().not('.GN-lbox2A').not('.GN-lbox2G');

    const out = await Promise.all(
        list &&
            list
                .map(async (index, item) => {
                    item = $(item);
                    let element_a;
                    let tag;
                    if (item.attr('class') === 'GN-lbox2F') {
                        element_a = item.find('a').eq(0);
                        tag = item.children('img').eq(0).attr('class');
                    } else {
                        element_a = item.find('a').eq(1);
                        tag = item.children('h1').children('img').eq(0).attr('class');
                    }
                    if (tag === 'IMG-Gmuti') {
                        tag = 'General';
                    } else if (tag === 'IMG-GA19') {
                        tag = 'PC';
                    } else if (tag === 'IMG-GB3') {
                        tag = 'NS';
                    } else if (tag === 'IMG-GB4') {
                        tag = 'PS5';
                    } else if (tag === 'IMG-GB1') {
                        tag = 'PS4';
                    } else if (tag === 'IMG-GA14') {
                        tag = 'ARC';
                    } else if (tag === 'IMG-GAC') {
                        tag = 'AC';
                    } else if (tag === 'IMG-GA13') {
                        tag = 'ETC';
                    } else if (tag === 'IMG-GA1') {
                        tag = 'OLG';
                    } else if (tag === 'IMG-Gmobi') {
                        tag = 'MOBI';
                    } else if (tag === 'IMG-GA20') {
                        tag = 'WEB';
                    } else if (tag === 'IMG-GA25') {
                        tag = 'Google';
                    } else if (tag === 'IMG-GA24') {
                        tag = 'Apple';
                    } else if (tag === 'IMG28') {
                        tag = 'Facebook';
                    } else if (tag === 'IMG-GA17' || tag === 'IMG-Gother') {
                        tag = 'Other';
                    } else {
                        tag = 'Unclassified';
                    }

                    const title = '[' + tag + ']&nbsp;' + element_a.text();
                    const link = element_a.attr('href').replace('//', 'https://');

                    // 图片延迟加载无法获取源地址;
                    const content = await got({
                        method: 'get',
                        url: link,
                    });
                    const c = cheerio.load(content.data);
                    const description = c('div.GN-lbox3B').children('div').html();

                    // // 使用 RSSHub 提供的 puppeteer 工具类，初始化 Chrome 进程
                    // const browser = await require('@/utils/puppeteer')();
                    // // 创建一个新的浏览器页面
                    // const page = await browser.newPage();
                    // // 访问指定的链接
                    // await page.goto(link);
                    // // 渲染目标网页
                    // // const html = await page.evaluate(() => document.querySelector('div.gnn-detail-cont').innerHTML);
                    // const html = await page.$eval('div.gnn-detail-cont', (e) => e.innerHTML);
                    // // 关闭浏览器进程
                    // browser.close();

                    // const c = cheerio.load(html);
                    // const description = c('div.GN-lbox3B').children('div').html();

                    return {
                        title,
                        description,
                        link,
                    };
                })
                .get()
    );

    ctx.state.data = {
        title: '巴哈姆特-GNN新闻-' + category_name,
        link: url,
        item: out,
    };
};
