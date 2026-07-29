import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

const bakeTimestamp = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

export const route: Route = {
    path: '/:channel?',
    categories: ['multimedia'],
    example: '/transcriptforest/all-the-hacks',
    parameters: {
        channel: 'Channel, see below, all by default',
    },
    features: {
        supportPodcast: true,
    },
    radar: [
        {
            source: ['www.transcriptforest.com/en/channel'],
            target: '',
        },
    ],
    name: 'Channel',
    maintainers: ['nczitzk'],
    handler,
    url: 'www.transcriptforest.com/en/channel',
    description: `| Channel                                                                                                                                        | ID                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| [All](https://www.transcriptforest.com/en)                                                                                                     |                                                                                                                                        |
| [a16z podcast](https://www.transcriptforest.com/en/channel/a16z-podcast)                                                                       | [a16z-podcast](https://rsshub.app/transcriptforest/a16z-podcast)                                                                       |
| [Aarthi and Sriram's Good Time Show](https://www.transcriptforest.com/en/channel/aarthi-and-srirams-good-time-show)                            | [aarthi-and-srirams-good-time-show](https://rsshub.app/transcriptforest/aarthi-and-srirams-good-time-show)                             |
| [Acquired](https://www.transcriptforest.com/en/channel/acquired)                                                                               | [acquired](https://rsshub.app/transcriptforest/acquired)                                                                               |
| [All-In with Chamath, Jason, Sacks & Friedberg](https://www.transcriptforest.com/en/channel/all-in-with-chamath-jason-sacks-friedberg)         | [all-in-with-chamath-jason-sacks-friedberg](https://rsshub.app/transcriptforest/all-in-with-chamath-jason-sacks-friedberg)             |
| [All the Hacks](https://www.transcriptforest.com/en/channel/all-the-hacks)                                                                     | [all-the-hacks](https://rsshub.app/transcriptforest/all-the-hacks)                                                                     |
| [Breaking Points](https://www.transcriptforest.com/en/channel/breaking-points)                                                                 | [breaking-points](https://rsshub.app/transcriptforest/breaking-points)                                                                 |
| [Cartoon Avatars](https://www.transcriptforest.com/en/channel/cartoon-avatars)                                                                 | [cartoon-avatars](https://rsshub.app/transcriptforest/cartoon-avatars)                                                                 |
| [Conversations With Coleman](https://www.transcriptforest.com/en/channel/conversations-with-coleman)                                           | [conversations-with-coleman](https://rsshub.app/transcriptforest/conversations-with-coleman)                                           |
| [CSPI Podcast](https://www.transcriptforest.com/en/channel/cspi-podcast)                                                                       | [cspi-podcast](https://rsshub.app/transcriptforest/cspi-podcast)                                                                       |
| [Culpable](https://www.transcriptforest.com/en/channel/culpable)                                                                               | [culpable](https://rsshub.app/transcriptforest/culpable)                                                                               |
| [Dateline NBC](https://www.transcriptforest.com/en/channel/dateline-nbc)                                                                       | [dateline-nbc](https://rsshub.app/transcriptforest/dateline-nbc)                                                                       |
| [Execs](https://www.transcriptforest.com/en/channel/execs)                                                                                     | [execs](https://rsshub.app/transcriptforest/execs)                                                                                     |
| [Exponent](https://www.transcriptforest.com/en/channel/exponent)                                                                               | [exponent](https://rsshub.app/transcriptforest/exponent)                                                                               |
| [Freakonomics](https://www.transcriptforest.com/en/channel/freakonomics)                                                                       | [freakonomics](https://rsshub.app/transcriptforest/freakonomics)                                                                       |
| [Future of StoryTelling](https://www.transcriptforest.com/en/channel/future-of-storytelling)                                                   | [future-of-storytelling](https://rsshub.app/transcriptforest/future-of-storytelling)                                                   |
| [Gamecraft](https://www.transcriptforest.com/en/channel/gamecraft)                                                                             | [gamecraft](https://rsshub.app/transcriptforest/gamecraft)                                                                             |
| [Get WIRED](https://www.transcriptforest.com/en/channel/get-wired)                                                                             | [get-wired](https://rsshub.app/transcriptforest/get-wired)                                                                             |
| [Greymatter](https://www.transcriptforest.com/en/channel/greymatter)                                                                           | [greymatter](https://rsshub.app/transcriptforest/greymatter)                                                                           |
| [How I built this](https://www.transcriptforest.com/en/channel/how-I-built-this)                                                               | [how-I-built-this](https://rsshub.app/transcriptforest/how-I-built-this)                                                               |
| [Huberman Lab](https://www.transcriptforest.com/en/channel/huberman-lab)                                                                       | [huberman-lab](https://rsshub.app/transcriptforest/huberman-lab)                                                                       |
| [ICYMI](https://www.transcriptforest.com/en/channel/icymi)                                                                                     | [icymi](https://rsshub.app/transcriptforest/icymi)                                                                                     |
| [In Machines We Trust](https://www.transcriptforest.com/en/channel/in-machines-we-trust)                                                       | [in-machines-we-trust](https://rsshub.app/transcriptforest/in-machines-we-trust)                                                       |
| [Invest Like the Best with Patrick O'Shaughnessy](https://www.transcriptforest.com/en/channel/invest-like-the-best-with-patrick-o-shaughnessy) | [invest-like-the-best-with-patrick-o-shaughnessy](https://rsshub.app/transcriptforest/invest-like-the-best-with-patrick-o-shaughnessy) |
| [Joe Rogan Experience Review podcast](https://www.transcriptforest.com/en/channel/joe-rogan-experience-review-podcast)                         | [joe-rogan-experience-review-podcast](https://rsshub.app/transcriptforest/joe-rogan-experience-review-podcast)                         |
| [Land of Giants](https://www.transcriptforest.com/en/channel/land-of-giants)                                                                   | [land-of-giants](https://rsshub.app/transcriptforest/land-of-giants)                                                                   |
| [Lenny's Podcast: Product \\| Growth \\| Career](https://www.transcriptforest.com/en/channel/lenny-podcast-product-growth-career)                | [lenny-podcast-product-growth-career](https://rsshub.app/transcriptforest/lenny-podcast-product-growth-career)                         |
| [Lex Fridman Podcast](https://www.transcriptforest.com/en/channel/lex-fridman-podcast)                                                         | [lex-fridman-podcast](https://rsshub.app/transcriptforest/lex-fridman-podcast)                                                         |
| [Making Sense with Sam Harris](https://www.transcriptforest.com/en/channel/making-sense-with-sam-harris)                                       | [making-sense-with-sam-harris](https://rsshub.app/transcriptforest/making-sense-with-sam-harris)                                       |
| [Masters of Scale](https://www.transcriptforest.com/en/channel/masters-of-scale)                                                               | [masters-of-scale](https://rsshub.app/transcriptforest/masters-of-scale)                                                               |
| [Modern Wisdom](https://www.transcriptforest.com/en/channel/modern-wisdom)                                                                     | [modern-wisdom](https://rsshub.app/transcriptforest/modern-wisdom)                                                                     |
| [Moment of Zen](https://www.transcriptforest.com/en/channel/moment-of-zen)                                                                     | [moment-of-zen](https://rsshub.app/transcriptforest/moment-of-zen)                                                                     |
| [Morbid](https://www.transcriptforest.com/en/channel/morbid)                                                                                   | [morbid](https://rsshub.app/transcriptforest/morbid)                                                                                   |
| [My First Million](https://www.transcriptforest.com/en/channel/my-first-million)                                                               | [my-first-million](https://rsshub.app/transcriptforest/my-first-million)                                                               |
| [Naval](https://www.transcriptforest.com/en/channel/naval)                                                                                     | [naval](https://rsshub.app/transcriptforest/naval)                                                                                     |
| [Newcomer Podcast](https://www.transcriptforest.com/en/channel/newcomer-podcast)                                                               | [newcomer-podcast](https://rsshub.app/transcriptforest/newcomer-podcast)                                                               |
| [Not investment advice](https://www.transcriptforest.com/en/channel/not-investment-advice)                                                     | [not-investment-advice](https://rsshub.app/transcriptforest/not-investment-advice)                                                     |
| [Odd Lots](https://www.transcriptforest.com/en/channel/odd-lots)                                                                               | [odd-lots](https://rsshub.app/transcriptforest/odd-lots)                                                                               |
| [On with Kara Swisher](https://www.transcriptforest.com/en/channel/on-with-kara-swisher)                                                       | [on-with-kara-swisher](https://rsshub.app/transcriptforest/on-with-kara-swisher)                                                       |
| [Proof: A True Crime Podcast](https://www.transcriptforest.com/en/channel/proof-a-true-crime-podcast)                                          | [proof-a-true-crime-podcast](https://rsshub.app/transcriptforest/proof-a-true-crime-podcast)                                           |
| [Reply All](https://www.transcriptforest.com/en/channel/reply-all)                                                                             | [reply-all](https://rsshub.app/transcriptforest/reply-all)                                                                             |
| [Revisionist History](https://www.transcriptforest.com/en/channel/revisionist-history)                                                         | [revisionist-history](https://rsshub.app/transcriptforest/revisionist-history)                                                         |
| [Serial](https://www.transcriptforest.com/en/channel/serial-podcast)                                                                           | [serial-podcast](https://rsshub.app/transcriptforest/serial-podcast)                                                                   |
| [Slow Burn](https://www.transcriptforest.com/en/channel/slow-burn)                                                                             | [slow-burn](https://rsshub.app/transcriptforest/slow-burn)                                                                             |
| [StrictlyVC Download](https://www.transcriptforest.com/en/channel/strictlyvc-download)                                                         | [strictlyvc-download](https://rsshub.app/transcriptforest/strictlyvc-download)                                                         |
| [Stuff You Should Know:](https://www.transcriptforest.com/en/channel/stuff-you-should-know)                                                    | [stuff-you-should-know](https://rsshub.app/transcriptforest/stuff-you-should-know)                                                     |
| [Subversive w/Alex Kaschuta](https://www.transcriptforest.com/en/channel/subversive-w-alex-kaschuta)                                           | [subversive-w-alex-kaschuta](https://rsshub.app/transcriptforest/subversive-w-alex-kaschuta)                                           |
| [TED Radio Hour](https://www.transcriptforest.com/en/channel/ted-radio-hour)                                                                   | [ted-radio-hour](https://rsshub.app/transcriptforest/ted-radio-hour)                                                                   |
| [The Bootstrapped Founder](https://www.transcriptforest.com/en/channel/the-bootstrapped-founder)                                               | [the-bootstrapped-founder](https://rsshub.app/transcriptforest/the-bootstrapped-founder)                                               |
| [The Boyscast with Ryan Long](https://www.transcriptforest.com/en/channel/the-boyscast-with-ryan-long)                                         | [the-boyscast-with-ryan-long](https://rsshub.app/transcriptforest/the-boyscast-with-ryan-long)                                         |`,
};

async function handler(ctx) {
    const channel = ctx.req.param('channel');
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 10;

    const rootUrl = 'https://www.transcriptforest.com';

    const { data: firstResponse } = await got(rootUrl);

    const data = JSON.parse(firstResponse.match(/(\{"props".*"scriptLoader":\[\]\})<\/script>/)?.[1]);

    const buildId = data.buildId;
    const defaultLocale = data.defaultLocale;
    const channels = data.props.pageProps.listChannel;
    const selected = channel ? channels.find((c) => c.channel_id === channel || c.channel_name === channel) : undefined;

    const apiUrl = new URL(`_next/data/${buildId}/en${selected ? `/channel/${selected.channel_id}` : ''}.json`, rootUrl).href;
    const currentUrl = new URL(selected ? `${defaultLocale}/channel/${selected.channel_id}` : '', rootUrl).href;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            channelName: selected ? selected.channel_id : '',
            offset: 0,
        },
    });

    let items = response.pageProps.listEpisode.data.slice(0, limit).map((item) => ({
        title: item.episode_name,
        link: new URL(`${defaultLocale}/${item.channel_id}/${item.episode_id}`, rootUrl).href,
        detailUrl: new URL(`_next/data/${buildId}/${defaultLocale}/${item.channel_id}/${item.episode_id}.json`, rootUrl).href,
        description: renderDescription({
            texts: item.episode_description.split(/\n\n/).map((text) => ({
                text,
            })),
        }),
        author: item.channel_name,
        guid: item.id,
        pubDate: parseDate(item.published_at),
        updated: parseDate(item.updated_at),
        itunes_item_image: item.episode_cover.split(/\?/, 1)[0],
        itunes_duration: item.episode_duration,
        enclosure_url: item.source_media,
        enclosure_type: 'audio/mpeg',
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.detailUrl);
                const { data: textResponse } = await got(detailResponse.pageProps.currentEpisode.ps4_url);

                item.description =
                    renderDescription({
                        audios: [
                            {
                                src: detailResponse.pageProps.currentEpisode.media,
                                type: 'audio/mpeg',
                            },
                        ],
                    }) +
                    item.description +
                    renderDescription({
                        texts: textResponse.map((t) => ({
                            startTime: bakeTimestamp(t.startTime),
                            endTime: bakeTimestamp(t.endTime),
                            text: t.readOnlyText,
                        })),
                    });

                delete item.detailUrl;

                return item;
            })
        )
    );

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const title = $('title').text();
    const image = $('meta[property="og:image"]').prop('content');
    const icon = new URL($('link[rel="apple-touch-icon"]').prop('href'), rootUrl).href;
    const author = title.split(/\|/, 1)[0].trim();

    return {
        item: items,
        title,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: $('html').prop('lang'),
        image,
        icon,
        logo: icon,
        author,
        itunes_author: author,
        allowEmpty: true,
    };
}
