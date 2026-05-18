import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const url = 'https://news.qq.com/ch/finance/';
const api = 'https://i.news.qq.com/web_backend/v2/getTagInfo?tagId=bEerx71ajmI%3D';

const headers = {
    'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
    accept: 'application/json, text/plain, */*',
    referer: 'https://news.qq.com/ch/finance/',
    origin: 'https://news.qq.com',
};

export const route: Route = {
    path: '/finance',
    categories: ['new-media'],
    example: '/qq/finance',
    name: '财经',
    maintainers: ['JudeThu'],
    url,
    handler: async () => {
        const response = await got(api, {
            headers,
        });

        const data = response.data?.data;
        const tabs = data?.tabs ?? [];
        const articleList = tabs.flatMap((tab) => tab.articleList ?? []);

        if (!articleList.length) {
            throw new Error('QQ finance getTagInfo returned empty articleList');
        }

        const items = articleList
            .map((item) => {
                const link =
                    item?.link_info?.url ||
                    item?.link_info?.share_url ||
                    item?.link_info?.org_url;

                if (!item?.title || !link) {
                    return null;
                }

                const summary =
                    item?.long_summary ||
                    item?.desc ||
                    item?.news724_feature?.abstract ||
                    item?.share_info?.share_subtitle ||
                    item.title;

                const author =
                    item?.media_info?.chl_name ||
                    item?.media_info?.name ||
                    '';

                const image =
                    item?.pic_info?.share_img ||
                    item?.pic_info?.big_img?.[0] ||
                    item?.pic_info?.small_img?.[0] ||
                    '';

                const description = image
                    ? `<img src="${image}"><p>${summary}</p>`
                    : `<p>${summary}</p>`;

                return {
                    title: item.title,
                    link,
                    pubDate: item.publish_time ? parseDate(item.publish_time) : undefined,
                    description,
                    author,
                };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);

        return {
            title: `腾讯新闻 - ${data?.name || '财经'}`,
            link: url,
            item: items,
        };
    },
};