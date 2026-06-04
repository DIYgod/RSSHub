import markdownit from 'markdown-it';

import type { NamespacesType } from '@/registry';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';

const md = markdownit({
    breaks: true,
    html: true,
});

export const route: Route = {
    path: '/routes/:lang?',
    categories: ['program-update'],
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

    const data = await ofetch<NamespacesType>('https://docs.rsshub.app/routes.json');

    const items = Object.entries(data).flatMap(([namespace, namespaceData]) =>
        Object.entries(namespaceData.routes).map(([routePath, routeData]) => ({
            title: `${namespaceData.name} - ${routeData.name}`,
            description: routeData.description ? md.render(routeData.description) : '',
            link: `https://docs.rsshub.app/${isEnglish ? '' : 'zh/'}routes/${namespace}`,
            category: routeData.categories,
            guid: `/${namespace}${routePath === '/' ? '' : routePath}`,
            author: routeData.maintainers.join(', '),
        }))
    );

    return {
        title: isEnglish ? 'RSSHub has new routes' : 'RSSHub 有新路由啦',
        link: 'https://docs.rsshub.app',
        description: isEnglish ? 'Everything is RSSible' : '万物皆可 RSS',
        language: isEnglish ? 'en-us' : 'zh-cn',
        item: items,
    };
}
