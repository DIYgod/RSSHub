import { Route, ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';

export const route: Route = {
    path: '/routes/:lang?',
    categories: ['program-update', 'popular'],
    view: ViewType.Notifications,
    example: '/rsshub/routes/en',
    parameters: {
        lang: {
            description: 'Language',
            options: [
                {
                    label: 'Chinese',
                    value: 'zh',
                },
                {
                    label: 'English',
                    value: 'en',
                },
            ],
            default: 'en',
        },
    },
    radar: [
        {
            source: ['docs.rsshub.app/*'],
            target: '/routes',
        },
    ],
    name: 'New routes',
    maintainers: ['DIYgod'],
    handler,
    url: 'docs.rsshub.app/*',
};

async function handler(ctx) {
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
            const response = await ofetch(`https://docs.rsshub.app/${lang}routes/${type}`);

            const $ = cheerio.load(response);
            const page = $('.page').toArray();
            const item = $('.routeBlock').toArray();
            return { page, item, type };
        })
    );
    const list = all.flatMap(({ page, item, type }) => item.map((item) => ({ page, item, type })));

    return {
        title: isEnglish ? 'RSSHub has new routes' : 'RSSHub 有新路由啦',
        link: 'https://docs.rsshub.app',
        description: isEnglish ? 'Everything is RSSible' : '万物皆可 RSS',
        language: isEnglish ? 'en-us' : 'zh-cn',
        item: list.map(({ page, item, type }) => {
            const $ = cheerio.load(page);
            const $item = $(item);
            const h2Title = $item.prevAll('h2').eq(0);
            const h3Title = $item.prevAll('h3').eq(0);

            $item.find('.VPBadge').each((_, ele) => {
                const $ele = $(ele);
                if ($ele.text().includes('Test')) {
                    $ele.remove();
                }
            });

            return {
                title: `${h2Title.text().trim()} - ${h3Title.text().trim()}`,
                description: $item.html()?.replaceAll(/<!--.*?-->/g, ''),
                link: `https://docs.rsshub.app/${lang}routes/${type}#${encodeURIComponent(h2Title.find('.header-anchor').attr('href') && h3Title.find('.header-anchor').attr('href')?.substring(1))}`,
                guid: $item.attr('id'),
            };
        }),
    };
}
