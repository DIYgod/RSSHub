const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://www.miit.gov.cn';

module.exports = async (ctx) => {
    const ministry = ctx.params.ministry;
    const url = `${rootUrl}/jgsj/${ministry}/wjfb/index.html`;

    const cookieResponse = await got(url);
    const cookie = cookieResponse.headers['set-cookie'][0].split(';')[0];
    const indexContent = cheerio.load(cookieResponse.data);
    const title = indexContent('div.dqwz > a:nth-child(4)').text();
    const dataRequestUrl = indexContent('div.lmy_main_rb > script:nth-child(2)')
        .map((_, item) => ({
            url: `${rootUrl}${indexContent(item).attr('url')}`,
            queryData: JSON.parse(indexContent(item).attr('querydata').replace(/"/g, '|').replace(/'/g, '"').replace(/\|/g, '"')),
        }))
        .get()[0];

    const dataUrl = `${dataRequestUrl.url}?${Object.keys(dataRequestUrl.queryData)
        .map((key) => `${key}=${dataRequestUrl.queryData[key]}`)
        .join('&')}`;
    const response = await got({
        method: 'get',
        url: dataUrl,
        headers: {
            Cookie: cookie,
        },
    });
    const $ = cheerio.load(response.data.data.html);
    const list = $('ul > li')
        .map((_, item) => ({
            title: $(item).find('a').text(),
            link: new URL($(item).find('a').attr('href'), rootUrl).href,
            pubDate: parseDate($(item).find('span').text(), 'YYYY-MM-DD'),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                item.description = content('#con_con')
                    .html()
                    .replace(/(<iframe.*?src=")(.*?)(".*?>)/g, '$1' + rootUrl + '$2' + '$3');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `工业和信息化部 - ${title} 文件发布`,
        link: url,
        item: items,
    };
};
