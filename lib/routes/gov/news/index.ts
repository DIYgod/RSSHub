import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news/:uid',
    categories: ['government'],
    example: '/gov/news/bm',
    parameters: { uid: '分类名' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '政府新闻',
    maintainers: ['EsuRt'],
    handler,
    description: `| 政务部门 | 滚动新闻 | 新闻要闻 | 国务院新闻 | 政策文件 |
  | :------: | :------: | :------: | :--------: | :------: |
  |    bm    |    gd    |    yw    |     gwy    |  zhengce |`,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const originDomain = 'https://www.gov.cn';
    let url = '';
    let title = '';
    let list = '';
    switch (uid) {
        case 'bm':
            url = `${originDomain}/lianbo/bumen/index.htm`;
            title = '中国政府网 - 部门政务';
            break;
        case 'yw':
            url = `${originDomain}/yaowen/index.htm`;
            title = '中国政府网 - 新闻要闻';
            break;
        case 'gd':
            // 因 /xinwen/gundong.htm 被重定向到 /yaowen/index.htm, 所以这里直接用要闻的代替了
            url = `${originDomain}/yaowen/index.htm`;
            title = '中国政府网 - 滚动新闻';
            break;
        case 'gwy':
            url = `${originDomain}/pushinfo/v150203/`;
            title = '中国政府网 - 国务院信息';
            break;
        case 'zhengce':
            url = 'http://sousuo.gov.cn/s.htm?t=zhengcelibrary';
            title = '中国政府网 - 政策文件';
            break;
        default:
            logger.error('pattern not matched');
    }
    const listData = await got.get(url);
    const $ = load(listData.data);
    if (url.includes('zhengcelibrary')) {
        list = $('.dys_middle_result_content_item');
    } else if (url.includes('bumen')) {
        list = $('.infolist li');
    } else {
        list = $('.news_box .list li:not(.line)');
    }

    return {
        title,
        link: url,
        item: await Promise.all(
            list.toArray().map((item) => {
                item = $(item);
                let contentUrl = item.find('a').attr('href');
                contentUrl = contentUrl.startsWith('http') ? contentUrl : new URL(contentUrl, url).href;
                return cache.tryGet(contentUrl, async () => {
                    let description;
                    let fullTextData;
                    let fullTextGet;
                    let pubDate;
                    let author;
                    let category;
                    if (/dysMiddleResultConItemTitle/g.test(item.html())) {
                        if (contentUrl.includes('content')) {
                            fullTextGet = await got.get(contentUrl);
                            fullTextData = load(fullTextGet.data);
                            fullTextData('.shuzi').remove(); // 移除videobg的图片
                            fullTextData('#myFlash').remove(); // 移除flash
                            description = /pages_content/g.test(fullTextData.html()) ? fullTextData('.pages_content').html() : fullTextData('#UCAP-CONTENT').html();
                        } else {
                            description = item.find('a').text(); // 忽略获取吹风会的全文
                        }
                    } else {
                        if (contentUrl.includes('content')) {
                            fullTextGet = await got.get(contentUrl);
                            fullTextData = load(fullTextGet.data);
                            const $1 = fullTextData.html();
                            pubDate = timezone(parseDate(fullTextData('meta[name="firstpublishedtime"]').attr('content'), 'YYYY-MM-DD HH:mm:ss'), 8);
                            author = fullTextData('meta[name="author"]').attr('content');
                            category = fullTextData('meta[name="keywords"]').attr('content').split(/[,;]/);
                            if (/zhengceku/g.test(contentUrl)) {
                                // 政策文件库
                                description = fullTextData('.pages_content').html();
                            } else {
                                fullTextData('.shuzi').remove(); // 移除videobg的图片
                                fullTextData('#myFlash').remove(); // 移除flash
                                description = /UCAP-CONTENT/g.test($1) ? fullTextData('#UCAP-CONTENT').html() : fullTextData('body').html();
                            }
                        } else {
                            description = item.find('a').text(); // 忽略获取吹风会的全文
                        }
                    }
                    return {
                        title: item.find('a').text(),
                        description,
                        link: contentUrl,
                        pubDate,
                        author,
                        category,
                    };
                });
            })
        ),
    };
}
