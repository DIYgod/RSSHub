import { config } from '@/config';
import cache from '@/utils/cache';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { load } from 'cheerio';
import { baseUrl } from '.';

export async function fetchArticles(data) {
    return await Promise.all(
        data.map(({ id, subject, author, publish_time }) => {
            const link = `${baseUrl}/${id}`;

            return cache.tryGet(link, async () => {
                const cookie = config.infzm.cookie;
                const response = await got.get<string>({
                    method: 'get',
                    url: link,
                    headers: {
                        Referer: link,
                        Cookie: cookie || `passport_session=${Math.floor(Math.random() * 100)};`,
                    },
                });
                const $ = load(response.data);
                return {
                    title: subject,
                    description: $('div.nfzm-content__content').html() ?? '',
                    pubDate: timezone(publish_time, +8).toUTCString(),
                    link,
                    author,
                };
            });
        })
    );
}
