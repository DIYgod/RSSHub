import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import parser from '@/utils/rss-parser';

const getArticleDetail = (link) =>
    cache.tryGet(link, async () => {
        const response = await got(link);
        const $ = load(response.data);

        // Prefer tags to slug
        let categories = $('.tag')
            .toArray()
            .map((el) => $(el).text().trim());

        if (categories.length < 1) {
            const slug = $('.slug a').contents().first().text().trim();

            if (slug) {
                categories = [slug];
            }
        }

        // ignore item until audio is available
        if ($('.audio-availability-message').length > 0) {
            return null;
        }

        // handle multiple audios
        for (const x of $('.audio-module').toArray()) {
            const audioLink = $($(x).find('.audio-tool-download a')).attr('href');
            const audio_tag = `<audio controls><source src="${audioLink}" type="audio/mp3"></audio>`;
            $(x).replaceWith(audio_tag);
        }

        // Prepend audio to the article if available
        const primaryaudio = $('#headlineaudio');
        const audio = primaryaudio.length > 0 ? $('#headlineaudio').html() + '<br>' : '';

        // replace video
        const regex = /\?storyId=(\d+)&amp;mediaId=(\d+)/;
        const m = $.html().match(regex);
        if (m) {
            const storyId = m[1];
            const mediaId = m[2];
            const video_tag = `<iframe width="740" height="416" src="https://www.npr.org/embedded-video?storyId=${storyId}&mediaId=${mediaId}&jwMediaType=music" frameborder="0" scrolling="no"></iframe>`;
            const nprVideo = $('.npr-video');
            if (nprVideo.length === 1) {
                nprVideo.replaceWith(video_tag);
            }
        }

        // Removes related articles and sponsor messages
        $('div.bucketwrap.internallink.insettwocolumn.inset2col').remove();
        $('aside.ad-wrap').remove();

        // remove duplicate caption and images
        $('.enlarge_measure').remove();
        $('.enlarge_html').remove();
        $('.hide-caption').remove();
        $('.toggle-caption').remove();
        $('.credit-caption b.credit').remove();
        $('.credit-caption span.credit').wrap('<figcaption></figcaption>');
        $('.caption > p').wrap('<figcaption></figcaption>');

        const article =
            audio +
            $('.storytext')
                .toArray()
                .map((el) => $(el).html())
                .join('');

        return { article, categories };
    });

export const route: Route = {
    path: '/:endpoint?',
    categories: ['traditional-media'],
    example: '/npr/1001',
    parameters: { endpoint: 'Channel ID, can be found in Official RSS URL, `1001` by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'News',
    maintainers: ['bennyyip'],
    handler,
    description: `Provide full article RSS for CBC topics.`,
};

async function handler(ctx) {
    const endpoint = ctx.req.param('endpoint') || '1001';
    const feed = await parser.parseURL(`https://feeds.npr.org/${endpoint}/rss.xml`);

    const items = (
        await Promise.all(
            feed.items.map(async (item) => {
                const itemDetails = await getArticleDetail(item.link);
                if (itemDetails === null) {
                    return null;
                }
                return {
                    ...item,
                    description: itemDetails.article,
                    category: itemDetails.categories,
                };
            })
        )
    ).filter(Boolean);

    return {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        icon: 'https://media.npr.org/images/podcasts/primary/npr_generic_image_300.jpg?s=200',
        item: items,
    };
}
