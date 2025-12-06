import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

export const route: Route = {
    path: '/news/:lang/:department?',
    categories: ['government'],
    example: '/canada.ca/news/en/departmentfinance',
    parameters: { lang: 'Language, en or fr', department: '(optional) dprtmnt query value' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        // Department of Finance
        {
            source: [
                'www.canada.ca/:lang/department-finance.html',
                'www.canada.ca/:lang/ministere-finances.html',
                'www.canada.ca/:lang/department-finance/news/*',
                'www.canada.ca/:lang/ministere-finances/nouvelles/*',
                'www.canada.ca/:lang/news/advanced-news-search/news-results.html?_=1721141835413&dprtmnt=departmentfinance&start=&end=',
                'www.canada.ca/:lang/nouvelles/recherche-avancee-de-nouvelles/resultats-de-nouvelles.html?_=1727880781502&typ=&dprtmnt=departmentfinance&mnstr=&start=&end=',
            ],
            target: '/news/:lang/departmentfinance',
        },
        // Innovation, Science and Economic Development Canada
        {
            source: [
                'ised-isde.canada.ca/site/ised/:lang',
                'ised-isde.canada.ca/site/isde/:lang',
                'www.canada.ca/:lang/innovation-science-economic-development/news/*',
                'www.canada.ca/:lang/innovation-sciences-developpement-economique/nouvelles/*',
                'www.canada.ca/:lang/news/advanced-news-search/news-results.html?_=&dprtmnt=departmentofindustry&start=&end=',
                'www.canada.ca/:lang/nouvelles/recherche-avancee-de-nouvelles/resultats-de-nouvelles.html?_=&dprtmnt=departmentofindustry&start=&end=',
            ],
            target: '/news/:lang/departmentofindustry',
        },
        // All news
        {
            source: ['www.canada.ca/:lang/news/advanced-news-search/news-results.html', 'www.canada.ca/:lang/nouvelles/recherche-avancee-de-nouvelles/resultats-de-nouvelles.html'],
            target: '/news/:lang',
        },
    ],
    name: 'News by Department',
    maintainers: ['elibroftw'],
    handler,
    description: 'News from specific Canadian government departments',
};

async function handler(ctx) {
    const lang = ctx.req.param('lang');
    const department = ctx.req.param('department');

    const baseUrl = 'https://www.canada.ca';
    const pathMap = {
        en: '/en/news/advanced-news-search/news-results.html',
        fr: '/fr/nouvelles/recherche-avancee-de-nouvelles/resultats-de-nouvelles.html',
    };
    const departmentLinks = {
        en: {
            departmentfinance: 'https://www.canada.ca/en/department-finance.html',
            departmentofindustry: 'https://ised-isde.canada.ca/site/ised/en',
        },
        fr: {
            departmentfinance: 'https://www.canada.ca/fr/ministere-finances.html',
            departmentofindustry: 'https://ised-isde.canada.ca/site/isde/fr',
        },
    };
    const path = pathMap[lang];

    const currentUrl = department ? `${baseUrl}${path}?dprtmnt=${department}` : `${baseUrl}${path}`;

    const response = await ofetch(currentUrl);
    const $ = load(response);

    const list = $('article.item')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('h3 a');
            const title = $link.text().trim();
            const link = $link.attr('href');
            if (!link) {
                return null;
            }
            const pubDateStr = $item.find('time').attr('datetime');
            const pubDate = pubDateStr ? parseDate(pubDateStr) : undefined;
            const pText = $item.find('p').text();
            const departmentMatch = pText.match(/^([^|]+)\|/);
            const departmentName = departmentMatch ? departmentMatch[1].trim() : '';
            const categoryMatch = pText.match(/\| ([^|]+) \|/);
            const categoryStr = categoryMatch ? categoryMatch[1].trim() : '';
            const description = $item.find('p').last().text().trim();

            return {
                title,
                link: link.startsWith('http') ? link : `${baseUrl}${link}`,
                pubDate,
                category: categoryStr ? [categoryStr] : [],
                description,
                author: departmentName,
            };
        })
        .filter((item) => item !== null);

    return {
        title: department ? `${department.toUpperCase()} Canada` : 'Government of Canada News',
        link: department ? departmentLinks[lang][department] : currentUrl,
        item: list,
        language: lang,
    };
}
