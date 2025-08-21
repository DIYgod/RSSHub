import { Route, ViewType } from '@/types';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
import got from 'got';
import iconv from 'iconv-lite';

export const route: Route = {
    path: '/forum/:fid?',
    categories: ['bbs'],
    view: ViewType.Articles,
    example: '/hipda/forum/2',
    parameters: {
        fid: '论坛分区 ID: Discovery 2, BS 6',
    },
    features: {
        requireConfig: [
            {
                name: 'HIPDA_COOKIE',
                description: 'HIPDA Cookie for authentication',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '论坛帖子',
    maintainers: ['cdpath'],
    handler,
};

export async function handler(ctx) {
    const fid = ctx.req.param('fid') || '2';
    const page = ctx.req.query('page') || '1';

    const baseUrl = 'https://www.4d4y.com';
    const forumUrl = `${baseUrl}/forum/forumdisplay.php?fid=${fid}&page=${page}&orderby=lastpost`;

    const headers = {
        Host: 'www.4d4y.com',
        Cookie: config.hipda?.cookie || '',
        Connection: 'keep-alive',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'com.jichaowu.hipda',
        'Accept-Language': 'zh-cn',
        'Accept-Encoding': 'gzip, deflate',
        Referer: `${baseUrl}/forum/forumdisplay.php?fid=${fid}`,
    };

    const response = await got.get(forumUrl, {
        headers,
        responseType: 'buffer',
        https: {
            rejectUnauthorized: false,
        },
    });

    const isGBK = /charset="?'?gb/i.test(response.body.toString());
    const encoding = isGBK ? 'gbk' : 'utf-8';
    const responseData = iconv.decode(response.body, encoding);

    const $ = load(responseData);
    const posts = $('tbody');

    const items = posts
        .toArray()
        .map((post) => {
            const $post = $(post);
            const subjectNew = $post.find('.subject.new');

            if (!subjectNew.length) {
                return null;
            }

            const span = subjectNew.find('span[id]');
            const tid = span.attr('id')?.split('_')?.pop();

            if (!tid) {
                return null;
            }

            const titleElement = span.find('a');
            const title = titleElement.text().trim();
            const url = `${baseUrl}/forum/viewthread.php?tid=${tid}`;

            const authorElement = $post.find('.author a');
            const author = authorElement.text().trim();

            if (!title || !author || !tid) {
                return null;
            }

            return {
                title: `${title} (@${author})`,
                link: url,
                author,
                pubDate: parseDate(new Date().toISOString()),
            };
        })
        .filter(Boolean);

    const forumNames = {
        '2': 'Discovery',
        '6': 'Buy & Sell 交易服务区',
    };

    const forumName = forumNames[fid] || `分区 ${fid}`;

    return {
        title: `HIPDA - ${forumName}`,
        link: forumUrl,
        description: `HIPDA 论坛${forumName}最新帖子`,
        item: items,
    };
}
