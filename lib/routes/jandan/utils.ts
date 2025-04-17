import { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36';

/**
 * Extract page ID from script tags in HTML
 */
export const extractPageId = async (url: string, referer: string): Promise<string> => {
    const response = await ofetch(url, {
        headers: {
            'User-Agent': USER_AGENT,
            Referer: referer,
            Accept: 'application/json, text/plain, */*',
        },
    });

    const $ = load(response);
    let pageId = '';

    $('script').each((_, script) => {
        const content = $(script).html() || '';
        const match = content.match(/PAGE\s*=\s*{\s*id\s*:\s*(\d+)\s*}/);
        if (match) {
            pageId = match[1];
        }
    });

    return pageId;
};

/**
 * Handle the top section (热榜)
 */
export const handleTopSection = async (rootUrl: string, type: string): Promise<{ title: string; items: DataItem[] }> => {
    const apiUrl = `${rootUrl}/api/top/${type}`;
    const response = await ofetch(apiUrl, {
        headers: {
            'User-Agent': USER_AGENT,
            Referer: rootUrl,
            Accept: 'application/json, text/plain, */*',
        },
    });

    let title = '热榜';
    switch (type) {
        case 'pic3days':
            title += ' - 3天内无聊图';
            break;
        case 'pic7days':
            title += ' - 7天内无聊图';
            break;
        default:
            title += ' - 4小时热门';
            break;
    }

    if (response.code === 0 && response.data && Array.isArray(response.data)) {
        const items = response.data.map((item) => {
            const content = item.content.replaceAll(/img src="(.*?)"/g, (match, src) => match.replace(src, src.replace(/^https?:\/\/(\w+)\.moyu\.im/, 'https://$1.sinaimg.cn')));

            return {
                author: item.author,
                title: `${item.author}: ${content.replaceAll(/<[^>]+>/g, '')}`,
                description: content,
                pubDate: parseDate(item.date),
                link: `${rootUrl}/t/${item.id}`,
            } as DataItem;
        });

        return { title, items };
    }

    return {
        title,
        items: [
            {
                title: `获取失败: ${title}`,
                description: '未能获取热榜数据',
                link: `${rootUrl}/top`,
                pubDate: new Date(),
            },
        ],
    };
};

/**
 * Handle the forum/bbs section (鱼塘)
 */
export const handleForumSection = async (rootUrl: string): Promise<{ title: string; items: DataItem[] }> => {
    const title = '煎蛋 - 鱼塘';
    const currentUrl = `${rootUrl}/bbs`;

    try {
        const forumId = await extractPageId(currentUrl, rootUrl);

        if (!forumId) {
            return {
                title,
                items: [
                    {
                        title: `获取失败: ${title}`,
                        description: '无法获取论坛ID',
                        link: currentUrl,
                        pubDate: new Date(),
                    },
                ],
            };
        }

        const apiUrl = `${rootUrl}/api/forum/posts/${forumId}?page=1`;
        const forumData = await ofetch(apiUrl, {
            headers: {
                'User-Agent': USER_AGENT,
                Referer: currentUrl,
                Accept: 'application/json, text/plain, */*',
            },
        });

        if (forumData.code === 0 && forumData.data && forumData.data.list && Array.isArray(forumData.data.list)) {
            const items = forumData.data.list.map((post) => {
                const content = post.content.replaceAll(/img src="(.*?)"/g, (match, src) => match.replace(src, src.replace(/^https?:\/\/(\w+)\.moyu\.im/, 'https://$1.sinaimg.cn')));

                return {
                    author: post.author_name,
                    title: post.title || `${post.author_name}发表了新主题`,
                    description: content,
                    pubDate: parseDate(post.update_time || post.create_time),
                    link: `${rootUrl}/bbs#/topic/${post.post_id}`,
                    category: post.reply_count > 0 ? [`${post.reply_count}条回复`] : undefined,
                } as DataItem;
            });

            return { title, items };
        }

        return {
            title,
            items: [
                {
                    title: `获取失败: ${title}`,
                    description: '未能获取鱼塘数据',
                    link: currentUrl,
                    pubDate: new Date(),
                },
            ],
        };
    } catch (error) {
        return {
            title,
            items: [
                {
                    title: `解析错误: 鱼塘`,
                    description: `解析鱼塘页面时出错: ${error instanceof Error ? error.message : String(error)}`,
                    link: currentUrl,
                    pubDate: new Date(),
                },
            ],
        };
    }
};

/**
 * Handle other sections (问答, 树洞, 随手拍, 无聊图)
 */
export const handleCommentSection = async (rootUrl: string, category: string): Promise<{ title: string; items: DataItem[] }> => {
    const currentUrl = `${rootUrl}/${category}`;

    try {
        const pageId = await extractPageId(currentUrl, rootUrl);

        const response = await ofetch(currentUrl, {
            headers: {
                'User-Agent': USER_AGENT,
                Referer: rootUrl,
                Accept: 'application/json, text/plain, */*',
            },
        });

        const $ = load(response);
        const title = String($('title').text().trim()) || `煎蛋 - ${category}`;

        if (!pageId) {
            return {
                title,
                items: [
                    {
                        title: `无法解析: ${title}`,
                        description: '无法从页面中获取到帖子ID，可能网站结构已变更',
                        link: currentUrl,
                        pubDate: new Date(),
                    },
                ],
            };
        }

        const apiUrl = `${rootUrl}/api/comment/post/${pageId}?order=desc&page=1`;
        const commentsData = await ofetch(apiUrl, {
            headers: {
                'User-Agent': USER_AGENT,
                Referer: currentUrl,
                Accept: 'application/json, text/plain, */*',
            },
        });

        if (commentsData.code === 0 && commentsData.data && commentsData.data.list && Array.isArray(commentsData.data.list)) {
            const items = commentsData.data.list.map((comment) => {
                const content = comment.content.replaceAll(/img src="(.*?)"/g, (match, src) => match.replace(src, src.replace(/^https?:\/\/(\w+)\.moyu\.im/, 'https://$1.sinaimg.cn')));

                return {
                    author: comment.author,
                    title: `${comment.author}: ${content.replaceAll(/<[^>]+>/g, '')}`,
                    description: content,
                    pubDate: parseDate(comment.date_gmt || comment.date),
                    link: `${rootUrl}/t/${comment.id}`,
                } as DataItem;
            });

            return { title, items };
        }

        return {
            title,
            items: [
                {
                    title: `暂无内容: ${title || category}`,
                    description: '没有获取到内容，可能需要更新解析规则',
                    link: currentUrl,
                    pubDate: new Date(),
                },
            ],
        };
    } catch {
        return {
            title: `煎蛋 - ${category}`,
            items: [
                {
                    title: `解析错误: ${category}`,
                    description: '解析页面时出错',
                    link: currentUrl,
                    pubDate: new Date(),
                },
            ],
        };
    }
};
