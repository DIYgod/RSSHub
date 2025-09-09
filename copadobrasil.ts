import type { Route } from '@/types';
import type { Context } from 'hono';
import { generateChampionshipRoute } from './utils';

export const route: Route = {
    path: '/copadobrasil',
    categories: ['traditional-media'],
    example: '/uol/copadobrasil',
    name: 'Copa do Brasil',
    maintainers: ['gemini-code-assist'],
    handler,
    url: 'esporte.uol.com.br/futebol/campeonatos/copa-do-brasil/',
    description: 'Notícias da Copa do Brasil.',
};

async function handler(ctx: Context) {
    const { limit, filter } = ctx.req.query();
    // Chama a função utilitária com os parâmetros específicos da Copa do Brasil
    return await generateChampionshipRoute('copa-do-brasil', 'Copa do Brasil', 'copa-do-brasil', limit, filter);
}
