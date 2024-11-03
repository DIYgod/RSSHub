import { Data, Route } from '@/types';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import { Context } from 'hono';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';

export const route: Route = {
    name: 'Packages',
    categories: ['program-update'],
    maintainers: ['CaoMeiYouRen'],
    path: '/pkgs/:name/:routeParams?',
    parameters: { name: 'Packages name', routeParams: 'Filters of packages type. E.g. branch=edge&repo=main&arch=armv7&maintainer=Jakub%20Jirutka' },
    example: '/alpinelinux/pkgs/nodejs',
    description: `Alpine Linux packages update`,
    handler,
    radar: [
        {
            source: ['https://pkgs.alpinelinux.org/packages'],
            target: (params, url) => {
                const searchParams = new URL(url).searchParams;
                const name = searchParams.get('name');
                searchParams.delete('name');
                const routeParams = searchParams.toString();
                return `/alpinelinux/pkgs/${name}/${routeParams}`;
            },
        },
    ],
    zh: {
        name: '软件包',
        description: 'Alpine Linux 软件包更新',
    },
};

type RowData = {
    package: string;
    packageUrl?: string;
    version: string;
    description?: string;
    project?: string;
    license: string;
    branch: string;
    repository: string;
    architecture: string;
    maintainer: string;
    buildDate: string;
};

function parseTableToJSON(tableHTML: string) {
    const $ = load(tableHTML);
    const data: RowData[] = $('tbody tr')
        .toArray()
        .map((row) => ({
            package: $(row).find('.package a').text().trim(),
            packageUrl: $(row).find('.package a').attr('href')?.trim(),
            description: $(row).find('.package a').attr('aria-label')?.trim(),
            version: $(row).find('.version').text().trim(),
            project: $(row).find('.url a').attr('href')?.trim(),
            license: $(row).find('.license').text().trim(),
            branch: $(row).find('.branch').text().trim(),
            repository: $(row).find('.repo a').text().trim(),
            architecture: $(row).find('.arch a').text().trim(),
            maintainer: $(row).find('.maintainer a').text().trim(),
            buildDate: $(row).find('.bdate').text().trim(),
        }));

    return data;
}

async function handler(ctx: Context): Promise<Data> {
    const { name, routeParams } = ctx.req.param();
    const query = new URLSearchParams(routeParams);
    query.append('name', name);
    const link = `https://pkgs.alpinelinux.org/packages?${query.toString()}`;
    const key = `alpinelinux:packages:${query.toString()}`;
    const rowData = (await cache.tryGet(
        key,
        async () => {
            const response = await got({
                url: link,
            });
            const html = response.data;
            return parseTableToJSON(html);
        },
        config.cache.routeExpire,
        false
    )) as RowData[];

    const items = rowData.map((e) => ({
        title: `${e.package}@${e.version}/${e.architecture}`,
        description: `Version: ${e.version}<br>Project: ${e.project}<br>Description: ${e.description}<br>License: ${e.license}<br>Branch: ${e.branch}<br>Repository: ${e.repository}<br>Maintainer: ${e.maintainer}<br>Build Date: ${e.buildDate}`,
        link: `https://pkgs.alpinelinux.org${e.packageUrl}`,
        guid: `https://pkgs.alpinelinux.org${e.packageUrl}#${e.version}`,
        author: e.maintainer,
        pubDate: parseDate(e.buildDate),
    }));
    return {
        title: `${name} - Alpine Linux packages`,
        link,
        description: 'Alpine Linux packages update',
        item: items,
    };
}
