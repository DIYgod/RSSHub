const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { encode } = require('./base64');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const baseUrl = 'https://ostudy.ynnedu.cn/';
    const blacklist = ['ynnu-mv.html', 'https://chjiao.ynnu.edu.cn/zsgz/zsjz.htm', 'https://chjiao.ynnu.edu.cn/info/1006/1404.htm', 'https://chjiao.ynnu.edu.cn/zsgz/dksw.htm'];
    const { body } = await got(baseUrl);
    const $index = cheerio.load(body);
    ctx.state.data = {
        title: '云南师范大学继续教育学院 #通知',
        link: baseUrl,
        item: await Promise.all([
            // 顶部幻灯片抓取
            Promise.all(
                $index('div[carousel-item] > div')
                    .filter((_, element) => !blacklist.includes($index(element).find('a').attr('href')))
                    .map((_, element) => {
                        const $element = $index(element);
                        const $a = $element.find('a');
                        let link = $a.attr('href');
                        if (!$a.attr('href').startsWith('http')) {
                            link = new URL(link, baseUrl).toString();
                        }
                        if (link.endsWith('.pdf')) {
                            return Promise.resolve({
                                title: $element.find('p').text(),
                                link,
                            });
                        }
                        return ctx.cache.tryGet(link, async () => {
                            const { body: articleBody } = await got(link);
                            const $article = cheerio.load(articleBody, { decodeEntities: false });
                            return {
                                title: $article('#noticeSubject, #inform-content > div:nth-child(1)').text(),
                                link,
                                description: $article('#noticeContent, .oinform-content').html() + $article('.notice-attachment').html(),
                            };
                        });
                    })
                    .get()
            ),
            // 中部新闻抓取
            Promise.all(
                cheerio
                    .load($index('#serviceInform-tpl').html())('.news-li:not(:last-child)')
                    .filter((_, element) => !blacklist.includes($index(element).find('a').attr('href')))
                    .map((_, element) => {
                        const $element = $index(element);
                        const $a = $element.find('a');
                        let link = $a.attr('href');
                        if (!$a.attr('href').startsWith('http')) {
                            link = new URL(link, baseUrl).toString();
                        }
                        if (link.endsWith('.pdf')) {
                            return Promise.resolve({
                                title: $a.text(),
                                link,
                                pubDate: parseDate($element.find('span').text(), '发布时间: YYYY-MM-DD'),
                            });
                        }
                        return ctx.cache.tryGet(link, async () => {
                            const { body: articleBody } = await got(link);
                            const $article = cheerio.load(articleBody, { decodeEntities: false });
                            return {
                                title: $article('#noticeSubject, #inform-content > div:nth-child(1)').text(),
                                link,
                                description: $article('#noticeContent, .oinform-content').html() + $article('.notice-attachment').html(),
                                pubDate: parseDate($element.find('span').text(), '发布时间: YYYY-MM-DD'),
                            };
                        });
                    })
                    .get()
            ),
            got(`${baseUrl}/serviceNotice/queryRecentServiceNotices`, {
                method: 'post',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                },
                body: 'top=10&organizationCode=ORG-CN-EDU-YNNU',
            }).then(({ data: { data } }) =>
                data.map(({ createTime, noticeSubject, noticeContent, noticeCode, publishUnit }) => ({
                    title: noticeSubject,
                    description: noticeContent,
                    pubDate: timezone(parseDate(createTime), +8),
                    link: `${baseUrl}/notice-detail.html?c=${encode(noticeCode)}`,
                    author: publishUnit,
                }))
            ),
            got(`${baseUrl}/newsInformation/queryRecentNewsInformations`, {
                method: 'post',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                },
                body: 'top=10&organizationCode=ORG-CN-EDU-YNNU',
            }).then(({ data: { data } }) =>
                data.map(({ createTime, title, newsContent, newsCode, publishUnit }) => ({
                    title,
                    description: newsContent,
                    pubDate: timezone(parseDate(createTime), +8),
                    link: `${baseUrl}/news-detail.html?c=${encode(newsCode)}`,
                    author: publishUnit,
                }))
            ),
        ]).then((items) => items.flat()),
    };
};
