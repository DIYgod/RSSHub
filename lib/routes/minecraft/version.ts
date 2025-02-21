import { Route } from '@/types';
import got from '@/utils/got';
import { Context } from 'hono';

export const route: Route = {
    path: '/version/:versionType?/:linkType?/:lang?',
    categories: ['game'],
    example: '/minecraft/version/all/official/en',
    parameters: {
        versionType: `Game version type, \`all\` by default`,
        linkType: `Link added to feed, \`official\` by default`,
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
            source: ['minecraft.net/'],
        },
    ],
    name: 'Java Game Update',
    maintainers: ['TheresaQWQ', 'xtexChooser'],
    handler,
    url: 'minecraft.net/',
    description: `
| Version                    | versionType |
| -------------------------- | ----------- |
| Release / 正式版                     | release     |
| Snapshot / 快照                       | snapshot    |
| Alpha and earlier/ 及更早的版本         | old_alpha  |
| Beta version / 版                    | old_beta   |
| Target                     | linkType    |
| -------------------------- | --------    |
| minecraft.net              | official    |
| English Minecraft Wiki version page | enwiki      |
| 中文 Minecraft Wiki 版本页 | zhwiki      |
`,
    zh: {
        name: 'Java版游戏更新',
    },
};

interface VersionInManifest {
    id: string;
    type: string;
    releaseTime: string;
}

const i18n = {
    en: {
        typeName: {
            release: ' Official version',
            snapshot: ' Snapshot',
            old_alpha: ' Alpha and earlier',
            old_beta: ' Beta version',
        },
        version: ' version ',
        title_ending: ' game update',
        update: ' update'
    },
    zh: {
        typeName: {
            release: '正式版',
            snapshot: '快照',
            old_alpha: 'Alpha及更早的版本',
            old_beta: 'Beta版',
        },
        version: '版',
        title_ending: '游戏更新',
        update: ' 更新'
    }
}

const linkFormatter: any = {
    official: () => `https://www.minecraft.net`,
    enwiki: (item: VersionInManifest) => {
        let id = item.id;
        if (item.type === 'old_beta' && id.startsWith('b')) {
            id = `Beta ${id.substring(1)}`;
        }
        if (item.type === 'old_alpha') {
            if (id.startsWith('a')) {
                id = `Alpha ${id.substring(1)}`;
            } else if (id.startsWith('c')) {
                id = `Classic ${id.substring(1)}`;
            } else if (id.startsWith('inf-')) {
                id = `Infdev`;
            } else if (id.startsWith('rd-')) {
                id = `pre-Classic ${id}`;
            }
        }
        return `https://minecraft.wiki/w/Java Edition ${id}`;
    },
    zhwiki: (item: VersionInManifest) => {
        let id = item.id;
        if (item.type === 'release') {
            id = `Java版${id}`;
        }
        if (item.type === 'old_beta' && id.startsWith('b')) {
            id = `Java版Beta ${id.substring(1)}`;
        }
        if (item.type === 'old_alpha') {
            if (id.startsWith('a')) {
                id = `Java版Alpha ${id.substring(1)}`;
            } else if (id.startsWith('c')) {
                id = `Java版Classic ${id.substring(1)}`;
            } else if (id.startsWith('inf-')) {
                id = `Java版Infdev`;
            } else if (id.startsWith('rd-')) {
                id = `Java版pre-Classic ${id}`;
            }
        }
        return `https://zh.minecraft.wiki/w/${id}`;
    },
};

async function handler(ctx?: Context) {
    const url = ctx?.req.query('mcmanifest') ?? 'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json';

    const response: any = await got({
        method: 'get',
        url,
        responseType: 'json',
    });

    let data: VersionInManifest[] = response.data.versions;

    const versionType = ctx?.req.param('versionType') ?? 'all';
    const linkType = ctx?.req.param('linkType') ?? 'official';
    const lang = ctx?.req.param('lang') ?? 'en';
    const linker = linkFormatter[linkType] ?? linkFormatter.official;

    if (versionType !== 'all') {
        data = data.filter((item) => item.type === versionType);
    }

    const title = (
        `Minecraft Java${i18n[lang].version}`
        `${versionType === 'all' ? '' : (i18n[lang].typeName[versionType] ?? versionType)}`
        `${i18n[lang].title_ending}`
    );

    return {
        title,
        link: `https://www.minecraft.net/`,
        description: title,
        item: data.map((item) => ({
            title: `${item.id} ${i18n[lang].typeName[item.type] || ''}${i18n[lang].update}`,
            description: `${item.id} ${i18n[lang].typeName[item.type] || ''}${i18n[lang].update}`,
            pubDate: new Date(item.releaseTime).toUTCString(),
            link: linker(item),
            guid: item.id + item.type,
        })),
    };
}
