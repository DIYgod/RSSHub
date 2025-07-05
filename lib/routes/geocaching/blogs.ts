import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blogs/:language?',
    categories: ['blog'],
    example: '/geocaching/blogs/en',
    parameters: {
        language: {
            description: 'language',
            default: 'en',
            options: [
                { value: 'en', label: 'English' },
                { value: 'de', label: 'Deutsch' },
                { value: 'fr', label: 'Français' },
                { value: 'es', label: 'Español' },
                { value: 'nl', label: 'Nederlands' },
                { value: 'cs', label: 'Čeština' },
                { value: 'all', label: 'Not Specified' },
            ],
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['geocaching.com/blog/', 'geocaching.com/'],
        },
    ],
    name: 'Official Blogs',
    maintainers: ['HankChow', 'Konano'],
    handler,
    url: 'geocaching.com/blog/',
};

const languageToCategory = { de: 140, fr: 138, es: 702, nl: 737, cs: 1404 };
const languageToLabel = { de: 'Deutsch', fr: 'Français', es: 'Español', nl: 'Nederlands', cs: 'Čeština' };

async function handler(ctx) {
    const baseUrl = 'https://www.geocaching.com';
    const language = ctx.req.param('language') ?? 'en';
    const searchParams: {
        per_page: number;
        _embed: number;
        _fields: string;
        categories_exclude?: string;
        categories?: number;
    } = {
        per_page: ctx.req.query('limit') ?? 20,
        _embed: 1,
        _fields: ['id', 'title', 'link', 'guid', 'content', 'date_gmt', 'modified_gmt', '_embedded', '_links'].join(','),
    };

    if (language === 'en') {
        searchParams.categories_exclude = Object.values(languageToCategory).join(',');
    } else if (language in languageToCategory) {
        searchParams.categories = languageToCategory[language];
    } else if (language === 'all') {
        // do nothing
    } else {
        throw new Error(`Unsupported language: ${language}`);
    }

    // console.log(searchParams);

    const { data: response } = await got(`${baseUrl}/blog/wp-json/wp/v2/posts`, { searchParams });
    const items = response.map((item) => {
        const media = item._embedded['wp:featuredmedia'][0];
        const mediaDetails = media?.media_details;
        const mediaSize = mediaDetails?.sizes.large || mediaDetails?.sizes.full;
        return {
            title: item.title.rendered.trim(),
            link: item.link,
            guid: item.guid.rendered,
            description: item.content.rendered,
            pubDate: parseDate(item.date_gmt),
            updated: parseDate(item.modified_gmt),
            author: item._embedded.author[0].name,
            category: item._embedded['wp:term'][0].map((category) => category.name.trim()),
            media: mediaSize
                ? {
                      content: {
                          url: media.source_url,
                          type: media.mime_type,
                          height: mediaDetails.height,
                          width: mediaDetails.width,
                          fileSize: mediaDetails.filesize,
                      },
                      thumbnail: {
                          url: mediaSize.source_url,
                          height: mediaSize.height,
                          width: mediaSize.width,
                      },
                  }
                : undefined,
        };
    });

    return {
        title: language in languageToLabel ? `Geocaching Blog - ${languageToLabel[language]}` : 'Geocaching Blog',
        link: `${baseUrl}/blog/`,
        language: language in languageToCategory ? language : 'en',
        image: 'https://i.ytimg.com/vi_webp/G28VxvBoSLQ/maxresdefault.webp',
        icon: `${baseUrl}/blog/favicon.ico`,
        logo: `${baseUrl}/blog/favicon.ico`,
        description: 'Geocaching Official Blog',
        item: items,
        allowEmpty: true,
    };
}
