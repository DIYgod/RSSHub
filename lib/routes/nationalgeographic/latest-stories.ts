import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

const findNatgeo = ($) =>
    JSON.parse(
        $('script')
            .text()
            .match(/\['__natgeo__']=({.*?});/)[1]
    );

export const route: Route = {
    path: '/latest-stories',
    categories: ['travel'],
    example: '/nationalgeographic/latest-stories',
    parameters: {},
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
            source: ['www.nationalgeographic.com/pages/topic/latest-stories'],
        },
    ],
    name: 'Latest Stories',
    maintainers: ['miles170'],
    handler,
    url: 'www.nationalgeographic.com/pages/topic/latest-stories',
};

async function handler() {
    const currentUrl = 'https://www.nationalgeographic.com/pages/topic/latest-stories';
    const response = await got(currentUrl);
    const $ = load(response.data);
    const items = await Promise.all(
        findNatgeo($)
            .page.content.hub.frms.flatMap((e) => e.mods)
            .flatMap((m) => m.tiles?.filter((t) => t.ctas[0]?.text === 'natgeo.ctaText.read'))
            .filter(Boolean)
            .map((i) => ({
                title: i.title,
                link: i.ctas[0].url,
                category: i.tags.map((t) => t.name),
            }))
            .map((item) =>
                cache.tryGet(item.link, async () => {
                    const response = await got(item.link);
                    const $ = load(response.data);
                    const mods = findNatgeo($).page.content.article.frms.find((f) => f.cmsType === 'ArticleBodyFrame').mods;
                    const bodyTile = mods.find((m) => m.edgs[0].cmsType === 'ArticleBodyTile').edgs[0];

                    item.author = bodyTile.cntrbGrp
                        .flatMap((c) => c.contributors)
                        .map((c) => c.displayName)
                        .join(', ');
                    item.description = art(path.join(__dirname, 'templates/stories.art'), {
                        ldMda: bodyTile.ldMda,
                        description: bodyTile.dscrptn,
                        body: bodyTile.bdy,
                    });
                    item.pubDate = parseDate(bodyTile.pbDt);

                    return item;
                })
            )
    );

    return {
        title: $('meta[property="og:title"]').attr('content'),
        link: currentUrl,
        item: items.filter((item) => item !== null),
    };
}
