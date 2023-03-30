const dayjs = require('dayjs');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('@/config').value;

dayjs.extend(require('dayjs/plugin/isSameOrBefore'));

module.exports = async (ctx) => {
    const articleUrl = 'https://help.openai.com/en/articles/6825453-chatgpt-release-notes';

    const cache = await ctx.cache.tryGet(
        articleUrl,
        async () => {
            const returns = [];

            const pageResponse = await got({
                method: 'get',
                url: articleUrl,
            });

            const $ = cheerio.load(pageResponse.data);
            const page = JSON.parse($('script#__NEXT_DATA__').text()); // 页面貌似是用 Next 渲染的，有现成的 JSON 数据可以直接 parse

            const feedTitle = page.props.pageProps.articleContent.title;
            const feedDesc = page.props.pageProps.articleContent.description;
            const $author = page.props.pageProps.articleContent.author;
            const authorName = $author.name;

            const $blocks = page.props.pageProps.articleContent.blocks;

            const anchorDay = dayjs();
            let heading = null,
                articleObj = {};
            let year = anchorDay.year();
            let prevMonth = null;

            $blocks.forEach((block) => {
                const text = (block.text || '').trim();
                if (!text) {
                    return;
                }
                if (block.type === 'subheading') {
                    if (heading !== null) {
                        articleObj.description = articleObj.description.trim().replace(/\n/g, '<br/>');
                        returns.push(articleObj);
                        articleObj = {};
                    }

                    heading = text;

                    articleObj.title = heading;
                    articleObj.author = authorName;
                    articleObj.category = 'ChatGPT';
                    articleObj.link = articleUrl + '#' + block.idAttribute;
                    articleObj.description = '';

                    const matchesPubDate = heading.match(/\((\w+\s\d{1,2})\)$/);
                    // 目前 ChatGPT Release Notes 页面并没有写入年份，所以只能靠猜
                    // 实现：当年度交替时，年份减去 1
                    if (matchesPubDate !== null) {
                        const curMonth = matchesPubDate[1].split(' ')[0];
                        if (prevMonth === 'Jan' && prevMonth !== curMonth) {
                            year--; // 年度交替：上一个月份是 Jan，现在的不是 Jan
                        }

                        prevMonth = curMonth;
                        const pubDay = dayjs(`${matchesPubDate[1]}, ${year}`, ['MMMM D, YYYY', 'MMM D, YYYY'], 'en', true);
                        // 从 ISO（GMT）时间的字符串（使用字符串替换的方式）替换成 US/Pacific PST 时区的表达
                        articleObj.pubDate = dayjs(pubDay.toISOString().replace(/\.\d{3}Z$/, '-08:00'));

                        const linkAnchor = pubDay.format('YYYY_MM_DD');
                        articleObj.guid = articleUrl + '#' + linkAnchor;
                    }
                } else {
                    articleObj.description += block.text.trim() + '\n\n';
                }
            });

            if (heading !== null) {
                articleObj.description = articleObj.description.trim().replace(/\n/g, '<br/>');
                returns.push(articleObj);
            }

            return { feedTitle, feedDesc, items: returns };
        },
        config.cache.routeExpire,
        false
    );

    ctx.state.data = {
        title: cache.feedTitle,
        description: cache.feedDesc,
        link: articleUrl,
        item: cache.items,
    };
};
