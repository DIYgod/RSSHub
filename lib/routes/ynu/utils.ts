import { load } from 'cheerio';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const processPages = ({ list, host, department }: { list: Array<{ path: string; title: string; author: string }>; host: string; department: string }) =>
    Promise.all(
        list.map(({ path, title, author }) => {
            const link = path.includes('http://') ? path : host + path;
            return cache.tryGet(link, async () => {
                const response = await ofetch(link);
                const $ = load(response);

                let dateString = '';
                switch (department) {
                    case 'grs':
                        dateString = $('#times').text().slice(5);
                        break;
                    case 'home':
                        dateString = $('.conttime span').text().slice(5);
                        break;
                    case 'jwc':
                        dateString = $('.taitshj').text().slice(5, 15);
                    // No default
                }

                let description = $('.v_news_content').html()?.trim();
                if (department === 'jwc' && $('#vsb_content').siblings().has('ul li').length > 0) {
                    const attachment = $('#vsb_content').siblings('ul').html()!.trim();
                    description += '\n' + attachment;
                }

                return {
                    pubDate: timezone(parseDate(dateString), 8),
                    author,
                    link,
                    title,
                    description,
                };
            });
        })
    );
