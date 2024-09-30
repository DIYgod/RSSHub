import { Route } from '@/types';
import got from '@/utils/got';
import { Context } from 'hono';

export const route: Route = {
    path: '/version/:versionType?/:linkType?',
    categories: ['game'],
    example: '/minecraft/version',
    parameters: {
        versionType: `Game version type, \`all\` by default`,
        linkType: `Link added to feed, \`official\` by default`,
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
| 正式版                     | release     |
| 快照                       | snapshot    |
| Alpha 及更早的版本         | old_alpha  |
| Beta 版                    | old_beta   |
| Target                     | linkType    |
| -------------------------- | --------    |
| minecraft.net              | official    |
| 英文 Minecraft Wiki 版本页 | enwiki      |
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

const typeName = {
    release: '正式版',
    snapshot: '快照',
    old_alpha: 'Alpha及更早的版本',
    old_beta: 'Beta版',
};

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
    const linker = linkFormatter[linkType] ?? linkFormatter.official;

    if (versionType !== 'all') {
        data = data.filter((item) => item.type === versionType);
    }

    const title = `Minecraft Java版${versionType === 'all' ? '' : (typeName[versionType] ?? versionType)}游戏更新`;

    return {
        title,
        link: `https://www.minecraft.net/`,
        description: title,
        item: data.map((item) => ({
            title: `${item.id} ${typeName[item.type] || ''}更新`,
            description: `${item.id} ${typeName[item.type] || ''}更新`,
            pubDate: new Date(item.releaseTime).toUTCString(),
            link: linker(item),
            guid: item.id + item.type,
        })),
    };
}
