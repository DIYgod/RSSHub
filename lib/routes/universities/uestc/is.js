const got = require('@/utils/got');
const cheerio = require('cheerio');

// 首页 https://www.is.uestc.edu.cn/
// 通知公告
// 最新公告无单独页面
// 院办 https://www.is.uestc.edu.cn/noticesList.do?type=91
// 组织 https://www.is.uestc.edu.cn/noticesList.do?type=132
// 学生科 https://www.is.uestc.edu.cn/noticesList.do?type=90
// 教务科 https://www.is.uestc.edu.cn/noticesList.do?type=93
// 研管科 https://www.is.uestc.edu.cn/noticesList.do?type=92
// 实验中心 https://www.is.uestc.edu.cn/noticesList.do?type=97
// 企业技术服务中心 https://www.is.uestc.edu.cn/noticesList.do?type=185
// 新工科中心 https://www.is.uestc.edu.cn/noticesList.do?type=184
// 实习实训办公室 https://www.is.uestc.edu.cn/noticesList.do?type=96
// 招聘 https://www.is.uestc.edu.cn/noticesList.do?type=137
// 实习实训 https://www.is.uestc.edu.cn/noticesList.do?type=135

const baseUrl = 'https://www.is.uestc.edu.cn/';
const listUrl = baseUrl + 'noticesList.do?type=';

const types = {
    latest: 'latest',
    yb: 91,
    zx: 132,
    xsk: 90,
    jwk: 93,
    ygk: 92,
    syzx: 97,
    qyjsfwzx: 185,
    xgkzx: 184,
    sxsxbgs: 96,
    zp: 135,
    sxsx: 137,
};

const convertDate = (text) => {
    const date = new Date(text);
    const now = new Date();
    if (now.getMonth() > date.getMonth()) {
        return new Date(`${new Date().getFullYear()}-${text}`);
    } else {
        if (now.getMonth() < date.getMonth() && now.getMonth() === date.getMonth() && now.getDate() < date.getDate()) {
            return new Date(`${new Date().getFullYear() - 1}-${text}`);
        }
    }
};

const getTypeItems = async (type) => {
    if (type !== 'latest') {
        const res = await got({
            method: 'get',
            url: listUrl + types[type],
            headers: {
                Referer: baseUrl,
            },
        });

        const $ = cheerio.load(res.data);

        return $('.new-list li a')
            .slice(0, 10)
            .map((_, elem) => ({
                link: baseUrl + elem.attribs.href,
                title: elem.attribs.title,
                pubDate: new Date($(elem).children('.new-time').text()).toUTCString(),
            }))
            .get();
    } else {
        const res = await got({
            method: 'get',
            url: baseUrl,
            headers: {
                Referer: baseUrl,
            },
        });

        const $ = cheerio.load(res.data);

        return $('.annce-cont ul li div')
            .slice(0, 10)
            .map((_, elem) => ({
                link: baseUrl + $(elem).children('a').attr('href'),
                title: $(elem).children('a').attr('title'),
                pubDate: convertDate($(elem).children('span').text()),
            }))
            .get();
    }
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'latest';
    const allTypes = type.split('+');

    const result = await Promise.all(allTypes.map((t) => getTypeItems(t)));

    ctx.state.data = {
        title: '电子科技大学信软学院通知公告',
        link: baseUrl,
        item: result.flat(),
    };
};
