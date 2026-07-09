import { config } from '@/config';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const siteUrl = 'https://www.jornaldeangola.ao';
export const apiRoot = 'https://kiami-ja-back.kiamisoft.ao/cms/api/v1';

/** Main navigation categories (id → Portuguese name). */
export const MENU_CATEGORIES: Record<number, string> = {
    1: 'Política',
    2: 'Regiões',
    3: 'Sociedade',
    4: 'Economia',
    5: 'Cultura',
    6: 'Desporto',
    7: 'Entrevista',
    8: 'Reportagem',
    9: 'Opinião',
    10: 'Mundo',
    11: 'Gente',
    41: 'Notícias',
};

const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': config.trueUA,
    Referer: `${siteUrl}/`,
};

/** Same rules as the site Angular `slugify` pipe. */
export function slugify(text: string): string {
    return text.replaceAll(/[ ,/]/g, (ch) => (ch === ' ' ? '-' : '')).toLowerCase();
}

/** Accent-insensitive key for matching user-provided slugs like `politica` → Política. */
export function normalizeKey(text: string): string {
    return slugify(text).normalize('NFD').replaceAll(/\p{M}/gu, '');
}

export function resolveCategoryId(input?: string): number | undefined {
    if (!input) {
        return undefined;
    }
    if (/^\d+$/.test(input)) {
        return Number(input);
    }
    const decoded = decodeURIComponent(input);
    const needle = normalizeKey(decoded);
    for (const [id, name] of Object.entries(MENU_CATEGORIES)) {
        if (normalizeKey(name) === needle || name.toLowerCase() === decoded.toLowerCase() || slugify(name) === slugify(decoded)) {
            return Number(id);
        }
    }
    return undefined;
}

export function categoryLabel(id?: number): string {
    if (id === undefined) {
        return 'Últimas';
    }
    return MENU_CATEGORIES[id] ?? `Categoria ${id}`;
}

interface ApiListItem {
    idNoticia: number;
    titulo: string;
    introducao?: string;
    dataNoticia?: string;
    imagemDeCapa?: string;
    textoImagemDeCapa?: string;
    autor?: string;
    destaque?: boolean;
    ultimaHora?: boolean;
    categoriasNoticia?: Array<{ idCategoriaNoticia: number; categoriaNoticia: string }>;
}

interface ApiDetail extends ApiListItem {
    noticia?: string;
    nomeUrl?: string;
    url?: string;
}

function articleLink(item: ApiListItem): string {
    const cat = item.categoriasNoticia?.[0];
    const catId = cat?.idCategoriaNoticia ?? 41;
    const catName = cat?.categoriaNoticia ?? MENU_CATEGORIES[catId] ?? 'Notícias';
    return `${siteUrl}/noticias/${catId}/${encodeURIComponent(slugify(catName))}/${item.idNoticia}/${encodeURIComponent(slugify(item.titulo))}`;
}

export function toDataItem(item: ApiListItem, description?: string): DataItem {
    const image = item.imagemDeCapa || undefined;
    const intro = item.introducao?.trim();
    const parts: string[] = [];
    if (image) {
        parts.push(`<img src="${image}" />`);
    }
    if (description) {
        parts.push(description);
    } else if (intro) {
        parts.push(intro);
    }

    return {
        title: item.titulo,
        link: articleLink(item),
        description: parts.join('<br>') || undefined,
        pubDate: item.dataNoticia ? timezone(parseDate(item.dataNoticia), 1) : undefined,
        author: item.autor?.trim() || undefined,
        category: item.categoriasNoticia?.map((c) => c.categoriaNoticia).filter(Boolean),
        guid: String(item.idNoticia),
        image,
    };
}

export async function fetchNewsList(options: { categoryId?: number; limit?: number; destaque?: boolean; ultimaHora?: boolean }): Promise<ApiListItem[]> {
    const { categoryId, limit = 20, destaque, ultimaHora } = options;
    const body: Record<string, unknown> = {
        titulo: '',
        noticia: '',
        idTipoNoticia: 0,
        destaque: destaque ?? false,
        privada: false,
        ultimaHora: ultimaHora ?? false,
        premium: false,
        codIdioma: 'pt',
        idEmpresa: 1,
        itensPorPagina: limit,
        pagina: 1,
    };
    if (categoryId !== undefined) {
        body.idsCategorias = [categoryId];
    }

    const data = await ofetch(`${apiRoot}/noticias`, {
        method: 'POST',
        headers,
        body,
    });

    return (data.objecto as ApiListItem[]) ?? [];
}

export function fetchNewsDetail(id: number): Promise<ApiDetail | null> {
    return cache.tryGet(`jornaldeangola:detalhe:${id}`, async () => {
        try {
            const data = await ofetch(`${apiRoot}/noticias/detalhe/${id}`, { headers });
            return (data.objecto as ApiDetail) ?? null;
        } catch {
            return null;
        }
    });
}

export function enrichItems(list: ApiListItem[], withFullText: boolean): Promise<DataItem[]> {
    if (!withFullText) {
        return Promise.resolve(list.map((item) => toDataItem(item)));
    }

    return Promise.all(
        list.map(async (item) => {
            const detail = await fetchNewsDetail(item.idNoticia);
            if (!detail) {
                return toDataItem(item);
            }
            return toDataItem(
                {
                    ...item,
                    ...detail,
                    categoriasNoticia: detail.categoriasNoticia?.length ? detail.categoriasNoticia : item.categoriasNoticia,
                },
                detail.noticia
            );
        })
    );
}
