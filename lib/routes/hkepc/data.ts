const baseUrl = 'https://www.hkepc.com';
const categoryMap = {
    price: {
        url: `${baseUrl}/news`,
        feedSuffix: ' - 腦場新聞',
        selector: '#sidebar > div:nth-child(1) > div.content > ul > li',
    },
    review: {
        url: `${baseUrl}/news`,
        feedSuffix: ' - 新品快遞',
        selector: '#sidebar > div:nth-child(2) > div.content > ul > li',
    },
    coverStory: {
        url: `${baseUrl}/news`,
        feedSuffix: ' - 專題報導',
        selector: '#sidebar > div:nth-child(3) > div.content > ul > li',
    },
    news: {
        url: `${baseUrl}/news`,
        feedSuffix: ' - 新聞中心',
        selector: '#sidebar > div:nth-child(4) > div.content > ul > li',
    },
    press: {
        url: `${baseUrl}/news`,
        feedSuffix: ' - 業界資訊',
        selector: '#sidebar > div:nth-child(5) > div.content > ul > li',
    },
    member: {
        url: `${baseUrl}/news`,
        feedSuffix: ' - 會員消息',
        selector: '#sidebar > div:nth-child(6) > div.content > ul > li',
    },
    digital: {
        url: baseUrl,
        feedSuffix: ' - 流動數碼',
        selector: '#contentR5 > div.left > div.article > div.heading',
    },
    entertainment: {
        url: baseUrl,
        feedSuffix: ' - 生活娛樂',
        selector: '#contentR5 > div.right > div.article > div.heading',
    },
    latest: {
        url: baseUrl,
        feedSuffix: ' - 最新消息',
        selector: 'div .item',
    },
    '': {
        url: baseUrl,
        feedSuffix: ' - 最新消息',
        selector: 'div .item',
    },
    ocLab: {
        url: `${baseUrl}/ocLab`,
        feedSuffix: ' - 超頻領域',
        selector: '.heading',
    },
};

export { baseUrl, categoryMap };
