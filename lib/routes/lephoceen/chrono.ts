import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/chrono',
    categories: ['new-media'],
    example: '/lephoceen/chrono',
    parameters: {},
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
            source: ['lephoceen.fr/chrono'],
            target: '/chrono',
        },
    ],
    name: 'Fil Info Le Phocéen (Chrono)',
    maintainers: ['Loopy03'],
    handler: async (_) => {
        const response = await ofetch('https://www.lephoceen.fr/chrono');
        const $ = load(response);

        // Récupération du fichier json
        const jsonRaw = $('script[id="__NEXT_DATA__"]').html();
        const jsonData = JSON.parse(jsonRaw);

        // Tableau des articles via le chemin identifié du fichier json
        // Structure: props -> pageProps -> data -> datas
        const articles = jsonData?.props?.pageProps?.data?.datas || [];

        const items = articles.map((item: any) => {
            // Gestion du lien : le slug est relatif, on ajoute le domaine
            const baseUrl = 'https://www.lephoceen.fr';
            const link = item.slug.startsWith('http') ? item.slug : `${baseUrl}${item.slug}`;

            // Gestion de la date : Le JSON fournit un timestamp UNIX (en secondes)
            const pubDate = parseDate(item.date.publish_at.timestamp * 1000);

            return {
                title: item.title,
                link,
                description: item.text || `[${item.category?.name}] ${item.title}`,
                pubDate, // L'objet Date standard gère le fuseau correctement
                category: [item.category?.name],
                image: item.images?.['16x9']?.url,
            };
        });

        return {
            title: 'Le Phocéen - Fil Info',
            link: 'https://www.lephoceen.fr/chrono',
            item: items,
        };
    },
};
