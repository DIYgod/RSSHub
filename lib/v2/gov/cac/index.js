const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const path = ctx.params[0];
    const host = 'http://www.cac.gov.cn';
    const homepage = `${host}/index.htm`;
    // 在首页查找出所有的目录完整路径，比如http://www.cac.gov.cn/xxh/A0906index_1.htm
    // xxh --> {"path": "/xxh", "completeUrl": "http://www.cac.gov.cn/xxh/A0906index_1.htm"}
    const pathList = await ctx.cache.tryGet(
        'gov:cac:pathList',
        async () => {
            const { data: homepageResponse } = await got(homepage);
            const $ = cheerio.load(homepageResponse);
            return $('a')
                .toArray()
                .map((item) => {
                    const href = $(item).attr('href');
                    if (href && href.startsWith('http://www.cac.gov.cn/')) {
                        const matchArray = href.match(/http:\/\/www\.cac\.gov\.cn(.*?)\/(A.*?\.htm)/);
                        if (matchArray && matchArray.length > 2) {
                            const path = matchArray[1];
                            const htmlName = matchArray[2];
                            return {
                                path,
                                completeUrl: `${host}${path}/${htmlName}`,
                            };
                        }
                    }
                    return null;
                })
                .filter((item) => item);
        },
        config.cache.routeExpire,
        false
    );

    const completeUrl = pathList.find((item) => item && item.path === path).completeUrl;
    const { data: channelResponse } = await got(completeUrl);
    const $1 = cheerio.load(channelResponse);
    const items = $1('li.clearfix')
        .toArray()
        .map((item) => {
            const c = $1(item);
            const a = c.find('a');
            const articleHref = a.attr('href');
            const title = a.text();
            const date = parseDate(c.find('span.times').text());
            return {
                link: articleHref,
                pubDate: timezone(date),
                title,
                description: title,
            };
        });
    ctx.state.data = {
        title: $1('head title').text(),
        link: completeUrl,
        item: items,
    };
};
