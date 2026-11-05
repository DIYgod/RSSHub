import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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

        const appName = $('div.apphub_AppName').first().text();
        const workshopDescription = $('div.customBrowseText').first().text();
        const appIcon = $('div.apphub_AppIcon').children('img').attr('src');

        const ssrText = $('#valve-ssr-data').text();
        if (ssrText) {
            const ssr: { renderContext: { queryData: string } } = JSON.parse(ssrText);
            const state: WorkshopQueryState = JSON.parse(ssr.renderContext.queryData);
            const browse = state.queries.find((query) => query.queryKey[0] === 'workshop_browse')?.state.data;
            const app = state.queries.find((query) => query.queryKey[0] === 'apphub')?.state.data;
            const config = state.queries.find((query) => query.queryKey[0] === 'workshop_config_v8')?.state.data;
            return {
                title: `${app?.name ?? appName} Steam Workshop Content`,
                link: url,
                description: config?.workshop_desc ?? workshopDescription,
                icon: appIcon,
                item:
                    browse?.results?.map((entry) => ({
                        title: entry.title,
                        link: `https://steamcommunity.com/sharedfiles/filedetails/?id=${entry.publishedfileid}`,
                        description: renderToString(<SteamWorkshopDescription image={entry.preview_url} description={entry.short_description} />),
                        author: browse.creator_player_link_details?.find((player) => player.public_data.steamid === entry.creator)?.public_data.persona_name,
                        pubDate: entry.time_created ? parseDate(entry.time_created, 'X') : undefined,
                        updated: entry.time_updated ? parseDate(entry.time_updated, 'X') : undefined,
                        category: entry.tags?.map((tag) => tag.display_name ?? tag.tag),
                    })) ?? [],
            };
        }

        const items = $('div.workshopBrowseItems .workshopItem')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const publishedFileId = $item.find('a').first().attr('data-publishedfileid');
                const entryTitle = $item.find('.workshopItemTitle').first().text();
                const authorNickName = $item.find('.workshop_author_link').first().text();
                const previewImage = $item.find('.workshopItemPreviewImage').first().attr('src');
                const ratingImage = $item.find('.fileRating').first().attr('src');
                // Some items are flaged as 'accepted for game' and 'incompatible item'
                const checkMarkImages: string[] = [];
                $($item)
                    .find('.workshop_checkmark')
                    .each((index, element) => {
                        const checkMarkElement = $(element);
                        const style = checkMarkElement.attr('style');
                        // Only add checkmark image if it is not set to 'display: none'
                        if (!style || !style.includes('display: none;')) {
                            checkMarkImages.push(checkMarkElement.attr('src') || '');
                        }
                    });
                // const script_tag = item.next('script');
                // console.log(`script_tag:${script_tag.text()}`);
                const hoverContent = $item.next('script').text();
                const regex = /SharedFileBindMouseHover\(\s*"sharedfile_\d+",\s*(?:true|false),\s*(\{.*?\})\s*\);/;
                const match = hoverContent.match(regex);

                let entryDescription = '';

                if (match) {
                    const jsonString = match[1];
                    // console.log(jsonString);
                    const data = JSON.parse(jsonString);
                    if (data.id === publishedFileId) {
                        entryDescription = data.description;
                    }
                }

                return {
                    title: entryTitle,
                    link: `https://steamcommunity.com/sharedfiles/filedetails/?id=${publishedFileId}`,
                    description: renderToString(<SteamWorkshopDescription image={previewImage} rating={ratingImage} checkmark={checkMarkImages} description={entryDescription} />),
                    author: authorNickName,
                };
            });

        return {
            title: `${appName} Steam Workshop Content`,
            link: `https://steamcommunity.com/workshop/browse/?appid=${appid}${routeParams ? `&${routeParams}` : ''}`,
            item: items,
            icon: appIcon,
            description: workshopDescription,
        };
    },
};

const SteamWorkshopDescription = ({ image, rating, checkmark, description }: { image?: string; rating?: string; checkmark?: string[]; description?: string }) => (
    <>
        {image ? (
            <>
                <img src={image} />
                <br />
            </>
        ) : null}
        {rating ? <img src={rating} /> : null}
        {checkmark?.map((mark) => (
            <img src={mark} />
        ))}
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
                results?: WorkshopEntry[];
                creator_player_link_details?: Array<{ public_data: { steamid: string; persona_name: string } }>;
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
    time_created?: number;
    time_updated?: number;
    tags?: Array<{ tag: string; display_name?: string }>;
}
