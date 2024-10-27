import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/articles/:id?', // 添加 id 参数，用于控制 pid
    categories: ['new-media'],
    example: '/articles/9', // 示例路径更新
    parameters: { id: '文章类型 ID，8 为得到头条，9 为得到精选，默认为 8' },
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
            source: ['igetget.com'],
            target: '/articles/:id',
        },
    ],
    name: '得到文章',
    maintainers: ['Jacky-Chen-Pro'],
    handler,
    url: 'https://www.igetget.com',
};

// 提取文章内容的函数
function extractArticleContent(data) {
    const paragraphs = [];

    for (const block of data) {
        if (block.type === 'paragraph') {
            let paragraph = '';
            for (const item of block.contents) {
                if (item.type === 'text' && item.text?.content) {
                    let content = item.text.content;
                    if (item.text?.highlight) {
                        content = `<strong>${content}</strong>`;
                    }
                    paragraph += content;
                }
            }
            if (paragraph) {
                paragraphs.push(`<p>${paragraph}</p>`);
            }
        }
    }
    return paragraphs.join('');
}

async function handler(ctx) {
    const { id = '8' } = ctx.req.param();

    const rootUrl = 'https://www.igetget.com';

    const headers = {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=UTF-8',
        Referer: `https://m.igetget.com/share/course/free/detail?id=nb9L2q1e3OxKBPNsdoJrgN8P0Rwo6B`,
        Origin: 'https://m.igetget.com',
    };

    const max_id = 0;

    const response = await got.post('https://m.igetget.com/share/api/course/free/pageTurning', {
        json: {
            chapter_id: 0,
            count: 5,
            max_id,
            max_order_num: 0,
            pid: Number(id),
            ptype: 24,
            reverse: true,
            since_id: 0,
            since_order_num: 0,
        },
        headers,
    });

    const data = JSON.parse(response.body);

    if (!data || !data.article_list) {
        throw new Error('文章列表不存在或为空');
    }

    const articles = data.article_list;

    const items = await Promise.all(
        articles.map(async (article: any) => {
            const postTitle = article.title;
            const postUrl = `https://m.igetget.com/share/course/article/article_id/${article.id}`;
            const postTime = new Date(article.publish_time * 1000).toUTCString();

            const detailResponse = await got.get(postUrl, { headers });
            const $ = load(detailResponse.body);

            const scriptTag = $('script')
                .filter((_, el) => $(el).html()?.includes('window.__INITIAL_STATE__'))
                .html();

            if (scriptTag) {
                const jsonStr = scriptTag.match(/window\.__INITIAL_STATE__\s*=\s*(\{.*\});/)?.[1];
                if (jsonStr) {
                    const articleData = JSON.parse(jsonStr);

                    const description = extractArticleContent(JSON.parse(articleData.articleContent.content));

                    return {
                        title: postTitle,
                        link: postUrl,
                        description,
                        pubDate: postTime,
                    };
                }
            }
            return null;
        })
    );

    return {
        title: `得到文章 - ${id === '8' ? '头条' : '精选'}`,
        link: rootUrl,
        item: items.filter(Boolean),
    };
}
