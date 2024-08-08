import { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import * as cheerio from 'cheerio';
import { AnnouncementCatalog, AnnouncementsConfig } from './types';

interface AnnouncementFragment {
    reactRoot: [{ id: 'Fragment'; children: { id: string; props: any }[]; props: object }];
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

function assertAnnouncementsConfig(playlist: any): playlist is AnnouncementFragment {
    if (typeof playlist !== 'object') {
        return false;
    }
    if (!('reactRoot' in playlist)) {
        return false;
    }
    if (!Array.isArray(playlist.reactRoot)) {
        return false;
    }
    if (playlist.reactRoot?.[0]?.id !== 'Fragment') {
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
        const announcementRes = await ofetch<string>(announcementCategoryUrl, { headers, redirect: 'follow' });
        const $ = cheerio.load(announcementRes);

        const appData = JSON.parse($('#__APP_DATA').text());

        const announcements = Object.values(appData.appState.loader.dataByRouteId as Record<string, any>).find((value) => 'playlist' in value) as { playlist: any };

        if (!assertAnnouncementsConfig(announcements.playlist)) {
            throw new Error('Get announcement config failed');
        }

        const announcementsConfig: AnnouncementsConfig[] = announcements.playlist.reactRoot[0].children.find((i) => i.id === 'TopicCardList')?.props?.config.list;

        return announcementsConfig;
    })) as AnnouncementsConfig[];

    const announcementCatalogId = ROUTE_PARAMETERS_CATALOGID_MAPPING[type];

    if (!announcementCatalogId) {
        throw new Error(`${type} is not supported`);
    }

    const targetItem = announcementsConfig.find((i) => i.url.includes(`c-${announcementCatalogId}`));

    if (!targetItem) {
        throw new Error('Unexpected announcements config');
    }

    const link = `${baseUrl}${targetItem.url}`;

    const response = await ofetch<string>(link, { headers, redirect: 'follow' });

    const $ = cheerio.load(response);
    const appData = JSON.parse($('#__APP_DATA').text());

    const values = Object.values(appData.appState.loader.dataByRouteId as Record<string, any>);
    const catalogs: { catalogs: AnnouncementCatalog[] } = values.find((value) => 'catalogs' in value);
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
                const res = await ofetch(link, { headers, redirect: 'follow' });
                const $ = cheerio.load(res);
                item.description = $('#support_article').html() ?? '';
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
    categories: ['finance'],
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
    name: 'Binance Announcement',
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
