import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/workshopsearch/:appid?/:routeParams?',
    categories: ['game'],
    example: '/steam/workshopsearch/730',
    parameters: {
        appid: 'Steam appid, can be found on the community hub page or store page URL, 730 by default.',
        routeParams: 'Route parameters, can be found on the search result page URL. Route parameters located after the appid.',
    },
    radar: [
        {
            title: 'Workshop Search Results',
            source: ['steamcommunity.com/app/:appid/workshop/'],
            target: '/workshopsearch/:appid',
        },
    ],
    description: `Steam Community Workshop Search Results.
The parameter 'l=language' changes the language of search results(if possible).
For example, route \`/workshopsearch/730/l=schinese\` will display the simplified Chinese descriptions of the entry.

Language Parameter:

| English | 简体中文 | 繁體中文 | 日本語   | 한국어  | ภาษาไทย | български | čeština | dansk  | Deutsch | español | latam | ελληνικά | français | italiano | Bahasa Indonesia | magyar    | Nederlands | norsk     | polski | português  | brasileiro | română   | русский | suomi   | svenska | Türkçe  | Tiếng Việt | українська |
| ------- | -------- | -------- | -------- | ------- | ------- | --------- | ------- | ------ | ------- | ------- | ----- | -------- | -------- | -------- | ---------------- | --------- | ---------- | --------- | ------ | ---------- | ---------- | -------- | ------- | ------- | ------- | ------- | ---------- | ---------- |
| english | schinese | tchinese | japanese | koreana | thai    | bulgarian | czech   | danish | german  | spanish | latam | greek    | french   | italian  | indonesian       | hungarian | dutch      | norwegian | polish | portuguese | brazilian  | romanian | russian | finnish | swedish | turkish | vietnamese | ukrainian  |`,
    name: 'Community Workshop Search',
    maintainers: ['NyaaaDoge'],

    handler: async (ctx) => {
        const { appid = 730, routeParams } = ctx.req.param();

        const params = new URLSearchParams(`appid=${appid}${routeParams ? `&${routeParams}` : ''}`);
        if (params.has('p')) {
            params.set('p', '1');
        }
        const url = `https://steamcommunity.com/workshop/browse/?${params}`;
        const response = await ofetch(url);
        const $ = load(response);

        const appIcon = $('div.apphub_AppIcon').children('img').attr('src');

        const ssr: { renderContext: { queryData: string } } = JSON.parse($('#valve-ssr-data').text());
        const state: WorkshopQueryState = JSON.parse(ssr.renderContext.queryData);
        const browse = state.queries.find((query) => query.queryKey[0] === 'workshop_browse')?.state.data;
        const app = state.queries.find((query) => query.queryKey[0] === 'apphub')?.state.data;
        const config = state.queries.find((query) => query.queryKey[0] === 'workshop_config_v8')?.state.data;
        return {
            title: `${app?.name} Steam Workshop Content`,
            link: url,
            description: config?.workshop_desc,
            icon: appIcon,
            item: browse?.results.map((entry) => ({
                title: entry.title,
                link: `https://steamcommunity.com/sharedfiles/filedetails/?id=${entry.publishedfileid}`,
                description: renderToString(<SteamWorkshopDescription image={entry.preview_url} description={entry.short_description} />),
                author: browse.creator_player_link_details.find((player) => player.public_data.steamid === entry.creator)?.public_data.persona_name,
                pubDate: parseDate(entry.time_created, 'X'),
                updated: parseDate(entry.time_updated, 'X'),
                category: entry.tags.map((tag) => tag.display_name),
            })),
        };
    },
};

const SteamWorkshopDescription = ({ image, description }: { image?: string; description?: string }) => (
    <>
        {image ? (
            <>
                <img src={image} />
                <br />
            </>
        ) : null}
        <p>{description}</p>
    </>
);

interface WorkshopQueryState {
    queries: Array<{
        queryKey: unknown[];
        state: {
            data?: {
                name?: string;
                workshop_desc?: string;
                results: WorkshopEntry[];
                creator_player_link_details: Array<{ public_data: { steamid: string; persona_name: string } }>;
            };
        };
    }>;
}

interface WorkshopEntry {
    publishedfileid: string;
    creator: string;
    title: string;
    preview_url?: string;
    short_description?: string;
    time_created: number;
    time_updated: number;
    tags: Array<{ tag: string; display_name: string }>;
}
