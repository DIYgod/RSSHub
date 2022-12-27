const cheerio = require('cheerio');
const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const url = require('url');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const base = 'http://www.caai.cn';

const urlBase = (caty) => url.resolve(base, `/index.php?s=/home/article/index/id/${caty}.html`); // en, cn, (none, for JP)

const renderDesc = (desc) =>
    art(path.join(__dirname, 'templates/description.art'), {
        desc,
    });

const detailPage = (link, cache) =>
    cache.tryGet(link, async () => {
        const result = await got(link, {
            https: {
                rejectUnauthorized: false,
            },
        });
        const $ = cheerio.load(result.data);
        const description = $('div.articleContent').html();
        return {
            description,
        };
    });

const fetchAllArticles = (data, base) => {
    const $ = cheerio.load(data);
    const articles = $('div.article-list > ul > li');
    const info = articles
        .map((i, e) => {
            const c = $(e);
            const r = {
                title: c.find('h3 a[href]').text().trim(),
                link: url.resolve(base, c.find('h3 a[href]').attr('href')),
                pubDate: timezone(parseDate(c.find('h4').text().trim(), 'YYYY-MM-DD'), +8)
            };
            return r;
        })
        .get();

    return info;
};

const configs = {
    // 关于CAAI
    40: { title: '条例与法规' },
    41: { title: '主要领导' },
    43: { title: '分支机构' },
    90: { title: '学会党建' },
    77: { title: '文档下载' },

    // 学会动态
    46: { title: '学会新闻' },
    47: { title: '通知公告' },
    49: { title: '活动预告' },
    71: { title: '对外合作' },
    63: { title: '培训动态' },

    // 党建强会
    79: { title: '党建强会' },
    115: { title: '党史学习' },

    // 奖励与推荐
    65: { title: '吴文俊奖' },
    86: { title: '青托计划' },
    67: { title: '院士推荐' },
    91: { title: '成果鉴定' },

    // CAAI资源
    52: { title: '学会期刊' },
    53: { title: '学科皮书系列' },
    54: { title: '年鉴及发展报告' },

    // 会员专区
    69: { title: '学会会员' },
    135: { title: '高级会员' },
    83: { title: '会员荣誉' },
    74: { title: '单位会员' },
};

module.exports = {
    BASE: base,
    urlBase,
    fetchAllArticles,
    detailPage,
    renderDesc,
    configs,
};
