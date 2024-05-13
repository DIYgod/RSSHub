import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import markdownit from 'markdown-it';
import vm from 'vm';

interface Package {
    name: string;
    version: string;
    entrypoint: string;
    authors: Array<string>;
    license: string;
    description: string;
    repository: string;
    keywords: Array<string>;
    compiler: string;
    exclude: Array<string>;
    size: number;
    readme: string;
    updatedAt: number;
    releasedAt: number;
}

interface Context {
    an: { exports: Array<Package> };
}

export const route: Route = {
    path: '/universe',
    categories: ['programming'],
    example: '/github/issue/vuejs/core/all/wontfix',
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
            source: ['typst.app/universe'],
            target: '/universe',
        },
    ],
    name: 'Universe',
    maintainers: ['HPDell'],
    handler: async () => {
        const targetUrl = 'https://typst.app/universe/search?kind=packages%2Ctemplates&packages=last-published';
        const page = await ofetch(targetUrl);
        const $ = load(page);
        const script = $('script')
            .toArray()
            .map((item) => item.attribs.src)
            .filter((item) => item !== undefined)
            .find((item) => item.startsWith('/scripts/universe-search'));
        const data: string = await ofetch(`https://typst.app${script}`, {
            parseResponse: (txt) => txt,
        });
        let packages = data.match(/(an.exports=[\S\s]+);var Ye/)?.[1];
        if (packages) {
            packages = packages.slice(0, -2);
            const context: Context = { an: { exports: [] } };
            vm.createContext(context);
            vm.runInContext(packages, context, {
                displayErrors: true,
            });
            const md = markdownit('commonmark');
            const items = context.an.exports
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .slice(0, 10)
                .map((item) => ({
                    title: `${item.name} | ${item.description}`,
                    link: `https://typst.app/universe/package/${item.name}`,
                    description: md.render(item.readme),
                    pubDate: new Date(item.updatedAt),
                }));
            return {
                title: 'Typst universe',
                link: targetUrl,
                item: items,
            };
        } else {
            return {
                title: 'Typst universe',
                link: targetUrl,
                item: [],
            };
        }
    },
};
