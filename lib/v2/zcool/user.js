const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { extractArticle, extractWork } = require('./utils');
const { isValidHost } = require('@/utils/valid-host');

module.exports = async (ctx) => {
    const { uid } = ctx.params;
    let pageUrl = `https://www.zcool.com.cn/u/${uid}`;
    if (isNaN(uid)) {
        if (!isValidHost(uid)) {
            throw Error('Invalid uid');
        }
        pageUrl = `https://${uid}.zcool.com.cn`;
    }
    const { data: response } = await got(pageUrl);
    const $ = cheerio.load(response);
    const data = JSON.parse($('script#__NEXT_DATA__').text());

    const workList = data.props.pageProps.workList.map((item) => ({
        title: item.title,
        link: item.pageUrl,
        pubDate: parseDate(item.publishTime, 'x'),
        category: [item.objectTypeStr, item.cateStr, item.subCateStr, ...item.tags],
    }));

    const items = await Promise.all(
        workList.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                const data = JSON.parse($('script#__NEXT_DATA__').text());
                if (item.link.startsWith('https://www.zcool.com.cn/article/')) {
                    item.description = extractArticle(data);
                } else if (item.link.startsWith('https://www.zcool.com.cn/work/')) {
                    item.description = extractWork(data);
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: data.props.pageProps.seo.title,
        description: data.props.pageProps.seo.description,
        image: data.props.pageProps.userInfo.avatar.includes('?x-oss-process') ? data.props.pageProps.userInfo.avatar.split('?')[0] : data.props.pageProps.userInfo.avatar,
        link: pageUrl,
        item: items,
    };
};
