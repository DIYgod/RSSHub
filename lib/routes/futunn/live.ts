import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Language, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/live/:lang?',
    categories: ['finance'],
    example: '/futunn/live',
    parameters: {
        lang: {
            description: '通知语言',
            default: 'Mandarin',
            options: [
                {
                    label: '国语',
                    value: 'Mandarin',
                },
                {
                    label: '粵語',
                    value: 'Cantonese',
                },
                {
                    label: 'English',
                    value: 'English',
                },
            ],
        },
    },
    features: {
        supportRadar: true,
        supportPodcast: true,
    },
    radar: [
        {
            source: ['news.futunn.com/main/live'],
            target: '/live',
        },
        {
            source: ['news.futunn.com/hk/main/live'],
            target: '/live/Cantonese',
        },
        {
            source: ['news.futunn.com/en/main/live'],
            target: '/live/English',
        },
    ],
    name: '快讯',
    maintainers: ['kennyfong19931'],
    handler,
};

async function handler(ctx) {
    const limit = getRouteLimit(ctx, 30);
    const lang = ctx.req.param('lang') ?? 'Mandarin';
    if (!['Mandarin', 'Cantonese', 'English'].includes(lang)) {
        throw new InvalidParameterError('lang must be Mandarin, Cantonese, or English.');
    }

    const rootUrl = 'https://news.futunn.com';
    const link = `${rootUrl}${lang === 'Mandarin' ? '' : lang === 'Cantonese' ? '/hk' : '/en'}/main/live`;
    const apiUrl = `${rootUrl}/news-site-api/main/get-flash-list?pageSize=${limit}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
        headers: {
            'x-news-site-lang': lang === 'Mandarin' ? 0 : lang === 'Cantonese' ? 1 : 2,
        },
    });

    const items = response.data.data.data.news.map((item) => {
        const audio = item.audioInfos?.find((audio) => audio.language === lang && audio.audioUrl);
        return {
            title: item.title || item.content,
            description: item.content,
            link: item.detailUrl,
            pubDate: parseDate(item.time * 1000),
            category: item.quote.map((quote) => quote.name),
            itunes_item_image: item.pic,
            ...(audio && {
                itunes_duration: audio.audioDuration,
                enclosure_url: audio.audioUrl,
                enclosure_type: 'audio/mpeg',
                media: {
                    content: {
                        url: audio.audioUrl,
                        type: 'audio/mpeg',
                        duration: audio.audioDuration,
                        language: lang === 'Mandarin' ? 'zh-CN' : lang === 'Cantonese' ? 'zh-HK' : 'en',
                    },
                    thumbnail: {
                        url: item.pic,
                    },
                },
            }),
        };
    });

    const language: Language = lang === 'Mandarin' ? 'zh-CN' : lang === 'Cantonese' ? 'zh-HK' : 'en';

    return {
        title: lang === 'Mandarin' ? '富途牛牛 - 快讯' : lang === 'Cantonese' ? '富途牛牛 - 快訊' : 'Futubull - Latest',
        link,
        item: items,
        language,
        itunes_author: lang === 'Mandarin' || lang === 'Cantonese' ? '富途牛牛' : 'Futubull',
        itunes_category: 'News',
    };
}
