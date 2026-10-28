import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

type LocalizedText = string | Record<string, string> | null;

const getLocalizedText = (value?: LocalizedText) => (typeof value === 'string' ? value : (value?.['zh-CN'] ?? value?.['en-US'] ?? (value ? Object.values(value)[0] : undefined)));

interface Addon {
    name: LocalizedText;
    summary: LocalizedText;
    description: LocalizedText;
    authors: Array<{ name: string }>;
    categories: string[];
}

interface AddonVersion {
    version: string;
    release_notes: LocalizedText;
    file: { created: string };
}

export const route: Route = {
    path: '/addons/:id',
    categories: ['program-update'],
    example: '/firefox/addons/rsshub-radar',
    parameters: { id: 'Add-ons id, can be found in add-ons url' },
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
            source: ['addons.mozilla.org/:lang/firefox/addon/:id/versions', 'addons.mozilla.org/:lang/firefox/addon/:id'],
        },
    ],
    name: 'Add-ons Update',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const apiUrl = `https://addons.mozilla.org/api/v5/addons/addon/${encodeURIComponent(id)}`;
    const [info, versions] = await Promise.all([ofetch<Addon>(`${apiUrl}/`, { query: { lang: 'zh-CN' } }), ofetch<{ results: AddonVersion[] }>(`${apiUrl}/versions/`, { query: { lang: 'zh-CN' } })]);
    const link = `https://addons.mozilla.org/zh-CN/firefox/addon/${encodeURIComponent(id)}/versions/`;

    return {
        title: `${getLocalizedText(info.name)} - Firefox Add-on`,
        description: getLocalizedText(info.summary) || getLocalizedText(info.description),
        link,
        item: versions.results.map((versionInfo) => {
            const version = 'v' + versionInfo.version;
            return {
                title: version,
                description: getLocalizedText(versionInfo.release_notes),
                link,
                pubDate: versionInfo.file.created ? parseDate(versionInfo.file.created) : undefined,
                guid: version,
                author: info.authors.map((author) => author.name).join(', '),
                category: info.categories,
            };
        }),
    };
}
