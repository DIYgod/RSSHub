import { Route } from '@/types';
import cache from '@/utils/cache';
import dayjs from 'dayjs';
import got from '@/utils/got';
import { load } from 'cheerio';
import { config } from '@/config';

import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);

export const route: Route = {
    path: '/chatgpt/release-notes',
    categories: ['program-update'],
    example: '/openai/chatgpt/release-notes',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'ChatGPT - Release Notes',
    maintainers: [],
    handler,
};

async function handler() {
    const articleUrl = 'https://help.openai.com/en/articles/6825453-chatgpt-release-notes';

    const cacheIn = await cache.tryGet(
        articleUrl,
        async () => {
            const returns = [];

            const pageResponse = await got({
                method: 'get',
                url: articleUrl,
            });

            const $ = load(pageResponse.data);
            const page = JSON.parse($('script#__NEXT_DATA__').text()); // 页面貌似是用 Next 渲染的，有现成的 JSON 数据可以直接 parse，而避免用 cheerio 去解析主体内容的 HTML

            const feedTitle = page.props.pageProps.articleContent.title;
            const feedDesc = page.props.pageProps.articleContent.description;
            const $author = page.props.pageProps.articleContent.author;
            const authorName = $author.name;

            const $blocks = page.props.pageProps.articleContent.blocks;

            const anchorDay = dayjs();
            let heading = null,
                articleObj = {};
            let year = anchorDay.year();
            let prevMonth = -1;

            for (const block of $blocks) {
                const text = (block.text || '').trim();
                if (!text) {
                    continue;
                }
                if (block.type === 'subheading') {
                    if (heading !== null) {
                        articleObj.description = articleObj.description.trim().replaceAll('\n', '<br/>');
                        returns.push(articleObj);
                        articleObj = {};
                    }

                    heading = text;

                    articleObj.title = heading;
                    articleObj.author = authorName;
                    articleObj.category = 'ChatGPT';
                    articleObj.link = articleUrl + '#' + block.idAttribute;
                    articleObj.guid = articleUrl + '#' + block.idAttribute;
                    articleObj.description = '';

                    // 目前 ChatGPT Release Notes 页面并没有写入年份，所以只能靠猜
                    // 当前的正则表达式只支持 (月份英文+空格+日期数字) 的格式
                    const matchesPubDate = heading.match(/\((\w+\s+\d{1,2})\)$/);
                    // 实现：当年度交替时，年份减去 1
                    if (matchesPubDate !== null) {
                        const curMonth = 1 + 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(',').indexOf(matchesPubDate[1].substring(0, 3));
                        if (prevMonth !== -1 && prevMonth < curMonth) {
                            year--; // 年度交替：上一个月份数小于当前月份数；但排除 prevMonth==-1 的初始化情况
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
            }

            if (heading !== null) {
                articleObj.description = articleObj.description.trim().replaceAll('\n', '<br/>');
                returns.push(articleObj);
            }

            return { feedTitle, feedDesc, items: returns };
        },
        config.cache.routeExpire,
        false
    );

    return {
        title: cacheIn.feedTitle,
        description: cacheIn.feedDesc,
        link: articleUrl,
        item: cacheIn.items,
    };
}
