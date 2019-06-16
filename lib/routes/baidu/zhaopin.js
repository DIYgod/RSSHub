const host = `https://zhaopin.baidu.com/`;
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    // 获取查询关键词
    const city = ctx.params.city;
    const keyword = ctx.params.keyword;

    // 使用 RSSHub 提供的 puppeteer 工具类,初始化 Chrome 进程
    const browser = await require('@/utils/puppeteer')();
    // 创建一个新的浏览器页面
    const page = await browser.newPage();
    // 开启拦截器,拦截无用的图片。以节约性能开支
    await page.setRequestInterception(true);
    await page.on('request', (interceptedRequest) => {
        // 判断url是否以jpg或png结尾，符合条件将不再加载
        if (interceptedRequest.url().endsWith('.jpg') || interceptedRequest.url().endsWith('.png')) {
            interceptedRequest.abort();
        } else {
            interceptedRequest.continue();
        }
    });
    // 访问指定的链接,需要重新编码
    const link = host + `quanzhi?city=${encodeURI(city)}&query=${encodeURI(keyword)}`;
    // 前往链接
    await page.goto(link);
    // 渲染目标网页// 选取渲染后的 HTML,仅获取总体部分
    // eslint-disable-next-line no-undef
    const html = await page.evaluate(() => document.querySelector('body > div:nth-child(1) > div > div.inner.home-content > div.bigblock.clearfix > div.listblock > div.listwraper').innerHTML);
    // 关闭浏览器进程
    browser.close();
    // 开始处理数据
    const $ = cheerio.load(html);
    // 得到标题List
    const titleList = $('div.title').get();
    // 得到链接List
    const linkList = $(' div > div > a > div').get();
    // 得到工资List
    const priceList = $('span.num').get();
    // 得到发布时间List
    const pubDateList = $('div.source').get();
    // 得到公司名称List
    const companyNameList = $('span.companyname').get();
    // 得到公司所在地List
    const companyAddressList = $('div.detail > span:nth-child(1)').get();
    // 得到学历要求List
    const studyList = $('div.detail > span:nth-child(3)').get();
    // 得到工作经验要求List
    const expressList = $('div.detail > span:nth-child(5)').get();
    let results = [];
    // 由于链接List数据格式问题,处理后才为目标链接
    // 开始处理链接
    for (let index = 0; index < linkList.length; index += 1) {
        // 获取单个链接的对象
        const element = linkList[index];
        // 获取其中属性名为data-click的value,并将其转为String方便处理
        const item = String($(element).attr('data-click'));
        // 如果得到的链接对象为空,则该条链接不可用,进入下一次循环
        if (item === 'undefined') {
            continue;
        }
        // 得到business的标识符
        const busFlag = JSON.parse(item).ecom_sign;
        // 临时变量link
        let link = String(JSON.parse(item).url);
        // 得到链接中id后面的值,用以处理成可直接访问的链接
        const afterId = link.slice(link.indexOf('?id=') + 4);
        // 临时变量suffix「链接后缀」
        let suffix = '';
        // 判断id后面的链接中是否存在zhaopin关键词,如果存在则表明该链接需要经过百度百聘处理才可以访问。否则为直达链接,可直接访问
        // 如果公司所在地和查询的地方不同，则此条信息存在没有意义
        const companyAddress = $(companyAddressList[index]).text();
        if (companyAddress === keyword) {
            continue;
        }

        // 设置缓存
        const cache = ctx.cache.get(link);
        if (cache) {
            results = cache;
            break;
        }

        if (afterId.includes('zhaopin')) {
            // 判断得到的business关键词,根据关键词修改后缀
            if (busFlag === 1) {
                suffix = `&query=${keyword}&city=${city}&is_promise=&is_direct=2&vip_sign=0&asp_ad_job=1&is_business=1`;
            }
            // 如果链接包含doumi关键词,则后缀发生变化
            if (afterId.includes('doumi.com')) {
                suffix = `&query=${keyword}&city=${city}&is_promise=0&is_direct=1&vip_sign=&asp_ad_job=`;
            }
            // 拼接好链接后将其保存在links中
            link = `http://zhaopin.baidu.com/szzw?id=${encodeURIComponent(afterId) + suffix}`;
        } else {
            // 得到一个直达链接,无需处理
            link = `http://zhaopin.baidu.com/szzw?id=${afterId}`;
        }
        // 得到作者
        let author = '';
        const source = $(pubDateList[index]).text();
        if (source.length === 2) {
            author = '百度百聘';
        } else {
            author = source.slice(5);
        }
        // 得到发布时间
        let pubDate = '';
        const dateString = source.slice(0, 2); // 格式为“今天”，“昨天”
        if (dateString === '昨天') {
            const myDate = new Date();
            myDate.setDate(myDate.getDate() - 1);
            pubDate = myDate.toUTCString();
        } else {
            const myDate = new Date();
            pubDate = myDate.toUTCString();
        }
        // 得到工资
        const price = $(priceList[index]).text();
        // 得到公司名称
        const companyname = $(companyNameList[index]).text();
        // 得到学历要求
        const study = $(studyList[index]).text();
        // 得到工作经验的要求
        const express = $(expressList[index]).text();
        // 设置缓存
        ctx.cache.set(link, $(titleList[index]).text());

        results.push({
            title: $(titleList[index]).text(),
            description: `${companyname}<br>工资:${price}<br>学历要求:${study}  经验要求:${express}`,
            link,
            pubDate,
            author,
        });
    }

    ctx.state.data = {
        link: host + `quanzhi?city=${encodeURI(city)}&query=${encodeURI(keyword)}`,
        title: `${city} ${keyword} - 百度百聘`,
        description: `${city} ${keyword} - 百度百聘`,
        item: results,
    };
};
