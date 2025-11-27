import type { Data, Route } from '@/types';
import got from '@/utils/got';

import { mapPostToItem } from './utils';

const categories = [
    { value: 'interview', label: 'इंटरव्यू', id: 92820 },
    { value: 'audio', label: 'ऑडियो', id: 5153 },
    { value: 'kala-sahitya', label: 'कला-साहित्य', id: 101061 },
    { value: 'campus', label: 'कैंपस', id: 5261 },
    { value: 'covid-19', label: 'कोविड-19', id: 73034 },
    { value: 'jan-ki-baat', label: 'जन की बात', id: 985 },
    { value: 'duniya', label: 'दुनिया', id: 33 },
    { value: 'north-east', label: 'नॉर्थ ईस्ट', id: 5834 },
    { value: 'prasangik', label: 'प्रासंगिक', id: 3394 },
    { value: 'bharat', label: 'भारत', id: 30 },
    { value: 'media', label: 'मीडिया', id: 3338 },
    { value: 'media-bol', label: 'मीडिया बोल', id: 7963 },
    { value: 'rajneeti', label: 'राजनीति', id: 31 },
    { value: 'vichar', label: 'विचार', id: 73061 },
    { value: 'vigyan', label: 'विज्ञान', id: 32 },
    { value: 'vishesh', label: 'विशेष', id: 2494 },
    { value: 'video', label: 'वीडियो', id: 34 },
    { value: 'samaj', label: 'समाज', id: 28 },
    { value: 'ham-bhi-bharat', label: 'हम भी भारत', id: 14383 },
    { value: 'hamare-bare-mein', label: 'हमारे बारे में', id: 29 },
];

export const route: Route = {
    path: '/category/:category',
    categories: ['new-media'],
    example: '/thewirehindi/category/bharat',
    parameters: {
        category: {
            description: 'Category name',
            options: categories.map(({ value, label }) => ({ value, label })),
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
            source: ['thewirehindi.com/category/*'],
        },
    ],
    name: 'Category',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'thewirehindi.com/',
};

async function handler(ctx) {
    const { category } = ctx.req.param();
    const categoryData = categories.find((cat) => cat.value === category);

    if (!categoryData) {
        throw new Error(`Category "${category}" not found`);
    }

    const apiUrl = `https://thewirehindi.com/wp-json/wp/v2/posts?categories=${categoryData.id}&_embed`;
    const { data } = await got(apiUrl);

    const items = data.map((v) => mapPostToItem(v));

    return {
        title: `The Wire Hindi - ${categoryData.label}`,
        link: `https://thewirehindi.com/category/${category}/`,
        item: items,
        description: `Latest news from The Wire Hindi - ${categoryData.label} category`,
        logo: 'https://thewirehindi.com/wp-content/uploads/2023/05/cropped-The-wire-32x32.jpeg',
        language: 'hi',
    } as Data;
}
