import type { Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.uol.com.br/esporte/futebol/campeonatos/';
const apiUrl = 'https://jcon.uol.com.br/front-jcon/v1/widget/contents/esporte?local=esporte-campeonatos';

/**
 * Gera uma rota para um campeonato específico do UOL Esporte.
 *
 * @param {string} subLocal - O identificador do campeonato na API (ex: 'brasileirao-serie-a').
 * @param {string} championshipName - O nome do campeonato para o título do feed (ex: 'Brasileirão').
 * @param {string} championshipSlug - O slug do campeonato para a URL da página (ex: 'brasileirao').
 * @param {string | undefined} limit - O número máximo de itens a serem retornados.
 * @param {string | undefined} filter - Uma regex para filtrar os títulos dos itens.
 * @returns {Promise<Data>} O objeto de dados do feed RSS.
 */
export const generateChampionshipRoute = async (subLocal: string, championshipName: string, championshipSlug: string, limit?: string, filter?: string): Promise<Data> => {
    const finalApiUrl = `${apiUrl}&sub-local=${subLocal}`;
    const pageUrl = `${rootUrl}${championshipSlug}/`;

    // Busca os dados da API, com cache para performance.
    // Esta abordagem é superior ao scraping de HTML, pois os dados já vêm estruturados
    // e não precisamos nos preocupar em filtrar tabelas de classificação.
    const apiResponse = await cache.tryGet(finalApiUrl, async () => {
        const response = await ofetch(finalApiUrl);
        return response.data[0].widgets;
    });

    let items: DataItem[] = apiResponse
        .flatMap((widget: any) => widget.data?.contents || [])
        .filter((content: any) => content.headline && content.url) // Garante que o item é uma notícia válida
        .map((content: any) => ({
            title: content.headline.trim(),
            link: content.url,
            description: content.summary?.trim(),
            pubDate: parseDate(content.publishedAt * 1000), // A API fornece um timestamp Unix
            author: content.authors?.[0]?.name,
        }));

    // Remove duplicatas baseadas no link
    items = items.filter((item, index, self) => index === self.findIndex((t) => t.link === item.link));

    // Aplica o filtro por título, se fornecido
    if (filter) {
        const regex = new RegExp(filter, 'i');
        items = items.filter((item) => item.title && regex.test(item.title));
    }

    // Aplica o limite de itens, com padrão 15 e máximo 50
    const limitParam = limit ? Number.parseInt(limit, 10) : 15;
    const finalLimit = Math.min(Math.max(limitParam, 1), 50);
    items = items.slice(0, finalLimit);

    return {
        title: `UOL Esporte – ${championshipName}`,
        link: pageUrl,
        item: items,
        description: `Notícias sobre ${championshipName} no UOL Esporte.`,
        language: 'pt-br',
    };
};
