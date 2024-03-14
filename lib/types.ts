import type { Context } from 'hono';

// rss
export type DataItem = {
    title: string;
    description?: string;
    pubDate?: number | string | Date;
    link?: string;
    category?: string[];
    author?: string | { name: string }[];
    doi?: string;
    guid?: string;
    id?: string;
    content?: {
        html: string;
        text: string;
    };
    image?: string;
    banner?: string;
    updated?: number | string | Date;
    language?: string;
    enclosure_url?: string;
    enclosure_type?: string;
    enclosure_title?: string;
    enclosure_length?: number;
    itunes_duration?: number | string;

    _extra?: Record<string, any> & {
        links?: {
            url: string;
            type: string;
            content_html?: string;
        }[];
    };
};

export type Data = {
    title: string;
    description?: string;
    link?: string;
    item?: DataItem[];
    allowEmpty?: boolean;
    image?: string;
    author?: string;
    language?: string;
    feedLink?: string;
    lastBuildDate?: string;
};

// namespace
interface NamespaceItem {
    name: string;
    url?: string;
    categories?: string[];
    description?: string;
}

interface Namespace extends NamespaceItem {
    ja?: NamespaceItem;
    zh?: NamespaceItem;
    'zh-TW'?: NamespaceItem;
}

export type { Namespace };

// route
interface RouteItem {
    path: string | string[];
    name: string;
    url?: string;
    maintainers: string[];
    handler: (ctx: Context) => Promise<Data> | Data;
    example: string;
    parameters?: Record<string, string>;
    description?: string;
    categories?: string[];

    features: {
        requireConfig?:
            | {
                  name: string;
                  optional?: boolean;
                  description: string;
              }[]
            | false;
        requirePuppeteer?: boolean;
        antiCrawler?: boolean;
        supportRadar?: boolean;
        supportBT?: boolean;
        supportPodcast?: boolean;
        supportScihub?: boolean;
    };
    radar?: {
        source: string[];
        target?: string;
    };
}

interface Route extends RouteItem {
    ja?: NamespaceItem;
    zh?: NamespaceItem;
    'zh-TW'?: NamespaceItem;
}

export type { Route };

// radar
export type Radar = {
    [domain: string]:
        | {
              [subdomain: string]: {
                  title: string;
                  docs: string;
                  source: string[];
                  target: string | ((params: any, url: string) => string);
              }[];
          }
        | {
              _name: string;
          };
};
