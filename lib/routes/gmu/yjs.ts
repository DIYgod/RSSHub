import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import type { Route } from '@/types';
import type { Context } from 'hono';
import cache from '@/utils/cache';

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
        type: {
            description: '分类，见下表',
            options: [
                { value: 'zsgz', label: '招生工作' },
                { value: 'pygz', label: '培养工作' },
                { value: 'xwgz', label: '学位工作' },
                { value: 'xsgz', label: '学生工作' },
                { value: 'xzzx', label: '下载中心' },
            ],
        },
        subtype: {
            description: '子分类，见下表',
            options: [
                { value: 'tzgg', label: '通知公告' },
                { value: 'xwsd', label: '新闻速递' },
                { value: 'gzzd', label: '规章制度' },
                { value: 'dsgl', label: '导师管理' },
                { value: 'xwgl', label: '学位管理' },
                { value: 'pggz', label: '评估工作' },
                { value: 'xshd', label: '学生活动' },
                { value: 'jzgz', label: '奖助工作' },
                { value: 'zsxz', label: '招生下载' },
                { value: 'pyxz', label: '培养下载' },
                { value: 'xwxz', label: '学位下载' },
            ],
        },
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
    radar: [
        {
            source: ['yjs.gmu.cn/:type/:subtype.htm', 'yjs.gmu.cn/'],
            target: '/yjs/:type/:subtype',
        },
    ],
    handler,
};

export async function handler(ctx: Context) {
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
    });

    const $ = load(response.data);

    // 更新选择器以匹配研究生院网站的实际结构
    const list = $('.n_listxx1 li');

    if (list.length === 0) {
        throw new Error('No content found. The page structure might have changed.');
    }

    const items = await Promise.all(
        list.toArray().map(async (item) => {
            const element = $(item);
            const a = element.find('a');
            const dateText = element.find('span').text();
            const href = a.attr('href');
            const itemTitle = a.text().trim();

            if (!href || !itemTitle) {
                return null;
            }

            const pubDate = parseDate(dateText);
            if (!pubDate) {
                return null;
            }

            const fullLink = new URL(href, link).href;

            // Use cache.tryGet to cache the article content
            return await cache.tryGet(`gmu:yjs:${fullLink}`, async () => {
                try {
                    const contentResponse = await got(fullLink, {
                        https: {
                            rejectUnauthorized: false,
                        },
                    });
                    const content = load(contentResponse.data);

                    // 获取新闻内容
                    const articleContent = content('.v_news_content').html() || '暂无详细内容';

                    return {
                        title: itemTitle,
                        link: fullLink,
                        pubDate,
                        description: articleContent,
                    };
                } catch {
                    // 如果获取文章内容失败，返回基本信息
                    return {
                        title: itemTitle,
                        link: fullLink,
                        pubDate,
                        description: '暂无详细内容',
                    };
                }
            });
        })
    );

    const result = items.filter((item): item is { title: string; link: string; pubDate: Date; description: string } => item !== null);

    return {
        title,
        link,
        description: `广州医科大学研究生院 - ${title}`,
        item: result,
    };
}
