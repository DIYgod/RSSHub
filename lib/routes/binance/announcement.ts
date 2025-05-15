import { DataItem, Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import * as cheerio from 'cheerio';
import { AnnouncementCatalog, AnnouncementsConfig } from './types';

interface AnnouncementFragment {
    reactRoot: [{ id: 'Fragment'; children: { id: string; props: object }[]; props: object }];
}

const ROUTE_PARAMETERS_CATALOGID_MAPPING = {
    'new-cryptocurrency-listing': 48,
    'latest-binance-news': 49,
    'latest-activities': 93,
    'new-fiat-listings': 50,
    'api-updates': 51,
    'crypto-airdrop': 128,
    'wallet-maintenance-updates': 157,
    delisting: 161,
};

function assertAnnouncementsConfig(playlist: unknown): playlist is AnnouncementFragment {
    if (!playlist || typeof playlist !== 'object') {
        return false;
    }
    if (!('reactRoot' in (playlist as { reactRoot: unknown[] }))) {
        return false;
    }
    if (!Array.isArray((playlist as { reactRoot: unknown[] }).reactRoot)) {
        return false;
    }
    if ((playlist as { reactRoot: { id: string }[] }).reactRoot?.[0]?.id !== 'Fragment') {
        return false;
    }
    return true;
}

function assertAnnouncementsConfigList(props: unknown): props is { config: { list: AnnouncementsConfig[] } } {
    if (!props || typeof props !== 'object') {
        return false;
    }
    if (!('config' in props)) {
        return false;
    }
    if (!('list' in (props.config as { list: AnnouncementsConfig[] }))) {
        return false;
    }
    return true;
}

const handler: Route['handler'] = async (ctx) => {
    const baseUrl = 'https://www.binance.com';
    const announcementCategoryUrl = `${baseUrl}/support/announcement`;
    const { type } = ctx.req.param<'/binance/announcement/:type'>();
    const language = ctx.req.header('Accept-Language');
    const headers = {
        Referer: baseUrl,
        'Accept-Language': language ?? 'en-US,en;q=0.9',
    };
    const announcementsConfig = (await cache.tryGet(`binance:announcements:${language}`, async () => {
        const announcementRes = await ofetch<string>(announcementCategoryUrl, { headers });
        const $ = cheerio.load(announcementRes);

        const appData = JSON.parse($('#__APP_DATA').text());

        const announcements = Object.values(appData.appState.loader.dataByRouteId as Record<string, object>).find((value) => 'playlist' in value) as { playlist: unknown };

        if (!assertAnnouncementsConfig(announcements.playlist)) {
            throw new Error('Get announcement config failed');
        }

        const listConfigProps = announcements.playlist.reactRoot[0].children.find((i) => i.id === 'TopicCardList')?.props;

        if (!assertAnnouncementsConfigList(listConfigProps)) {
            throw new Error("Can't get announcement config list");
        }

        return listConfigProps.config.list;
    })) as AnnouncementsConfig[];

    const announcementCatalogId = ROUTE_PARAMETERS_CATALOGID_MAPPING[type];

    if (!announcementCatalogId) {
        throw new Error(`${type} is not supported`);
    }

    const targetItem = announcementsConfig.find((i) => i.url.includes(`c-${announcementCatalogId}`));

    if (!targetItem) {
        throw new Error('Unexpected announcements config');
    }

    const link = new URL(targetItem.url, baseUrl).toString();

    const response = await ofetch<string>(link, { headers });

    const $ = cheerio.load(response);
    const appData = JSON.parse($('#__APP_DATA').text());

    const values = Object.values(appData.appState.loader.dataByRouteId as Record<string, object>);
    const catalogs = values.find((value) => 'catalogs' in value) as { catalogs: AnnouncementCatalog[] };
    const catalog = catalogs.catalogs.find((catalog) => catalog.catalogId === announcementCatalogId);

    const item = await Promise.all(
        catalog!.articles.map((i) => {
            const link = `${announcementCategoryUrl}/${i.code}`;
            const item = {
                title: i.title,
                link,
                description: i.title,
                pubDate: parseDate(i.releaseDate),
            } as DataItem;
            return cache.tryGet(`binance:announcement:${i.code}:${language}`, async () => {
                const res = await ofetch(link, { headers });
                const $ = cheerio.load(res);
                const descriptionEl = $('#support_article > div').first();
                descriptionEl.find('style').remove();
                item.description = descriptionEl.html() ?? '';
                return item;
            }) as Promise<DataItem>;
        })
    );

    return {
        title: targetItem.title,
        link,
        description: targetItem.description,
        item,
    };
};

export const route: Route = {
    path: '/announcement/:type',
    categories: ['finance', 'popular'],
    view: ViewType.Articles,
    example: '/binance/announcement/new-cryptocurrency-listing',
    parameters: {
        type: {
            description: 'Binance Announcement type',
            default: 'new-cryptocurrency-listing',
            options: [
                { value: 'new-cryptocurrency-listing', label: 'New Cryptocurrency Listing' },
                { value: 'latest-binance-news', label: 'Latest Binance News' },
                { value: 'latest-activities', label: 'Latest Activities' },
                { value: 'new-fiat-listings', label: 'New Fiat Listings' },
                { value: 'api-updates', label: 'API Updates' },
                { value: 'crypto-airdrop', label: 'Crypto Airdrop' },
                { value: 'wallet-maintenance-updates', label: 'Wallet Maintenance Updates' },
                { value: 'delisting', label: 'Delisting' },
            ],
        },
    },
    name: 'Announcement',
    description: `
Type category

 - new-cryptocurrency-listing => New Cryptocurrency Listing
 - latest-binance-news        => Latest Binance News
 - latest-activities          => Latest Activities
 - new-fiat-listings          => New Fiat Listings
 - api-updates                => API Updates
 - crypto-airdrop             => Crypto Airdrop
 - wallet-maintenance-updates => Wallet Maintenance Updates
 - delisting                  => Delisting
`,
    maintainers: ['enpitsulin'],
    handler,
};
