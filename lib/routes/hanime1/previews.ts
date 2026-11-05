import { load } from 'cheerio';
import { escape } from 'entities';

import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/previews/:date?',
    name: '每月新番',
    maintainers: ['kjasn'],
    example: '/hanime1/previews/202504',
    categories: ['anime'],
    parameters: { date: { description: '日期格式为 `YYYYMM`，默认值当月' } },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['hanime1.me/previews/:date', 'hanime1.me/previews'],
            target: '/previews/:date?',
        },
    ],
    handler: async (ctx) => {
        const baseUrl = 'https://hanime1.me';
        let { date } = ctx.req.param();
        if (!date) {
            // Use the current calendar month by default.
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            date = `${year}${month >= 10 ? month : '0' + month}`;
        }

        const link = `${baseUrl}/previews/${date}`;

        const response = await ofetch(link, {
            headers: {
                referer: baseUrl,
                'user-agent': config.trueUA,
            },
        });

        const $ = load(response);

        const items = $('.content-padding .row')
            .toArray()
            .map((el) => {
                const row = $(el);
                // Chinese title.
                const title = row.find('.preview-info-content h4').first().text();

                // Preview image.
                const previewImageSrc = row.find('.preview-info-cover img').attr('src') || '';

                // Release calendar day (month and day).
                const rawDate = row.find('.preview-info-cover div').text().trim();
                const releaseDate = /(\d{1,2})月(\d{1,2})日/.exec(rawDate);
                const period = /^(\d{4})(\d{2})$/.exec(date);
                const releaseCalendar = period && releaseDate && Number(period[2]) === Number(releaseDate[1]) ? `${period[1]}-${releaseDate[1].padStart(2, '0')}-${releaseDate[2].padStart(2, '0')}` : undefined;
                const parsedDate = releaseCalendar ? parseDate(`${releaseCalendar}T00:00:00Z`) : undefined;
                const pubDate = parsedDate && Number.isFinite(parsedDate.getTime()) && parsedDate.toISOString().startsWith(releaseCalendar!) ? parsedDate : undefined;
                // Find the video in the selected trailer modal.
                const modalSelector = row.find('.trailer-modal-trigger').attr('data-target') || '';
                const previewVideoLink = modalSelector ? $(`${modalSelector} video source`).attr('src') || '' : '';

                // Synopsis.
                const description = row.find('.caption').first().text().trim();

                // Tags.
                const tags = row
                    .find('.single-video-tag a')
                    .toArray()
                    .map((tag) => $(tag).text().trim());

                return {
                    title,
                    description: `
                    <p>${escape(description)} </p>
                    ${previewVideoLink ? `<video controls width="100%" poster="${previewImageSrc}"><source src="${previewVideoLink}" type="video/mp4"></video>` : `<img src="${previewImageSrc}">`}
                    `,
                    pubDate,
                    category: tags,
                    enclosure_url: previewVideoLink || undefined,
                    enclosure_type: previewVideoLink ? 'video/mp4' : undefined,
                    link: modalSelector ? `${link}${modalSelector}` : undefined,
                    guid: `hanime1-${date}-${rawDate}-${title}`, // Release day and title.
                };
            });

        return {
            title: `Hanime1 ${date} 新番`,
            link,
            item: items,
        };
    },
};
