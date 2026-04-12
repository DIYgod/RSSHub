import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { cnNewsHander } from './news-cn';

const languages = {
    en: 'fcbayern.com-en-gb',
    es: 'fcbayern.com-es-es',
    de: 'fcbayern.com-de-de',
};

const query = /* GraphQL */ `
    query Web_NewsSearch($channelId: String!, $query: String!, $filterTags: [String!], $filterSections: [String!], $filterTypes: [String!], $count: Int!, $offset: Int, $excludeHeroStageResultFromPageId: String) {
        newsSearch(
            channelId: $channelId
            query: $query
            filterTags: $filterTags
            filterSections: $filterSections
            filterTypes: $filterTypes
            count: $count
            offset: $offset
            excludeHeroStageResultFromPageId: $excludeHeroStageResultFromPageId
        ) {
            total
            offset
            count
            results {
                ...Teaser
                __typename
            }
            __typename
        }
    }
    fragment Teaser on Teaser {
        __typename
        id
        pageType
        teaserTitle
        teaserShortTitle
        teaserSubtitle
        teaserText
        tag
        publicationDate
        teaserImage {
            ...ImageFragment
            __typename
        }
        teaserLink {
            ...Link
            __typename
        }
        teamEmblems {
            ...TeamEmblems
            __typename
        }
        teaserAppendix {
            ... on GalleryTeaserAppendix {
                galleryImages {
                    ...ImageFragment
                    __typename
                }
                __typename
            }
            ... on VideoTeaserAppendix {
                documentId
                kalturaId
                __typename
            }
            __typename
        }
        markers
        adMarker
        channelId
    }
    fragment Link on Link {
        __typename
        newTabOrWindow
        title
        target {
            ... on ExternalLink {
                url
                __typename
            }
            ... on InternalLink {
                id
                path
                channelId
                channelPath
                differentChannelDomain
                locale
                pageType
                __typename
            }
            __typename
        }
    }
    fragment ImageFragment on ImageFragment {
        __typename
        url
        alt
        caption
        copyright
        origWidth
        origHeight
        aspectRatioImageOverrides {
            ...AspectRatioImageOverride
            __typename
        }
    }
    fragment AspectRatioImageOverride on AspectRatioImageOverride {
        aspectRatio
        url
        __typename
    }
    fragment TeamEmblems on TeamEmblems {
        ownTeam
        emblem {
            ...ImageFragment
            __typename
        }
        __typename
    }
`;

export const route: Route = {
    path: '/news/:language?',
    categories: ['new-media'],
    example: '/fcbayern/news',
    parameters: {
        language: {
            description: 'Language',
            options: [
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Español' },
                { value: 'de', label: 'Deutsch' },
                { value: 'zh', label: '中文' },
            ],
            default: 'en',
        },
    },
    radar: [
        {
            source: ['fcbayern.com/:language/news', 'fcbayern.com/:language'],
            target: '/news/:language',
        },
        {
            source: ['www.fcbayern.cn/news', 'www.fcbayern.cn'],
            target: '/news/zh',
        },
    ],
    name: 'News',
    maintainers: ['TonyRL'],
    handler,
    url: 'fcbayern.com',
};

async function handler(ctx: Context) {
    const { language = 'en' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')!, 10) : 20;

    if (language === 'zh') {
        return cnNewsHander(limit);
    }

    const baseUrl = 'https://fcbayern.com';
    const channelId = languages[language] ?? languages.en;

    const response = await ofetch(`${baseUrl}/graphql`, {
        method: 'POST',
        query: {
            client: 'fcbwebsite',
        },
        body: {
            operationName: 'Web_NewsSearch',
            variables: {
                query: '',
                filterTags: ['tag_club', 'tag_team_women', 'tag_team_campus', 'tag_article_news', 'tag_competitions_bundesliga', 'tag_competitions_champions-league', 'tag_column_saebener-stories', 'tag_club_magazin-51'],
                offset: 0,
                count: limit,
                channelId,
                filterSections: ['section_professionals', 'section_club', 'section_women', 'section_campus', 'section_aroundtheworld'],
                filterTypes: ['fcbhippo:ArticleDocument', 'fcbhippo:ImageGalleryDocument', 'fcbhippo:TeaserDocument'],
            },
            query,
        },
    });

    const items = response.data.newsSearch.results.map((item) => ({
        title: item.teaserTitle,
        description: item.teaserText,
        link: `${baseUrl}${item.teaserLink.target.path}`,
        pubDate: item.publicationDate ? parseDate(item.publicationDate) : undefined,
        image: item.teaserImage?.url,
        category: item.tag ? [item.tag] : undefined,
    }));

    return {
        title: 'FC Bayern München - News',
        link: `${baseUrl}/${language}/news`,
        language,
        image: `${baseUrl}/favicon.ico`,
        item: items,
    };
}
