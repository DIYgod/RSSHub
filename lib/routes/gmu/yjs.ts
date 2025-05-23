import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import type { Route } from '@/types';

const sections = {
    zsgz: {
        tzgg: { title: '招生工作 - 通知公告', path: '/zsgz/tzgg.htm' },
        xwsd: { title: '招生工作 - 新闻速递', path: '/zsgz/xwsd.htm' },
    },
    pygz: {
        tzgg: { title: '培养工作 - 通知公告', path: '/pygz/tzgg.htm' },
        gzzd: { title: '培养工作 - 规章制度', path: '/pygz/gzzd.htm' },
    },
    xwgz: {
        tzgg: { title: '学位工作 - 通知公告', path: '/xwgz/tzgg.htm' },
        dsgl: { title: '学位工作 - 导师管理', path: '/xwgz/dsgl.htm' },
        xwgl: { title: '学位工作 - 学位管理', path: '/xwgz/xwgl.htm' },
        pggz: { title: '学位工作 - 评估工作', path: '/xwgz/pggz.htm' },
    },
    xsgz: {
        tzgg: { title: '学生工作 - 通知公告', path: '/xsgz/tzgg.htm' },
        xwsd: { title: '学生工作 - 新闻速递', path: '/xsgz/xwsd.htm' },
        xshd: { title: '学生工作 - 学生活动', path: '/xsgz/xshd.htm' },
        jzgz: { title: '学生工作 - 奖助工作', path: '/xsgz/jzgz.htm' },
    },
    xzzx: {
        zsxz: { title: '下载中心 - 招生下载', path: '/xzzx/zsxz.htm' },
        pyxz: { title: '下载中心 - 培养下载', path: '/xzzx/pyxz.htm' },
        // xsxz: { title: '下载中心 - 学生下载', path: '/xzzx/xsxz.htm' },
        xwxz: { title: '下载中心 - 学位下载', path: '/xzzx/xwxz.htm' },
    },
};

export const route: Route = {
    path: '/yjs/:type/:subtype',
    categories: ['university'],
    example: '/gmu/yjs/zsgz/tzgg',
    parameters: {
        type: '分类，见下表',
        subtype: '子分类，见下表',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '研究生院',
    maintainers: ['FrankFahey'],
    description: `| 分类 | 子分类 | 备注 |
| ---- | ------ | ---- |
| zsgz | tzgg | 招生工作通知公告 |
| zsgz | xwsd | 招生工作新闻速递 |
| pygz | tzgg | 培养工作通知公告 |
| pygz | gzzd | 培养工作规章制度 |
| xwgz | tzgg | 学位工作通知公告 |
| xwgz | dsgl | 学位工作导师管理 |
| xwgz | xwgl | 学位工作学位管理 |
| xwgz | pggz | 学位工作评估工作 |
| xsgz | tzgg | 学生工作通知公告 |
| xsgz | xwsd | 学生工作新闻速递 |
| xsgz | xshd | 学生工作学生活动 |
| xsgz | jzgz | 学生工作奖助工作 |
| xzzx | zsxz | 下载中心招生下载 |
| xzzx | pyxz | 下载中心培养下载 |
// | xzzx | xsxz | 下载中心学生下载 |
| xzzx | xwxz | 下载中心学位下载 |`,
    radar: [
        {
            source: ['yjs.gmu.cn/:type/:subtype.htm', 'yjs.gmu.cn/'],
            target: '/yjs/:type/:subtype',
        },
    ],
    handler,
};

export async function handler(ctx) {
    const { type, subtype } = ctx.req.param();

    if (!sections[type] || !sections[type][subtype]) {
        throw new Error('Invalid type or subtype');
    }

    const { title, path } = sections[type][subtype];
    const baseUrl = 'https://yjs.gmu.cn';
    const link = baseUrl + path;

    const response = await got(link, {
        https: {
            rejectUnauthorized: false,
        },
        timeout: 10000,
        retry: 3,
    });

    const $ = load(response.data);

    // 更新选择器以匹配研究生院网站的实际结构
    const list = $('.n_listxx1 li');

    if (list.length === 0) {
        throw new Error('No content found. The page structure might have changed.');
    }

    const items = await Promise.all(
        list
            .toArray()
            .map(async (item) => {
                const element = $(item);

                // 针对不同栏目适配不同结构
                let a, dateText, itemTitle, description;
                if (["bmgk", "xzzx"].includes(type)) {
                    // 适配部门概况、下载中心等栏目
                    a = element.find('a').first();
                    dateText = element.find('span.time').text().trim() || '';
                    itemTitle = a.text().trim();
                    description = element.find('p').text().trim() || '';
                } else if (type === 'xsgz' && subtype === 'xshd') {
                    // 适配学生活动特殊结构
                    a = element.find('a').first();
                    dateText = element.find('span.time').text().trim() || '';
                    itemTitle = a.text().trim();
                    description = element.find('p').text().trim() || '';
                } else {
                    // 默认结构
                    a = element.find('h2 a').first();
                    dateText = element.find('h2 span.time').text().trim();
                    itemTitle = a.text().trim();
                    description = element.find('p').text().trim();
                }

                const href = a.attr('href');

                if (!href || !itemTitle) {
                    return null;
                }

                const pubDate = parseDate(dateText);
                if (!pubDate) {
                    return null;
                }

                let fullLink = href;
                if (href.startsWith('/')) {
                    fullLink = new URL(href, baseUrl).href;
                } else if (!href.startsWith('http')) {
                    const currentPath = new URL(link).pathname;
                    const basePath = currentPath.slice(0, Math.max(0, currentPath.lastIndexOf('/') + 1));
                    fullLink = new URL(basePath + href, baseUrl).href;
                }

                try {
                    const contentResponse = await got(fullLink, {
                        https: {
                            rejectUnauthorized: false,
                        },
                        timeout: 10000,
                        retry: 3,
                    });
                    const content = load(contentResponse.data);

                    // 更新选择器以适应研究生院网站的文章页面结构
                    const articleTitle = content('.winstyle196327 .title').text().trim() || itemTitle;
                    const articleInfo = content('.winstyle196327 .info').text().trim();
                    const articleContent = content('.winstyle196327 .content').html() || description;

                    const fullDescription = `
                        <h1>${articleTitle}</h1>
                        <div class="article-info">${articleInfo}</div>
                        <div class="article-content">
                            ${articleContent}
                        </div>
                        <p><a href="${fullLink}" target="_blank" rel="noopener noreferrer">查看原文</a></p>
                    `;

                    return {
                        title: itemTitle,
                        link: fullLink,
                        pubDate,
                        description: fullDescription,
                    };
                } catch {
                    // 如果获取文章内容失败，返回列表页的简要信息
                    return {
                        title: itemTitle,
                        link: fullLink,
                        pubDate,
                        description,
                    };
                }
            })
            .filter((item): item is Promise<{ title: string; link: string; pubDate: Date; description: string }> => item !== null)
    );

    const validItems = items.filter((item): item is { title: string; link: string; pubDate: Date; description: string } => item !== null);

    if (validItems.length === 0) {
        throw new Error('No valid items found');
    }

    return {
        title,
        link,
        description: title,
        item: validItems,
    };
}
