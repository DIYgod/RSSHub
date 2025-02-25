import { Data, DataItem, Route } from '@/types';
import path from 'node:path';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import { config } from '@/config';
import { art } from '@/utils/render';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

const actualParametersDescTable = `
| Name              | Default  | Description                                                                                                                                                                                                                                          |
| ----------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \`includeMode\`     | All mode | Could be \`osu\`, \`mania\`, \`fruits\` or \`taiko\`. Specify included game mode of beatmaps. Including this paramseter multiple times to specify multiple game modes, e.g.: \`includeMode=osu&includeMode=mania\`. Subscribe to all game modes if not specified |
| \`difficultyLimit\` | None     | Lower/upper limit of star rating of the beatmaps in the beatmapset item, e.g.:\`difficultyLimit=U6\`. Checkout tips in descriptions for detailed explaination and examples.                                                                            |
| \`modeInTitle\`     | \`true\`   | \`true\` or \`false\` Add mode info into feed title.
`;

const descriptionDoc: string = `
Subscribe to the new beatmaps on https://osu.ppy.sh/beatmapsets.

#### Parameter Description

Parameters allows you to:

- Filter game mode
- Limit beatmap difficulty
- Show/hide game mode in feed title

Below is a table of all allowed parameters passed to \`routeParams\`

${actualParametersDescTable}

This actual parameters should be passed as \`routeParams\` in URL Query String format without \`?\`, e.g.:

    /osu/latest-ranked/modeInTitle=true&includeMode=osu

:::tip
You could make use of \`difficultyLimit\` paramters to create a "high difficulty/low difficulty only" only feed.

For example, if you only wants to play low star rating beatmap like 1 or 2 star, you could subscribe to:

    /osu/latest-ranked/difficultyLimit=U2

This will filter out all beatmapsets that do not provide at least one beatmap with star rating<=\`2.00\`.

Similarly, you could use lower bound to filter out beatmapsets which don't have at least one beatmap
with star rating higher than a certain threshold.

    /osu/latest-ranked/difficultyLimit=L6

Now all beatmapsets that don't provided at least one beatmap with star rating higher than \`6.00\` will be filtered.
:::
`;

export const route: Route = {
    path: '/latest-ranked/:routeParams?',
    categories: ['game'],
    example: '/osu/latest-ranked/includeMode=osu&difficultyLimit=L3&difficultyLimit=U7',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    parameters: {
        routeParams: {
            description: 'Used to pass route parameters in Query String format. Check out route description for more info.',
            default: 'null',
        },
    },
    name: 'Latest Ranked Beatmap',
    description: descriptionDoc,
    maintainers: ['nfnfgo'],
    radar: [
        {
            source: ['osu.ppy.sh/beatmapsets'],
        },
    ],
    handler,
};

interface Beatmap {
    beatmapset_id: number;
    difficulty_rating: number;
    id: number;
    mode: string;
    status: string;
    total_length: number;
    user_id: number;
    version: string;
    accuracy: number;
    ar: number;
    bpm: number;
    convert: boolean;
    count_circles: number;
    count_sliders: number;
    count_spinners: number;
    cs: number;
    deleted_at: string | null;
    drain: number;
    hit_length: number;
    is_scoreable: boolean;
    last_updated: string;
    mode_int: number;
    passcount: number;
    playcount: number;
    ranked: number;
    url: string;
    checksum: string;
    max_combo: number;
}

interface NominationsSummary {
    current: number;
    eligible_main_rulesets: string[];
    required_meta: {
        main_ruleset: number;
        non_main_ruleset: number;
    };
}

interface Covers {
    cover: string;
    'cover@2x': string;
    card: string;
    'card@2x': string;
    list: string;
    'list@2x': string;
    slimcover: string;
    'slimcover@2x': string;
}

interface Availability {
    download_disabled: boolean;
    more_information: string | null;
}

interface BeatmapsetInfo {
    artist: string;
    artist_unicode: string;
    covers: Covers;
    creator: string;
    favourite_count: number;
    hype: null | string;
    id: number;
    nsfw: boolean;
    offset: number;
    play_count: number;
    preview_url: string;
    source: string;
    spotlight: boolean;
    status: string;
    title: string;
    title_unicode: string;
    track_id: number;
    user_id: number;
    video: boolean;
    bpm: number;
    can_be_hyped: boolean;
    deleted_at: string | null;
    discussion_enabled: boolean;
    discussion_locked: boolean;
    is_scoreable: boolean;
    last_updated: string;
    legacy_thread_url: string;
    nominations_summary: NominationsSummary;
    ranked: number;
    ranked_date: string;
    storyboard: boolean;
    submitted_date: string;
    tags: string;
    availability: Availability;
    beatmaps: Beatmap[];
    pack_tags: string[];
}

async function handler(ctx): Promise<Data> {
    // Parse & retrive searchParams
    const pathParams = ctx.req.param('routeParams');
    // Here user actually pass the query using path param, like: `/osu/latest-ranked/includeMode=osu`
    // We first retrieve path param part: `includeMode=osu`, then concat it with host to construct a "fake" URL:
    // `https://osu.ppy.sh?includeMode=osu`
    // Then we use URL.searchParams to parse and retrieve params from this "fake" URL.
    const searchParams = new URL(`https://osu.ppy.sh?${pathParams}`).searchParams; // use URL to parse params
    const includeModes = searchParams.getAll('includeMode');
    const difficultyLimits = searchParams.getAll('difficultyLimit');
    const modeInTitle = searchParams.get('modeInTitle') ?? 'true'; // show mode name in title, default to true.

    // fetch beatmap JSON info from website within cache
    let beatmapsetList = (await cache.tryGet(
        'https://osu.ppy.sh/beatmapsets:JSON',
        async () => {
            const link = 'https://osu.ppy.sh/beatmapsets';

            const response = await got.get(link);
            const $ = load(response.data);

            const beatmapInfo = JSON.parse($('#json-beatmaps').text() ?? '{"beatmapsets": undefined}');

            const beatmapList: BeatmapsetInfo[] = beatmapInfo.beatmapsets;

            // Failed to fetch, raise error
            if (beatmapList === undefined) {
                throw new Error('Failed to retrieve JSON beatmap info from osu! website');
            }

            return beatmapList;
        },
        config.cache.routeExpire,
        false
    )) as BeatmapsetInfo[];

    // Sort beatmap by difficultyRate.desc
    // This step is necessary even if difficultyLimit not enabled, since we want the beatmap
    // in RSS description sorted when displayed
    for (const item of beatmapsetList) {
        item.beatmaps.sort((a, b) => a.difficulty_rating - b.difficulty_rating);
    }

    // filter beatmapset types
    // Note:
    // One Osu beatmapset could actually contains several beatmaps with different game mode.
    // Here for simplicity we just use the mode of first beatmap in this set for filtering criteria.
    if (includeModes?.length && includeModes?.length > 0) {
        beatmapsetList = beatmapsetList.filter((bm) => includeModes.includes(bm.beatmaps[0].mode));
    }

    let upperLimit = 99; // Osu! will never have maps with 99+ star rating right?
    let lowerLimit = 0;
    if (difficultyLimits && difficultyLimits.length > 0 && difficultyLimits.length < 2) {
        for (const dfLimit of difficultyLimits) {
            if (dfLimit.startsWith('U')) {
                upperLimit = Number.parseFloat(dfLimit.substring(1));
            } else if (dfLimit.startsWith('L')) {
                lowerLimit = Number.parseFloat(dfLimit.substring(1));
            }
        }

        const difficultyRateFilterFunc = (item: BeatmapsetInfo): boolean => {
            if (item.beatmaps.at(0)!.difficulty_rating > upperLimit) {
                return false;
            }
            if (item.beatmaps.at(-1)!.difficulty_rating < lowerLimit) {
                return false;
            }
            return true;
        };

        beatmapsetList = beatmapsetList.filter((item) => difficultyRateFilterFunc(item));
    }

    // Returns a user-readble string that shows details about route parameter config
    function getReadableFeedConfig(): string {
        if (!pathParams) {
            return '';
        }

        let readableConf = 'Feed Configurations:\n';
        readableConf += `Game Mode: ${includeModes.length > 0 ? JSON.stringify(includeModes) : 'All modes'}\n`;
        readableConf += `Star Rating Limit: Lower=${lowerLimit}, Upper=${upperLimit}`;
        return readableConf;
    }

    // Construct beatmap feed items
    const rssItems: DataItem[] = beatmapsetList.map((beatmapset) => {
        // Format publication date using parseDate utility
        // Here it make sense to consider the ranked date as the pubDate of this item since this is ranked map RSS
        const pubDate = parseDate(beatmapset.ranked_date);

        // Select the best resolution cover (2x if available)
        const coverImage = beatmapset.covers['cover@2x'] || beatmapset.covers.cover;
        const bannerImage = beatmapset.covers['card@2x'] || beatmapset.covers.card;

        // Readable beatmap total length
        const readableTotalLength = `${Math.floor(beatmapset.beatmaps[0].total_length / 60)
            .toString()
            .padStart(2, '0')}:${(beatmapset.beatmaps[0].total_length % 60).toString().padStart(2, '0')}`;

        const modeLiteralToDisplayNameMap = {
            osu: 'Osu!',
            fruits: 'Osu!Catch',
            taiko: 'Osu!Taiko',
            mania: 'Osu!Mania',
        };

        // Create a description with beatmap details and a table of difficulties
        const description = art(path.join(__dirname, 'templates/beatmapset.art'), { ...beatmapset, readableTotalLength, modeLiteralToDisplayNameMap });

        return {
            title: `${modeInTitle === 'true' ? `[${modeLiteralToDisplayNameMap[beatmapset.beatmaps[0].mode]}] ` : ``}${beatmapset.title_unicode ?? beatmapset.title}`,
            description,
            pubDate,
            link: `https://osu.ppy.sh/beatmapsets/${beatmapset.id}`,
            category: ['osu!', 'game'],
            author: [{ name: beatmapset.creator }],
            image: coverImage,
            banner: bannerImage,
            updated: beatmapset.last_updated,
        };
    });

    return {
        title: 'Osu! Latest Ranked Map',
        link: 'https://osu.ppy.sh/beatmapsets',
        description: `Newly ranked beatmaps at https://osu.ppy.sh/beatmapsets.\n${getReadableFeedConfig()}`,
        item: rssItems,
    };
}
