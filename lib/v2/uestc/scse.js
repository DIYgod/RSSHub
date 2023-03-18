const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const dayjs = require('dayjs');

const baseIndexUrl = 'https://www.scse.uestc.edu.cn/index.htm';
const host = 'https://www.scse.uestc.edu.cn/';

const prefixes = {
    1012: '【办公室】',
    1013: '【组织人事】',
    1014: '【科研科】',
    1015: '【研管科】',
    1016: '【教务科】',
    1017: '【学生科】',
    1018: '【国际办】',
    1019: '【培训工作】',
    1020: '【创新创业】',
    1022: '【安全工作】',
};

module.exports = async (ctx) => {
    const browser = await require('@/utils/puppeteer')({ stealth: true });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await page.goto(baseIndexUrl, {
        waitUntil: 'networkidle2',
    });
    const content = await page.content();
    await browser.close();

    const $ = cheerio.load(content);

    const iList = $('.s2-lswitch .i-list');
    let firstFlag = true;
    const items = [];
    iList.each((_, element) => {
        if (firstFlag) {
            firstFlag = false;
            return; // skip the first section "最新公告"
        }
        const liList = $(element).find('li');
        liList.each((i, el) => {
            items.push(el);
        });
    });

    const out = $(items)
        .map((index, item) => {
            item = $(item);
            const now = dayjs();
            let date = dayjs(now.year() + '-' + item.find('a span').text());
            if (now < date) {
                date = dayjs(now.year() - 1 + '-' + item.find('a span').text());
            }
            let newsTitle = item
                .find('a[href]')
                .contents()
                .filter((index, element) => element.nodeType === 3)
                .text()
                .trim();
            const newsLink = host + item.find('a[href]').attr('href');
            const newsPubDate = parseDate(date);

            let prefix = '【其他】';
            for (const code in prefixes) {
                if (newsLink.search('info/' + code) !== -1) {
                    prefix = prefixes[code];
                    break;
                }
            }
            newsTitle = prefix + newsTitle;

            return {
                title: newsTitle,
                link: newsLink,
                pubDate: newsPubDate,
            };
        })
        .get();

    ctx.state.data = {
        title: '计算机学院通知',
        link: baseIndexUrl,
        description: '电子科技大学计算机科学与工程学院通知',
        item: out,
    };
};
