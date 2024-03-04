// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const isEnglish = ctx.req.param('lang') !== 'zh';

    const lang = isEnglish ? '' : 'zh/';
    const types = [
        'social-media',
        'new-media',
        'traditional-media',
        'bbs',
        'blog',
        'programming',
        'design',
        'live',
        'multimedia',
        'picture',
        'anime',
        'program-update',
        'university',
        'forecast',
        'travel',
        'shopping',
        'game',
        'reading',
        'government',
        'study',
        'journal',
        'finance',
        'other',
    ];
    const all = await Promise.all(
        types.map(async (type) => {
            const response = await got(`https://docs.rsshub.app/${lang}routes/${type}`);

            const data = response.data;

            const $ = load(data);
            const page = $('.page').toArray();
            const item = $('.routeBlock').toArray();
            return { page, item, type };
        })
    );
    const list = all.flatMap(({ page, item, type }) => item.map((item) => ({ page, item, type })));

    ctx.set('data', {
        title: isEnglish ? 'RSSHub has new routes' : 'RSSHub 有新路由啦',
        link: 'https://docs.rsshub.app',
        description: isEnglish ? 'Everything is RSSible' : '万物皆可 RSS',
        language: isEnglish ? 'en-us' : 'zh-cn',
        item: list.map(({ page, item, type }) => {
            const $ = load(page);
            item = $(item);
            const h2Title = item.prevAll('h2').eq(0);
            const h3Title = item.prevAll('h3').eq(0);
            return {
                title: `${h2Title.text().trim()} - ${h3Title.text().trim()}`,
                description: item.html(),
                link: `https://docs.rsshub.app/${lang}routes/${type}#${encodeURIComponent(h2Title.find('.hash-link').attr('href') && h3Title.find('.hash-link').attr('href')?.substring(1))}`,
                guid: item.attr('id'),
            };
        }),
    });
};
