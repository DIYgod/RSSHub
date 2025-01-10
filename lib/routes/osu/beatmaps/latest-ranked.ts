import { Data, DataItem, Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

const descriptionDoc: string = `
Subscribe to the new beatmaps on https://osu.ppy.sh/beatmapsets.

Parameters allows you to:

- Filter game mode
- Limit beatmap difficulty
- Show/hide game mode in feed title

Check out paramters description for more details.

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
    example: '/osu/latest-ranked/includeMode=osu&includeMode=mania&difficultyLimit=L3&difficultyLimit=U7',
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
        includeMode: {
            description: 'Specify included game mode of beatmaps. Including this parameter multiple times to specify multiple game modes, e.g.: `includeMode=osu&includeMode=mania`. Subscribe to all game modes if not specified.',
            default: 'all',
            options: [
                {
                    value: 'osu',
                    label: 'Osu!',
                },
                {
                    value: 'mania',
                    label: 'Osu!Mania',
                },
                {
                    value: 'fruits',
                    label: 'Osu!Catch',
                },
                {
                    value: 'taiko',
                    label: 'Osu!Taiko',
                },
            ],
        },
        difficultyLimit: {
            default: '',
            description: 'Lower/upper limit of star rating of the beatmaps in the beatmapset item, e.g.:`difficultyLimit=U6`. Checkout tips in descriptions for detailed explaination and examples.',
        },
        modeInTitle: {
            description: 'Add mode info into feed title.',
            default: 'true',
            options: [
                {
                    value: 'true',
                    label: 'Show beatmap mode info in title',
                },
                {
                    value: 'false',
                    label: 'Do not show beatmap mode info in title',
                },
            ],
        },
    },
    name: 'Latest Ranked Beatmap',
    description: descriptionDoc,
    maintainers: ['nfnfgo'],
    radar: [
        {
            source: ['https://osu.ppy.sh/beatmapsets'],
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
    let beatmapsetList = (await cache.tryGet('https://osu.ppy.sh/beatmapsets:JSON', async () => {
        const link = `https://osu.ppy.sh/beatmapsets`;

        const response = await got.get(link);
        const $ = load(response.data);

        const beatmapInfo = JSON.parse($('#json-beatmaps').html() ?? '{"beatmapsets": undefined}');

        const beatmapList: BeatmapsetInfo[] = beatmapInfo.beatmapsets;

        // Failed to fetch, raise error
        if (beatmapList === undefined) {
            throw new Error('Failed to retrieve JSON beatmap info from osu! website');
        }

        return beatmapList;
    })) as BeatmapsetInfo[];

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

    // Construct beatmap feed items
    const rssItems: DataItem[] = beatmapsetList.map((item) => {
        // Format publication date using parseDate utility
        // Here it make sense to consider the ranked date as the pubDate of this item since this is ranked map RSS
        const pubDate = parseDate(item.ranked_date);

        // Select the best resolution cover (2x if available)
        const coverImage = item.covers['cover@2x'] || item.covers.cover;
        const bannerImage = item.covers['card@2x'] || item.covers.card;

        // Readable beatmap total length
        const readableTotalLength = `${Math.floor(item.beatmaps[0].total_length / 60)
            .toString()
            .padStart(2, '0')}:${(item.beatmaps[0].total_length % 60).toString().padStart(2, '0')}`;

        // Create a description with beatmap details and a table of difficulties
        const description = `
        <img src="${coverImage}" alt="${item.title}" style="max-width: 100%; height: auto;" />
        <h1>${item.title_unicode ?? item.title}</h1>
        <h3>Beatmap Details</h3>
        <ul>
            <li><strong>English Title:</strong> ${item.title}</li>
            <li><strong>Mode:</strong> ${item.beatmaps[0].mode}</li>
            <li><strong>Artist:</strong> ${item.artist_unicode} (${item.artist})</li>
            <li><strong>Creator:</strong> ${item.creator}</li>
            <li><strong>Length:</strong> ${readableTotalLength}</li>
            <li><strong>BPM:</strong> ${item.bpm}</li>
        </ul>
        <h4>Valid Difficulties</h4>
        <table border="1">
            <thead>
                <tr>
                    <th>Version</th>
                    <th>Rating</th>
                    <th>AR</th>
                    <th>Drain</th>
                </tr>
            </thead>
            <tbody>
                ${item.beatmaps
                    .sort((a, b) => a.difficulty_rating - b.difficulty_rating)
                    .map(
                        (beatmap) => `
                                <tr>
                                    <td><a href="${beatmap.url}" target="_blank">${beatmap.version}</a></td>
                                    <td>${beatmap.difficulty_rating.toFixed(2)}</td>
                                    <td>${beatmap.ar.toFixed(1)}</td>
                                    <td>${beatmap.drain}</td>
                                </tr>
                            `
                    )
                    .join('')}
            </tbody>
        </table>
    `;

        const modeLiteralToDisplayNameMap = {
            osu: 'Osu!',
            fruits: 'Osu!Catch',
            taiko: 'Osu!Taiko',
            mania: 'Osu!Mania',
        };

        return {
            title: `${modeInTitle === 'true' ? `[${modeLiteralToDisplayNameMap[item.beatmaps[0].mode]}] ` : ``}${item.title_unicode ?? item.title}`,
            description,
            pubDate,
            link: `https://osu.ppy.sh/beatmapsets/${item.id}`,
            category: ['osu!', 'game'],
            author: [{ name: item.creator }],
            image: coverImage,
            banner: bannerImage,
            updated: item.last_updated,
        };
    });

    return {
        title: `Osu! Latest Ranked Map`,
        link: `https://osu.ppy.sh/beatmapsets`,
        description: 'Newly ranked beatmaps at https://osu.ppy.sh/beatmapsets',
        item: rssItems,
    };
}
