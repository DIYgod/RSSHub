import { load } from 'cheerio';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://av.jpn.support.panasonic.com/support/global/cs/dsc/download/';
// shortcut: lists expose only the latest version; parse model histories if complete release history is needed.
const sources = [
    ['index4.html', 'Full-frame'],
    ['index.html', 'Micro Four Thirds'],
    ['index2.html', 'Compact'],
    ['index5.html', 'Lens'],
] as const;

export const route: Route = {
    path: '/firmware',
    name: 'Camera and lens firmware',
    categories: ['program-update'],
    example: '/panasonic/firmware',
    maintainers: ['fdkevin0'],
    features: {
        supportRadar: true,
    },
    radar: [
        {
            source: [
                'av.jpn.support.panasonic.com/support/global/cs/dsc/download/top.html',
                'av.jpn.support.panasonic.com/support/global/cs/dsc/download/index4.html',
                'av.jpn.support.panasonic.com/support/global/cs/dsc/download/index.html',
                'av.jpn.support.panasonic.com/support/global/cs/dsc/download/index2.html',
                'av.jpn.support.panasonic.com/support/global/cs/dsc/download/index5.html',
            ],
            target: '/firmware',
        },
    ],
    description:
        'Latest listed firmware for camera bodies and interchangeable lenses, including LEICA DG. Historical releases and camera software updates are excluded. Use common parameters to filter models, for example `?filter_title=^DC-S5M2%20`, or lenses with `?filter_title=^(S-|H-)`. Intermediate releases can be missed if a newer version replaces them between polls.',
    handler,
};

async function fetchItems(filename: string, category: string) {
    const url = new URL(filename, baseUrl).href;
    const html = await ofetch(url);
    const $ = load(html);
    const windows = new Map(
        $('script:not([src])')
            .text()
            .matchAll(/function\s+(OpenWinS?\d+)\s*\(\)\s*\{\s*\w+\s*=\s*window\.open\(["']([^"']+)["']/g)
            .map(([, name, path]) => [name, path] as const)
    );
    const items = $('table[id="tb_bdl007"] tr')
        .toArray()
        .map((row) => {
            const cells = $(row).children('td');
            const fields = cells.slice(-4);
            const model = fields.eq(0).text();
            const download = fields.eq(3).find('a');
            if (!/^(?:DC-|DMC-|S-|H-)/.test(model) || download.text().startsWith('Software update')) {
                return;
            }

            const version = /^Ver\.?\s*(\d+(?:\.\d+)*)$/.exec(fields.eq(1).text())?.[1];
            if (!version) {
                throw new Error(`Invalid firmware version for ${model} on ${url}`);
            }
            const date = fields.eq(2).text().replaceAll(/[.,]/g, ' ').trim().replaceAll(/\s+/g, ' ');
            const pubDate = timezone(parseDate(date, 'MMM D YYYY', 'en', true), 0);
            if (Number.isNaN(pubDate.getTime())) {
                throw new TypeError(`Invalid firmware date for ${model} on ${url}`);
            }

            const href = download.attr('href');
            const popup = /\b(OpenWinS?\d+)\(\)/.exec(`${href ?? ''} ${download.attr('onclick') ?? ''}`)?.[1];
            const target = popup ? windows.get(popup) : href;
            if (!target) {
                throw new Error(`Missing firmware download link for ${model} on ${url}`);
            }
            const link = new URL(target, url).href;
            if (!link.startsWith(baseUrl)) {
                throw new Error(`Unexpected firmware download link for ${model}: ${link}`);
            }

            const isLens = /^(?:S-|H-)/.test(model);
            const name = isLens ? cells.eq(-5).text().replaceAll(/\s+/g, ' ') : '';
            return {
                title: `${model}${name ? ` ${name}` : ''} Firmware Ver.${version}`,
                // RSS3 uses links as IDs, and some models share a download page.
                link: `${link}#${encodeURIComponent(model)}`,
                guid: `${link}:${model}:${version}`,
                pubDate,
                category: isLens ? ['Lens', model.startsWith('S-') ? 'L-mount' : 'Micro Four Thirds'] : ['Camera body', category],
            };
        })
        .filter((item) => item !== undefined);
    if (items.length === 0) {
        throw new Error(`No Panasonic firmware entries found on ${url}`);
    }
    return items;
}

async function handler(): Promise<Data> {
    const items = (await Promise.all(sources.map(([filename, category]) => fetchItems(filename, category)))).flat();
    return {
        title: 'Panasonic camera and lens firmware',
        link: new URL('top.html', baseUrl).href,
        language: 'en',
        item: items,
    };
}
