import { Route } from '@/types';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch'; // 统一使用的请求库
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';
dayjs.extend(duration);

export const route: Route = {
    path: '/explore/:type',
    categories: ['multimedia'],
    example: '/podwise/explore/latest',
    parameters: { type: 'latest or all episodes.' },
    radar: [
        {
            source: ['podwise.ai/explore/:type'],
        },
    ],
    name: 'Episodes',
    maintainers: ['lyling'],
    handler: async (ctx) => {
        const type = ctx.req.param('type');
        const link = `https://podwise.ai/explore/${type}`;
        const response = await ofetch(link);
        const $ = load(response);
        const content = $('#navigator').next();
        // header/[div => content]/footer, content>div(2)>h1
        const title = content.find('h1').first().text();
        const description = content.find('p').eq(1).text();

        const list = content
            .find('.group')
            .toArray()
            .map((item) => {
                item = $(item);
                const link = item.find('a').first().attr('href');
                const description = item.find('p').first().text();
                const pubDate = item.find('a').next().children('span').text();

                return {
                    link: `https://podwise.ai${link}`,
                    description,
                    pubDate: timezone(parseDate(pubDate, 'DD MMM YYYY', 'en'), 8),
                };
            });

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);

                    item.description = $('summary').first().html();

                    // duration
                    const $cover = $('img[alt="Podcast cover"]').eq(1);
                    const $duration = $cover.next().find('span').eq(2);

                    const nextData = JSON.parse(
                        $('script:contains("podName")')
                            .first()
                            .text()
                            .match(/self\.__next_f\.push\((.+)\)/)?.[1] ?? ''
                    );
                    const podcastData = JSON.parse(nextData[1].slice(2))[1][3].children[3].episode;

                    // rss feed
                    item.title = podcastData.title;
                    item.author = podcastData.podName;

                    // podcast feed
                    item.itunes_item_image = podcastData.cover;
                    item.itunes_duration = parseDuration($duration.text());
                    item.enclosure_url = podcastData.link;
                    // item.enclosure_length: nothing can convert to.
                    item.enclosure_type = toEnclosureType(podcastData.linkType);

                    return item;
                })
            )
        );

        return {
            title,
            description,
            link,
            item: items,
        };
    },
};

function parseDuration(durationStr) {
    const matches = durationStr.match(/(\d+h)?(\d+m)?/);
    const hours = matches[1] ? Number.parseInt(matches[1]) : 0;
    const minutes = matches[2] ? Number.parseInt(matches[2]) : 0;

    // 使用 dayjs 的 duration 创建持续时间对象
    return dayjs
        .duration({
            hours,
            minutes,
        })
        .asSeconds();
}

function toEnclosureType(linkType: string): string {
    switch (linkType) {
        case 'mp3':
            return 'audio/mpeg';
        case 'm4a':
            return 'audio/x-m4a';
        case 'mp4':
            return 'video/mp4';
        default:
            return linkType;
    }
}
