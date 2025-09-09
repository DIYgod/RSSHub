import type { Route } from '@/types';
import type { Context } from 'hono';
import { generateChampionshipRoute } from './utils';

export const route: Route = {
    path: '/brasileirao',
    categories: ['traditional-media'],
    example: '/uol/brasileirao',
    name: 'Brasileirão',
    maintainers: ['gemini-code-assist'],
    handler,
    url: 'esporte.uol.com.br/futebol/campeonatos/brasileirao/',
    description: 'Notícias do Campeonato Brasileiro.',
};

async function handler(ctx: Context) {
    const { limit, filter } = ctx.req.query();
    // Chama a função utilitária com os parâmetros específicos do Brasileirão
    return await generateChampionshipRoute('brasileirao-serie-a', 'Brasileirão', 'brasileirao', limit, filter);
}
