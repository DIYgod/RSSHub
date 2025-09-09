import type { Route } from '@/types';
import type { Context } from 'hono';
import { generateChampionshipRoute } from './utils';

export const route: Route = {
    path: '/libertadores',
    categories: ['traditional-media'],
    example: '/uol/libertadores',
    name: 'Libertadores',
    maintainers: ['gemini-code-assist'],
    handler,
    url: 'esporte.uol.com.br/futebol/campeonatos/libertadores/',
    description: 'Notícias da Copa Libertadores.',
};

async function handler(ctx: Context) {
    const { limit, filter } = ctx.req.query();
    // Chama a função utilitária com os parâmetros específicos da Libertadores
    return await generateChampionshipRoute('libertadores', 'Libertadores', 'libertadores', limit, filter);
}
