// @ts-nocheck
import cache from '@/utils/cache';
import parser from '@/utils/rss-parser';
import got from '@/utils/got';
import { load } from 'cheerio';

const getArticleDetail = (link) =>
    cache.tryGet(link, async () => {
        const response = await got(link);
        const $ = load(response.data);

        const categories = $('.slug').text().trim();

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

        // primaryaudio is not in `.storytext`, prepend to it
        const primaryaudio = $('#primaryaudio');
        const audio = primaryaudio.length > 0 ? $('#primaryaudio').html() : '';

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

export default async (ctx) => {
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

    ctx.set('data', {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        icon: 'https://media.npr.org/images/podcasts/primary/npr_generic_image_300.jpg?s=200',
        item: items,
    });
};
