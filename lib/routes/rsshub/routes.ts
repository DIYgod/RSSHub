import markdownit from 'markdown-it';

import type { NamespacesType } from '@/registry';
import type { Language, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const md = markdownit({
    breaks: true,
    html: true,
});

// The docs' routes.json, where build-docs adds when each route's file was first committed
type DocsNamespacesType = Record<string, NamespacesType[string] & { routes: Record<string, { addedAt?: string }> }>;

type RouteItem = { guid: string; pubDate?: Date };

// Newest first, so a reader that keeps only its latest items keeps the new routes, then by path so that routes added
// in one commit keep their order between builds. Undated routes follow in the order of routes.json, which leaves the
// feed as it was while routes.json carries no dates.
const byNewest = (a: RouteItem, b: RouteItem) => {
    if (a.pubDate && b.pubDate) {
        return b.pubDate.getTime() - a.pubDate.getTime() || a.guid.localeCompare(b.guid);
    }
    return Number(!a.pubDate) - Number(!b.pubDate);
};

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
    const language: Language = isEnglish ? 'en-us' : 'zh-CN';

    const data = await ofetch<DocsNamespacesType>('https://docs.rsshub.app/routes.json');

    const items = Object.entries(data)
        .flatMap(([namespace, namespaceData]) =>
            Object.entries(namespaceData.routes).map(([routePath, routeData]) => ({
                title: `${namespaceData.name} - ${routeData.name}`,
                description: routeData.description ? md.render(routeData.description) : '',
                link: `https://docs.rsshub.app/${isEnglish ? '' : 'zh/'}routes/${namespace}`,
                category: routeData.categories,
                guid: routePath.replace(/\/$/, ''),
                author: routeData.maintainers.join(', '),
                pubDate: routeData.addedAt ? parseDate(routeData.addedAt) : undefined,
            }))
        )
        .toSorted(byNewest);

    return {
        title: isEnglish ? 'RSSHub has new routes' : 'RSSHub 有新路由啦',
        link: 'https://docs.rsshub.app',
        description: isEnglish ? 'Everything is RSSible' : '万物皆可 RSS',
        language,
        item: items,
    };
}
