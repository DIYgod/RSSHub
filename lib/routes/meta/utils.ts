import { type CheerioAPI, load } from 'cheerio';

import ofetch from '@/utils/ofetch';

export type ServerData = {
    LSD: { token: string };
    SiteData: {
        haste_session: string;
        hsi: string;
        __spin_r: number;
        __spin_b: string;
        __spin_t: number;
    };
};

export async function getMetaServerContext(link: string): Promise<{ $: CheerioAPI; server: ServerData }> {
    const res = await ofetch(link, {
        headers: {
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
        },
    });
    const $ = load(res);
    const script = $('script:contains("DTSGInitialData"):first').text();
    const serverJs = JSON.parse(script.match(/\(new ServerJS\(\)\)\.handle\((\{[\s\S]*?\})\);/)?.[1] || '{}');

    const server: ServerData = {
        LSD: { token: '' },
        SiteData: {
            haste_session: '',
            hsi: '',
            __spin_r: 0,
            __spin_b: 'trunk',
            __spin_t: Date.now(),
        },
    };

    for (const obj of serverJs.define ?? []) {
        const key = obj[0];
        const value = obj[2];
        server[key as keyof ServerData] = value;
    }

    return { $, server };
}

export function buildGraphqlBody({ server, friendlyName, docId, variables }: { server: ServerData; friendlyName: string; docId: string; variables: unknown }) {
    return new URLSearchParams({
        av: '0',
        __user: '0',
        __a: '1',
        __req: '1',
        dpr: '1',
        __ccg: 'EXCELLENT',
        __rev: String(server.SiteData.__spin_r || ''),
        lsd: server.LSD.token,
        __spin_r: String(server.SiteData.__spin_r || ''),
        __spin_b: String(server.SiteData.__spin_b || 'trunk'),
        __spin_t: String(server.SiteData.__spin_t || Date.now()),
        fb_api_caller_class: 'RelayModern',
        fb_api_req_friendly_name: friendlyName,
        variables: JSON.stringify(variables),
        server_timestamps: 'true',
        doc_id: docId,
    });
}

export function metaGraphqlHeaders(server: ServerData, friendlyName: string) {
    return {
        'content-type': 'application/x-www-form-urlencoded',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'x-asbd-id': '359341',
        'x-fb-friendly-name': friendlyName,
        'x-fb-lsd': server.LSD.token,
    };
}

export const GRAPHQL_ENDPOINT = 'https://ai.meta.com/api/graphql/';
