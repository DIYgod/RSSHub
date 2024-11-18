import { Route, ViewType } from '@/types';
import type { Context } from 'hono';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';

async function handler(ctx: Context) {
    const { pr } = ctx.req.param();
    const fullUrl = `https://nixpk.gs/pr-tracker.html?pr=${pr}`;
    const response = await ofetch(fullUrl);
    const $ = load(response);
    const rejected = $('ol').find('span.state-rejected').parent();
    if (rejected.length === 1) {
        return {
            title: rejected.text(),
            url: fullUrl,
            item: [
                {
                    title: rejected.text(),
                    link: rejected.find('a').attr('href'),
                },
            ],
        };
    }
    let landed = false;
    const item = $('ol')
        .find('span.state-accepted')
        .toArray()
        .map((x) => {
            const link = $(x).parent().find('a').first();
            if (link.text() === 'nixos-unstable') {
                landed = true;
            }
            return {
                title: link.text(),
                link: link.attr('href'),
            };
        });
    const title = $('ol').find('li').first();
    title.find('span').remove();
    return {
        title: `${landed ? '✅ ' : ''}nixpkgs ${title.text()}`,
        url: fullUrl,
        item,
    };
}

export const route: Route = {
    url: 'nixpk.gs',
    name: 'pr-tracker',
    description: 'pr-tracker pull request tracker for nixpkgs',
    path: '/pr-tracker/:pr',
    categories: ['programming'],
    example: '/nixpkgs/pr-tracker/332217',
    view: ViewType.Notifications,
    parameters: {
        pr: 'pr number',
    },
    radar: [
        {
            source: ['nixpk.gs/pr-tracker.html?pr=:pr'],
            target: '/pr-tracker/:pr',
        },
    ],
    features: {
        supportRadar: true,
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    maintainers: ['phanirithvij'],
    handler,
};
