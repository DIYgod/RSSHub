import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { config } from '@/config';
import { load } from 'cheerio';

export const route: Route = {
    path: '/previews/:date',
    name: '新番预告',
    maintainers: ['kjasn'],
    example: '/hanime1/previews/202504',
    categories: ['anime'],
    parameters: { date: { description: 'Date in YYYYMM format' } },
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
            source: ['hanime1.me/previews/:date'],
            target: '/previews/:date',
        },
    ],
    handler: async (ctx) => {
        const baseUrl = 'https://hanime1.me';
        const { date } = ctx.req.param();
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
                // 中文标题
                const title = row.find('.preview-info-content h4').first().text().trim();

                // 预览图
                const previewImageSrc = row.find('.preview-info-cover img').attr('src') || '';

                // 发布时间 MMDD
                const rawDate = row.find('.preview-info-cover div').text().trim();
                // 链接
                const modalSelector = row.find('.trailer-modal-trigger').attr('data-target') || '';
                const previewVideoLink = modalSelector ? $(modalSelector).find('video source').attr('src') || '' : '';

                // 简介
                const description = row.find('.caption').first().text().trim();

                // 标签
                const tags = row
                    .find('.single-video-tag a')
                    .toArray()
                    .map((tag) => $(tag).text().trim());

                return {
                    title,
                    description: `
                    <p>${description} </p>
                    <p>Tags: [${tags.join(', ')}]</p>
                    `,
                    // image: previewImageSrc,
                    enclosure_url: previewImageSrc,
                    enclosure_type: 'image/jpeg',
                    link: previewVideoLink,
                    guid: `hanime1-${rawDate}-${title}`, // 上映时间和标题
                };
            });

        return {
            title: `Hanime1 ${date}新番预告`,
            link,
            item: items,
        };
    },
};
