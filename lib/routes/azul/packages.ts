import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl = 'https://www.azul.com';
    const apiBaseUrl = 'https://api.azul.com';
    const targetUrl: string = new URL('downloads', baseUrl).href;
    const apiUrl: string = new URL('metadata/v1/zulu/packages', apiBaseUrl).href;

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'en';

    const response = await ofetch(apiUrl, {
        query: {
            availability_types: 'ca',
            release_status: 'both',
            page_size: 1000,
            include_fields: 'java_package_features, release_status, support_term, os, arch, hw_bitness, abi, java_package_type, javafx_bundled, sha256_hash, cpu_gen, size, archive_type, certifications, lib_c_type, crac_supported',
            page: 1,
            azul_com: true,
        },
    });

    const items: DataItem[] = response.slice(0, limit).map((item): DataItem => {
        const javaVersion = `${item.java_version.join('.')}+${item.openjdk_build_number}`;
        const distroVersion: string = item.distro_version.join('.');

        const title = `[${javaVersion}] (${distroVersion}) ${item.name}`;
        const linkUrl: string | undefined = item.download_url;
        const categories: string[] = [item.os, item.arch, item.java_package_type, item.archive_type, item.abi, ...(item.javafx_bundled ? ['javafx'] : []), ...(item.crac_supported ? ['crac'] : [])];
        const guid = `azul-${item.name}`;

        let processedItem: DataItem = {
            title,
            link: linkUrl,
            category: categories,
            guid,
            id: guid,
            language,
        };

        const enclosureUrl: string | undefined = item.download_url;

        if (enclosureUrl) {
            const enclosureTitle: string = item.name;
            const enclosureLength: number = item.size;

            processedItem = {
                ...processedItem,
                enclosure_url: enclosureUrl,
                enclosure_title: enclosureTitle || title,
                enclosure_length: enclosureLength,
            };
        }

        return processedItem;
    });

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content'),
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/downloads',
    name: 'Downloads',
    url: 'www.azul.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/azul/downloads',
    parameters: undefined,
    description: undefined,
    categories: ['program-update'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.azul.com/downloads'],
            target: '/downloads',
        },
    ],
    view: ViewType.Notifications,
};
