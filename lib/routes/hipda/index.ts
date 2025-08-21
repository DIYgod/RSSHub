import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';

export const route: Route = {
    path: '/latest',
    categories: ['forum'],
    view: ViewType.Articles,
    example: '/hipda/latest',
    parameters: {},
    features: {
        requireConfig: {
            description: 'HIPDA_COOKIE',
        },
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '最新帖子',
    maintainers: ['jingyi'],
    handler,
};

async function handler() {
    const baseUrl = 'https://www.4d4y.com';
    const forumUrl = `${baseUrl}/forum/forumdisplay.php?fid=2&page=1&orderby=lastpost`;

    const headers = {
        'Host': 'www.4d4y.com',
        'Cookie': config.hipda?.cookie || '',
        'Connection': 'keep-alive',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'zh-cn',
        'Accept-Encoding': 'gzip, deflate',
        'Referer': `${baseUrl}/forum/forumdisplay.php?fid=2`,
    };

    const response = await got({
        method: 'get',
        url: forumUrl,
        headers,
        https: {
            rejectUnauthorized: false,
        },
    });

    const $ = load(response.data);
    const posts = $('tbody');

    const items = posts
        .map((_, post) => {
            const $post = $(post);
            const subjectNew = $post.find('.subject.new');
            
            if (!subjectNew.length) {
                return null; // Skip sticky posts
            }

            const span = subjectNew.find('span');
            const tid = span.attr('id')?.split('_')?.[1];
            
            if (!tid) {
                return null;
            }

            const titleElement = subjectNew.find('a');
            const title = titleElement.text();
            const url = `${baseUrl}/forum/viewthread.php?tid=${tid}`;
            
            const authorElement = $post.find('.author a');
            const author = authorElement.text();

            return {
                title: `${title} (@${author})`,
                link: url,
                author,
                pubDate: parseDate(new Date().toISOString()), // HIPDA doesn't show dates in listing
            };
        })
        .get()
        .filter(Boolean);

    return {
        title: 'HIIPDA (4D4Y) 论坛 - 最新帖子',
        link: forumUrl,
        description: 'HIIPDA (4D4Y) 论坛最新帖子列表',
        item: items,
    };
}