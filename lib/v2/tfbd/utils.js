const cheerio = require('cheerio');
const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const url = require('url');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const base = 'http://tfbd.ccf.org.cn';

const urlBase = (caty, id) => url.resolve(base, `/tfbd/${caty}/${id}/`);

const renderAuthor = (author) => art(path.join(__dirname, 'templates/author.art'), author);
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
        const description = $('div.articleCon').html();

        return {
            description,
        };
    });

const fetchAllArticles = (data, base) => {
    const $ = cheerio.load(data);
    const articles = $('div.file-list div.article-item');
    const info = articles
        .map((i, e) => {
            const c = $(e);
            const r = {
                title: c.find('h3 a[href]').text().trim(),
                link: url.resolve(base, c.find('h3 a[href]').attr('href')),
                pubDate: timezone(parseDate(c.find('p').text().trim(), 'YYYY-MM-DD'), +8)
            };
            return r;
        })
        .get();

    return info;
};

const configs = {
    xwdt: {
        title: '新闻动态', child: {
            tzgg: { title: '通知公告' },
            wydt: { title: '委员动态' },
        }
    },
    pphd: {
        title: '品牌活动', child: {
            xsjl: { title: '学术交流' },
            jsjl: { title: '技术交流' },
            cjds: { title: '创建大赛' },
            zlyj: { title: '战略研究' },
            jy: { title: '教育' },
            top10dsjyy: { title: 'Top10大数据应用' },
            zjxl: { title: '走进系列' },
        }
    },
    ljhd: {
        title: '历届活动', child: {
            xsjl: { title: '学术交流' },
            jsjl: { title: '技术交流' },
            cxds: { title: '创新大赛' },
        }
    },
};

module.exports = {
    BASE: base,
    urlBase,
    fetchAllArticles,
    detailPage,
    renderDesc,
    renderAuthor,
    configs,
};
