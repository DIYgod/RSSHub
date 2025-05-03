import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { config } from '@/config';
import { load } from 'cheerio';

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
    },
    radar: [
        {
            source: ['hanime1.me/previews/:date', 'hanime1.me/previews'],
            target: '/previews/:date',
        },
    ],
    handler: async (ctx) => {
        const baseUrl = 'https://hanime1.me';
        let { date } = ctx.req.param();
        if (!date) {
            // 默认使用当前日期
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
                // 中文标题
                const title = row.find('.preview-info-content h4').first().text().trim();

                // 预览图
                const previewImageSrc = row.find('.preview-info-cover img').attr('src') || '';

                // 发布时间 MMDD
                const rawDate = row.find('.preview-info-cover div').text().trim();
                // 视频 选中模态框全局查找
                const modalSelector = row.find('.trailer-modal-trigger').attr('data-target') || '';
                const previewVideoLink = modalSelector ? $(`${modalSelector} video source`).attr('src') || '' : '';

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
                    <video controls width="100%" poster="${previewImageSrc}">
                        <source src="${previewVideoLink}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                    `,
                    enclosure_url: previewImageSrc,
                    enclosure_type: 'image/jpeg',
                    link: previewVideoLink,
                    guid: `hanime1-${rawDate}-${title}`, // 上映时间和标题
                };
            });

        return {
            title: `Hanime1 ${date} 新番`,
            link,
            item: items,
        };
    },
};
