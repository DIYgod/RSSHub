import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/',
    categories: ['anime'],
    example: '/kzo.moe',
    name: 'Latest',
    maintainers: ['CoderTonyChan'],
    handler,
};

async function handler() {
    const link = 'https://kzo.moe/';
    const data = await ofetch(link);

    const items = data
        .matchAll(/disp_divinfo\(\s*"div_info_"\+"\d+",\s*"([^"]*)",\s*"([^"]*)",\s*"[^"]*",\s*"([^"]*)",\s*"[^"]*",\s*"([^"]*)",\s*"[^"]*",\s*"([^"]*)",\s*"([^"]*)",\s*"([^"]*)"/g)
        .toArray()
        .map(([, bookUrl, coverUrl, tagJp, tagEnd, score, name, author]) => ({
            title: name,
            description: `
            <img src="${coverUrl}" />
            <h1>${name}</h1>
            <h2>${author}</h2>
            <h2>${score}</h2>
            <h2>${[tagJp === '' ? '日語' : '', tagEnd === '' ? '完結' : ''].filter(Boolean).join(' ')}</h2>
        `.trim(),
            link: bookUrl,
        }));

    return {
        title: 'Kmoe',
        link,
        item: items,
    };
}
