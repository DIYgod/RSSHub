import { load } from 'cheerio';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/cdyw',
    categories: ['university'],
    example: '/cdu/cdyw',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['news.cdu.edu.cn/'],
        },
    ],
    name: '成大要闻',
    maintainers: ['uuwor'],
    handler,
    url: 'news.cdu.edu.cn/',
};

async function handler() {
    const baseUrl = 'https://news.cdu.edu.cn';
    const url = `${baseUrl}/cdyw.htm`;
    const response = await got.get(url);
    const $ = load(response.data);

    const list = $('.row-b1 ul.ul-mzw-litpic-a2 li a.con')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            const element = $(item);
            const href = element.attr('href');
            // 确保 link 不为 undefined
            const link = href ? (href.startsWith('http') ? href : new URL(href, baseUrl).href) : '';
            const title = element.attr('title') || element.find('.tit').text().trim() || '无标题';
            const dateText = element.find('.date').text().trim();
            const pubDate = dateText ? timezone(parseDate(dateText, 'YYYY-MM-DD'), 8) : new Date();

            return {
                title,
                link,
                pubDate,
                author: '成都大学新闻网',
                description: '',
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const response = await got.get(item.link);
                    const $ = load(response.data);

                    // 提取正文
                    const content = $('#vsb_content_2 .v_news_content');
                    content.find('#div_vote_id').remove();
                    content.find('p:empty').remove();

                    // 处理图片路径
                    content.find('img').each((_, img) => {
                        const src = $(img).attr('src');
                        if (src && src.startsWith('/')) {
                            $(img).attr('src', new URL(src, baseUrl).href);
                        }
                    });

                    return {
                        ...item,
                        description: content.html() || '正文加载失败，请点击链接查看原文。',
                    };
                } catch {
                    return {
                        ...item,
                        description: '文章详情加载失败，请点击链接查看原文。',
                    };
                }
            })
        )
    );

    return {
        title: '要闻',
        link: url,
        item: items,
    };
}
