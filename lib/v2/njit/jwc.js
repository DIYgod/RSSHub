const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://jwc.njit.edu.cn';

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'jx';
    const link = host + '/index/' + type + '.htm';
    const response = await got({
        method: 'get',
        url: link,
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = cheerio.load(response.body);

    const urlList = $('body')
        .find('ul li span a')
        .map((i, e) => $(e).attr('href'))
        .get();

    const titleList = $('body')
        .find('ul li span a')
        .map((i, e) => $(e).attr('title'))
        .get();

    const dateList = $('body')
        .find('span.date')
        .map((i, e) => $(e).text())
        .get();

    const out = await Promise.all(
        urlList.map((itemUrl, index) => {
            itemUrl = new URL(itemUrl, host).href;
            if (itemUrl.indexOf('.htm') !== -1) {
                return ctx.cache.tryGet(itemUrl, async () => {
                    const response = await got({
                        method: 'get',
                        url: itemUrl,
                        https: {
                            rejectUnauthorized: false,
                        },
                    });
                    if (response.redirectUrls.length !== 0) {
                        const single = {
                            title: titleList[index],
                            link: itemUrl,
                            description: '该通知无法直接预览, 请点击原文链接↑查看',
                            pubDate: parseDate(dateList[index]),
                        };
                        return single;
                    }
                    const $ = cheerio.load(response.body);
                    const single = {
                        title: $('title').text(),
                        link: itemUrl,
                        description: $('.v_news_content')
                            .html()
                            .replace(/src="\//g, `src="${new URL('.', host).href}`)
                            .replace(/href="\//g, `href="${new URL('.', host).href}`)
                            .trim(),
                        pubDate: $('.author p').eq(1).text().replace('时间:', ''),
                    };
                    return single;
                });
            } else {
                const single = {
                    title: titleList[index],
                    link: itemUrl,
                    description: '该通知为文件，请点击原文链接↑下载',
                    pubDate: parseDate(dateList[index]),
                };
                return single;
            }
        })
    );
    let info = '教学';
    if (type === 'ks') {
        info = '考试';
    } else if (type === 'xx') {
        info = '信息';
    } else if (type === 'sj') {
        info = '实践';
    }
    ctx.state.data = {
        title: '南京工程学院教务处 -- ' + info,
        link,
        item: out,
    };
};
