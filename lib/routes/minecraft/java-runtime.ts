import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/java-runtime/:arch?/:javaType?',
    categories: ['game'],
    example: '/minecraft/java-runtime',
    parameters: {
        arch: `Arch, \`all\` by default`,
        javaType: `Java runtime type, \`all\` by default`,
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
    name: 'Java Runtimes',
    maintainers: ['xtexChooser'],
    handler,
    url: 'minecraft.net/',
    description: `
arch:

- gamecore (Currently not used by Mojang)
- linux
- linux-i386
- mac-os
- mac-os-arm64
- windows-arm64
- windows-x64
- windows-x86

javaType:

- java-runtime-alpha
- java-runtime-beta
- java-runtime-delta
- java-runtime-gamma
- java-runtime-gamma-snapshot
- jre-legacy
- minecraft-java-exe (Only on Windows)
`,
    zh: {
        name: 'Java运行时',
    },
};

interface RuntimeInManifest {
    manifest: { url: string };
    version: { name: string; released: string };
}

function generateJava(arch: string, javaType: string, data: RuntimeInManifest): DataItem {
    return {
        title: `${arch} ${javaType} 更新了 ${data.version.name}`,
        description: `${arch} ${javaType} 更新了 ${data.version.name}`,
        pubDate: new Date(data.version.released).toUTCString(),
        link: data.manifest.url,
        guid: arch + javaType + data.version.name,
    };
}

function generateJavas(arch: string, javaType: string, data: RuntimeInManifest[]): DataItem[] {
    return data.map((item) => generateJava(arch, javaType, item));
}

function generateArch(arch: string, data: any, javaType: string): DataItem[] {
    let items: DataItem[] = [];

    if (javaType === 'all') {
        for (const k in data) {
            if (!(k in data)) {
                continue;
            }
            items = [...items, ...generateJavas(arch, k, data[k])];
        }
    } else {
        items = [...items, ...generateJavas(arch, javaType, data[javaType])];
    }
    return items;
}

async function handler(ctx: Context) {
    const url = 'https://launchermeta.mojang.com/v1/products/java-runtime/2ec0cc96c44e5a76b9c8b7c39df7210883d12871/all.json';

    const response: any = await got({
        method: 'get',
        url,
        responseType: 'json',
    });

    const data: any = response.data;

    const arch = ctx.req.param('arch') ?? 'all';
    const javaType = ctx.req.param('javaType') ?? 'all';

    let items: DataItem[] = [];

    if (arch === 'all') {
        for (const k in data) {
            if (!(k in data)) {
                continue;
            }
            items = [...items, ...generateArch(k, data[k], javaType)];
        }
    } else {
        items = [...items, ...generateArch(arch, data[arch], javaType)];
    }

    const title = 'Minecraft Java运行时';

    return {
        title,
        link: 'https://www.minecraft.net/',
        description: title,
        item: items,
    };
}
