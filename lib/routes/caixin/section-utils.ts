import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { parseArticle } from './utils';

type CaixinSectionConfig = {
    path: string;
    name: string;
    source: string;
    subject: number;
    title: string;
};

export const createCaixinSectionRoute = ({ path, name, source, subject, title }: CaixinSectionConfig): Route => ({
    path,
    categories: ['traditional-media'],
    view: ViewType.Articles,
    example: `/caixin${path}`,
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: [source],
            target: path,
        },
    ],
    name,
    maintainers: ['maxlixiang'],
    url: source,
    handler: async (ctx) => {
        const url = `https://${source}`;
        const {
            data: { datas: data },
        } = await got('https://gateway.caixin.com/api/extapi/homeInterface.jsp', {
            searchParams: {
                subject,
                type: 0,
                count: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 25,
                picdim: '_266_177',
                start: 0,
            },
        });

        const list = data.map((item) => ({
            title: item.desc,
            description: item.summ,
            link: item.link.replace('http://', 'https://'),
            pubDate: timezone(parseDate(item.time), +8),
            category: item.keyword ? item.keyword.split(' ') : [],
            author: item.edit?.name,
            audio: item.audioUrl,
            audio_image_url: item.pict?.imgs?.[0]?.url,
        }));

        const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => parseArticle(item))));

        return {
            title,
            link: url,
            description: title,
            item: items,
        };
    },
});
