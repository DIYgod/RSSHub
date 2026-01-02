import type { Context } from 'hono';

// Make sure it's synchronise with scripts/workflow/data.ts
// and lib/routes/rsshub/routes.ts
export type Category =
    | 'popular'
    | 'social-media'
    | 'new-media'
    | 'traditional-media'
    | 'bbs'
    | 'blog'
    | 'programming'
    | 'design'
    | 'live'
    | 'multimedia'
    | 'picture'
    | 'anime'
    | 'program-update'
    | 'university'
    | 'forecast'
    | 'travel'
    | 'shopping'
    | 'game'
    | 'reading'
    | 'government'
    | 'study'
    | 'journal'
    | 'finance'
    | 'other';

// rss
export type DataItem = {
    title: string;
    description?: string;
    pubDate?: number | string | Date;
    link?: string;
    category?: string[];
    author?:
        | string
        | Array<{
              name: string;
              url?: string;
              avatar?: string;
          }>;
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
    language?: Language;
    enclosure_url?: string;
    enclosure_type?: string;
    enclosure_title?: string;
    enclosure_length?: number;
    itunes_duration?: number | string;
    itunes_item_image?: string;
    media?: Record<string, Record<string, string>>;
    attachments?: Array<{
        url: string;
        mime_type: string;
        title?: string;
        size_in_bytes?: number;
        duration_in_seconds?: number;
    }>;

    _extra?: Record<string, any> & {
        links?: Array<{
            url: string;
            type: string;
            content_html?: string;
        }>;
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
    language?: Language;
    feedLink?: string;
    lastBuildDate?: string;
    itunes_author?: string;
    itunes_category?: string;
    itunes_explicit?: string | boolean;
    id?: string;
    icon?: string;
    logo?: string;
    atomlink?: string;
    ttl?: number;
};

export type Language =
    | 'af'
    | 'ar-DZ'
    | 'ar-IQ'
    | 'ar-KW'
    | 'ar-MA'
    | 'ar-SA'
    | 'ar-TN'
    | 'be'
    | 'bg'
    | 'ca'
    | 'cs'
    | 'da'
    | 'de'
    | 'de-at'
    | 'de-ch'
    | 'de-de'
    | 'de-li'
    | 'de-lu'
    | 'el'
    | 'en'
    | 'en-au'
    | 'en-bz'
    | 'en-ca'
    | 'en-gb'
    | 'en-ie'
    | 'en-jm'
    | 'en-nz'
    | 'en-ph'
    | 'en-tt'
    | 'en-us'
    | 'en-za'
    | 'en-zw'
    | 'es'
    | 'es-ar'
    | 'es-bo'
    | 'es-cl'
    | 'es-co'
    | 'es-cr'
    | 'es-do'
    | 'es-ec'
    | 'es-es'
    | 'es-gt'
    | 'es-hn'
    | 'es-mx'
    | 'es-ni'
    | 'es-pa'
    | 'es-pe'
    | 'es-pr'
    | 'es-py'
    | 'es-sv'
    | 'es-uy'
    | 'es-ve'
    | 'et'
    | 'eu'
    | 'fi'
    | 'fo'
    | 'fr'
    | 'fr-be'
    | 'fr-ca'
    | 'fr-ch'
    | 'fr-fr'
    | 'fr-lu'
    | 'fr-mc'
    | 'ga'
    | 'gd'
    | 'gl'
    | 'haw'
    | 'hi'
    | 'hr'
    | 'hu'
    | 'in'
    | 'is'
    | 'it'
    | 'it-ch'
    | 'it-it'
    | 'ja'
    | 'ko'
    | 'mk'
    | 'ne'
    | 'nl'
    | 'nl-be'
    | 'nl-nl'
    | 'no'
    | 'pl'
    | 'pt'
    | 'pt-br'
    | 'pt-pt'
    | 'ro'
    | 'ro-mo'
    | 'ro-ro'
    | 'ru'
    | 'ru-mo'
    | 'ru-ru'
    | 'sk'
    | 'sl'
    | 'sq'
    | 'sr'
    | 'sv'
    | 'sv-fi'
    | 'sv-se'
    | 'tr'
    | 'uk'
    | 'zh-CN'
    | 'zh-HK'
    | 'zh-TW'
    | 'other';

// namespace
interface NamespaceItem {
    /**
     * The human-readable name of the namespace, should be the same as the secondary domain of the main website,
     * which will be used as the level 2 heading in the documentation
     */
    name: string;

    /**
     * The website URL without protocol that corresponds
     */
    url?: string;

    /**
     * The classification of the namespace, which will be written into the corresponding classification document
     */
    categories?: Category[];

    /**
     * Hints and additional explanations for users using this namespace, it will be inserted into the documentation
     */
    description?: string;

    /**
     * Main Language of the namespace
     */
    lang?: Language;
}

interface Namespace extends NamespaceItem {
    /** Documentation in languages other than English, it will be used to generate multilingual documents */
    ja?: NamespaceItem;
    /** Documentation in languages other than English, it will be used to generate multilingual documents */
    zh?: NamespaceItem;
    /** Documentation in languages other than English, it will be used to generate multilingual documents */
    'zh-TW'?: NamespaceItem;
}

export type { Namespace };

export enum ViewType {
    Articles = 0,
    SocialMedia = 1,
    Pictures = 2,
    Videos = 3,
    Audios = 4,
    Notifications = 5,
}

// route
interface RouteItem {
    /**
     * The route path, using [Hono routing](https://hono.dev/api/routing) syntax
     */
    path: string | string[];

    /**
     * The human-readable name of the route, which will be used as the level 3 heading in the documentation
     * and radar rule title (can be overridden by `RadarRule[].title`)
     */
    name: string;

    /**
     * The website URL without protocol that corresponds
     */
    url?: string;

    /**
     * The GitHub handle of the people responsible for maintaining this route
     */
    maintainers: string[];

    /**
     * The handler function of the route
     */
    handler: (ctx: Context) => Promise<Data | null | Response> | Data | null | Response;

    /**
     * An example URL of the route
     */
    example: string;

    /**
     * The description of the route parameters
     */
    parameters?: Record<
        string,
        | string
        | {
              description: string;
              default?: string;
              options?: Array<{
                  value: string;
                  label: string;
              }>;
          }
    >;

    /**
     * Hints and additional explanations for users using this route, it will be appended after the route component, supports markdown
     */
    description?: string;

    /**
     * The classification of the route, which will be written into the corresponding classification documentation
     */
    categories?: Category[];

    /**
     * Special features of the route, such as what configuration items it depends on, whether it is strict anti-crawl, whether it supports a certain function and so on
     */
    features?: {
        /** The extra configuration items required by the route */
        requireConfig?:
            | Array<{
                  /**  The environment variable name */
                  name: string;
                  /**  Whether the environment variable is optional */
                  optional?: boolean;
                  /**  The description of the environment variable */
                  description: string;
              }>
            | false;

        /** set to `true` if the feed uses puppeteer */
        requirePuppeteer?: boolean;

        /** set to `true` if the target website has an anti-crawler mechanism */
        antiCrawler?: boolean;

        /** set to `true` if the feed has a radar rule */
        supportRadar?: boolean;

        /** Set to `true` if the feed supports BitTorrent */
        supportBT?: boolean;

        /** Set to `true` if the feed supports podcasts */
        supportPodcast?: boolean;

        /** Set to `true` if the feed supports Sci-Hub */
        supportScihub?: boolean;

        /** Set to `true` if this feed is not safe for work */
        nsfw?: boolean;
    };

    /**
     * The [RSSHub-Radar](https://github.com/DIYgod/RSSHub-Radar) rule of the route
     */
    radar?: RadarItem[];

    /**
     * The [Follow](https://github.com/RSSNext/follow) default view of the route, default to `ViewType.Articles`
     */
    view?: ViewType;
}

export interface Route extends RouteItem {
    ja?: RouteItem;
    zh?: RouteItem;
    'zh-TW'?: RouteItem;
}

// radar
export type RadarItem = {
    /**
     * The overwriting title of the radar rule
     */
    title?: string;

    /**
     * The URL path to the corresponding documentation
     */
    docs?: string;

    /**
     * The source URL path of the radar rule
     * @see https://docs.rsshub.app/joinus/new-radar#source
     */
    source: string[];

    /**
     * The target RSSHub subscription URL path of the radar rule
     *
     * Will use RouteItem.path if not specified
     * @see https://docs.rsshub.app/joinus/new-radar#target
     *
     * Using `target` as a function is deprecated in RSSHub-Radar 2.0.19
     * @see https://github.com/DIYgod/RSSHub-Radar/commit/5a97647f900bb2bca792787a322b2b1ca512e40b#diff-f84e3c1e16af314bc4ed7c706d7189844663cde9b5142463dc5c0db34c2e8d54L10
     * @see https://github.com/DIYgod/RSSHub-Radar/issues/692
     */
    target?:
        | string
        | ((
              /** The parameters matched from the `source` field */
              params: any,
              /** The current webpage URL string */
              url: string,
              /** @deprecated Temporary removed  @see https://github.com/DIYgod/RSSHub-Radar/commit/e6079ea1a8c96e89b1b2c2aa6d13c7967788ca3b */
              document: Document
          ) => string);
};

export type RadarDomain = {
    _name: string;
} & {
    [subdomain: string]: RadarItem[];
};

export interface APIRoute {
    /**
     * The route path, using [Hono routing](https://hono.dev/api/routing) syntax
     */
    path: string;

    /**
     * The GitHub handle of the people responsible for maintaining this route
     */
    maintainers: string[];

    /**
     * The handler function of the route
     */
    handler: (ctx: Context) =>
        | Promise<{
              code: number;
              message?: string;
              data?: any;
          }>
        | {
              code: number;
              message?: string;
              data?: any;
          };

    /**
     * The description of the route parameters
     */
    parameters?: Record<
        string,
        {
            description: string;
            default?: string;
            options?: Array<{
                value: string;
                label: string;
            }>;
        }
    >;

    /**
     * Hints and additional explanations for users using this route, it will be appended after the route component, supports markdown
     */
    description?: string;
}
