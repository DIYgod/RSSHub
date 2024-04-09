const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const dayjs = require('dayjs');

const baseUrl = 'https://sise.uestc.edu.cn/';

const mapId = {
    1: 'notice-1', // 最新
    2: 'notice-2', // 院办
    3: 'notice-3', // 学生科
    4: 'notice-4', // 教务科
    5: 'notice-5', // 研管科
    6: 'notice-6', // 组织
    7: 'notice-7', // 人事
    8: 'notice-8', // 实践教育中心
    9: 'notice-9', // Int'I
};

const mapTitle = {
    1: '最新',
    2: '院办',
    3: '学生科',
    4: '教务科',
    5: '研管科',
    6: '组织',
    7: '人事',
    8: '实践教育中心',
    9: "Int'I",
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 1;
    const divId = mapId[type];
    if (!divId) {
        throw new Error('type not supported');
    }

    const browser = await require('@/utils/puppeteer')({ stealth: true });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await page.goto(baseUrl, {
        waitUntil: 'networkidle2',
    });
    const content = await page.content();
    await browser.close();

    const $ = cheerio.load(content);

    const items = $(`div[id="${divId}"] p.news-item`);

    const out = $(items)
        .map((_, item) => {
            item = $(item);
            const now = dayjs();
            let date = dayjs(now.year() + '-' + item.find('span').text().replace('/', '-'));
            if (now < date) {
                date = dayjs(now.year() - 1 + '-' + item.find('span').text().replace('/', '-'));
            }
            const newsTitle = item.find('a').text().replace('&amp;', '').trim();
            const newsLink = baseUrl + item.find('a').attr('href');
            const newsPubDate = parseDate(date);

            return {
                title: newsTitle,
                link: newsLink,
                pubDate: newsPubDate,
            };
        })
        .get();

    ctx.state.data = {
        title: `信软学院通知-${mapTitle[type]}`,
        link: baseUrl,
        description: '电子科技大学信息与软件工程学院通知',
        item: out,
    };
};
