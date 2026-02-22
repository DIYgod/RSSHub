import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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

        const items = $('a[class*="chrono_actu"]')
            .toArray()
            .map((item) => {
                const element = $(item);

                const title = element.find('span[class*="chrono_title"]').text().trim();
                const timeStr = element.find('span[class*="chrono_date"]').text().trim();
                const category = element.find('span[class*="chrono_category"]').text().trim();
                const link = element.attr('href');

                let pubDate;

                if (timeStr.includes('/')) {
                    // CAS 1 : C'est une date "21/02" (Articles anciens)
                    const [day, month] = timeStr.split('/');
                    const currentYear = new Date().getFullYear();

                    // On force midi pour éviter les soucis de fuseau horaire sur les jours passés
                    const cleanDateStr = `${currentYear}-${month}-${day} 12:00`;
                    pubDate = parseDate(cleanDateStr);

                    // Si la date générée est dans le futur (ex: on est en janvier, l'article est de décembre), on enlève 1 an
                    if (pubDate > new Date()) {
                        pubDate.setFullYear(pubDate.getFullYear() - 1);
                    }
                } else {
                    // CAS 2 : C'est une heure "11:04" (Aujourd'hui)
                    // On récupère la date d'aujourd'hui manuellement
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = now.getMonth() + 1; // getMonth() commence à 0
                    const day = now.getDate();

                    // On reconstruit une chaine parfaite : "2024-02-22 11:04"
                    const fullDateStr = `${year}-${month}-${day} ${timeStr}`;

                    // Là, parseDate ne peut pas se tromper
                    pubDate = parseDate(fullDateStr);
                }

                return {
                    title,
                    link,
                    description: `[${category}] ${title}`,
                    // On applique le fuseau horaire Paris (+1)
                    pubDate: timezone(pubDate, +1),
                    category: [category],
                };
            });

        return {
            title: 'Le Phocéen - Fil Info',
            link: 'https://www.lephoceen.fr/chrono',
            item: items,
        };
    },
};
