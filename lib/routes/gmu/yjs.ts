import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const sections = {
    zsgz: {
        tzgg: { title: '招生工作 - 通知公告', path: '/tzgg/zsgz.htm' },
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
        tzgg: { title: '学生工作 - 通知公告', path: '/tzgg/xsgz.htm' },
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
            source: ['yjs.gmu.cn/', 'yjs.gmu.cn/tzgg/zsgz.htm'],
            target: '/yjs/zsgz/tzgg',
        },
        {
            title: '培养工作 - 通知公告',
            source: ['yjs.gmu.cn/pygz/tzgg.htm'],
            target: '/yjs/pygz/tzgg',
        },
        {
            title: '培养工作 - 规章制度',
            source: ['yjs.gmu.cn/pygz/gzzd.htm'],
            target: '/yjs/pygz/gzzd',
        },
        {
            title: '学位工作 - 通知公告',
            source: ['yjs.gmu.cn/xwgz/tzgg.htm'],
            target: '/yjs/xwgz/tzgg',
        },
        {
            title: '学位工作 - 导师管理',
            source: ['yjs.gmu.cn/xwgz/dsgl.htm'],
            target: '/yjs/xwgz/dsgl',
        },
        {
            title: '学位工作 - 学位管理',
            source: ['yjs.gmu.cn/xwgz/xwgl.htm'],
            target: '/yjs/xwgz/xwgl',
        },
        {
            title: '学位工作 - 评估工作',
            source: ['yjs.gmu.cn/xwgz/pggz.htm'],
            target: '/yjs/xwgz/pggz',
        },
        {
            title: '学生工作 - 通知公告',
            source: ['yjs.gmu.cn/tzgg/xsgz.htm'],
            target: '/yjs/xsgz/tzgg',
        },
        {
            title: '学生工作 - 学生活动',
            source: ['yjs.gmu.cn/xsgz/xshd.htm'],
            target: '/yjs/xsgz/xshd',
        },
        {
            title: '学生工作 - 奖助工作',
            source: ['yjs.gmu.cn/xsgz/jzgz.htm'],
            target: '/yjs/xsgz/jzgz',
        },
        {
            title: '下载中心 - 招生下载',
            source: ['yjs.gmu.cn/xzzx/zsxz.htm'],
            target: '/yjs/xzzx/zsxz',
        },
        {
            title: '下载中心 - 培养下载',
            source: ['yjs.gmu.cn/xzzx/pyxz.htm'],
            target: '/yjs/xzzx/pyxz',
        },
        {
            title: '下载中心 - 学位下载',
            source: ['yjs.gmu.cn/xzzx/xwxz.htm'],
            target: '/yjs/xzzx/xwxz',
        },
    ],
    handler,
};

export async function handler(ctx: Context) {
    const { type, subtype } = ctx.req.param();

    if (!Object.hasOwn(sections, type) || !Object.hasOwn(sections[type], subtype)) {
        throw new Error('Invalid type or subtype');
    }

    const { title, path } = sections[type][subtype];
    const baseUrl = 'https://yjs.gmu.cn';
    const link = baseUrl + path;

    const response = await got(link);

    const $ = load(response.data);

    // Read the article list for this graduate school section.
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
            const itemTitle = a.attr('title') || a.text();

            if (!href || !itemTitle) {
                return null;
            }

            const publicationDate = dateText ? parseDate(dateText) : undefined;
            const pubDate = publicationDate && !Number.isNaN(publicationDate.getTime()) ? timezone(publicationDate, 8) : undefined;

            const fullLink = new URL(href, link).href;

            const detail = await cache.tryGet(`gmu:yjs:${fullLink}:content`, async () => {
                const contentResponse = await got(fullLink);
                const content = load(contentResponse.data);
                const article = content('.v_news_content');
                const description = article.length ? article.html() : new URL(fullLink).hostname === 'www.jxeea.cn' ? content('#zoom').html() : undefined;
                return { description: description ?? undefined };
            });

            return {
                title: itemTitle,
                link: fullLink,
                pubDate,
                ...detail,
            };
        })
    );

    const result = items.filter((item): item is { title: string; link: string; pubDate: Date | undefined; description: string | undefined } => item !== null);

    return {
        title,
        link,
        description: `赣南医科大学研究生院 - ${title}`,
        item: result,
    };
}
