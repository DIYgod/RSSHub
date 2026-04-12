import type { Route, DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface CircularEvent {
    id: number;
    title: string;
    teaser: string;
    description: string;
    keywords: string;
    ticketsType: string;
    ticketsUrl: string;
    ticketsCost: number;
    inscriptionDateInitial: string;
    inscriptionDateFinal: string;
    date: {
        initial: string;
        current: string;
        final: string;
    };
    recordDate: string;
    recordCategory: string[];
    imagen: string;
    url: string;
    categories: {
        tipo: { uid: number; name: string }[];
        areaTematica: { uid: number; name: string }[];
    };
    campus: string;
    campusUid: number;
    dependencia: {
        uid: number;
        name: string;
    };
    location: {
        uid: number;
        longitude: number;
        latitude: number;
        address: string;
    };
}

const CAMPUS_MAP: Record<string, number> = {
    bogota: 2,
    medellin: 3,
    manizales: 4,
    palmira: 5,
    amazonia: 6,
    orinoquia: 7,
    caribe: 8,
    tumaco: 11,
    'la paz': 12,
};

export const route: Route = {
    path: '/circular/:campus?/:category?',
    name: 'Circular UNAL — Agenda de eventos',
    url: 'circular.unal.edu.co',
    categories: ['university'],
    example: '/unal/circular',
    parameters: {
        campus: 'Campus/sede filter (optional). Options: `bogota`, `medellin`, `manizales`, `palmira`, `amazonia`, `orinoquia`, `caribe`, `tumaco`, `la-paz`. Defaults to all campuses.',
        category: 'Thematic area filter (optional). Options: `arte`, `ciencia`, `educacion`, `salud`, `sociedad`, `medio-ambiente`, `derechos`, `economia`. Defaults to all categories.',
    },
    maintainers: ['Asperjasp'],
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
            source: ['circular.unal.edu.co/'],
            target: '/unal/circular',
        },
    ],
    handler: async (ctx) => {
        const { campus, category } = ctx.req.param();

        const events: CircularEvent[] = await ofetch('https://circular.unal.edu.co/rest/eventos/');

        // Normalize campus param (handle hyphens and accents)
        const campusKey = campus?.toLowerCase().replace(/-/g, ' ');
        const campusUid = campusKey ? CAMPUS_MAP[campusKey] : undefined;

        // Category keyword map (partial match on areaTematica name)
        const categoryKeywords: Record<string, string> = {
            arte: 'Arte',
            ciencia: 'Ciencia',
            educacion: 'Educación',
            salud: 'Salud',
            sociedad: 'Sociedad',
            'medio-ambiente': 'Medio Ambiente',
            derechos: 'Derechos',
            economia: 'Economía',
        };
        const categoryFilter = category ? categoryKeywords[category.toLowerCase()] : undefined;

        const filtered = events.filter((e) => {
            if (campusUid && e.campusUid !== campusUid) {
                return false;
            }
            if (categoryFilter) {
                const areas = e.categories?.areaTematica?.map((a) => a.name) ?? [];
                if (!areas.some((a) => a.includes(categoryFilter))) {
                    return false;
                }
            }
            return true;
        });

        // Sort by next occurrence date ascending
        filtered.sort((a, b) => new Date(a.date.current).getTime() - new Date(b.date.current).getTime());

        const items: DataItem[] = filtered.map((e) => {
            const tipo = e.categories?.tipo?.map((t) => t.name).join(', ') ?? '';
            const area = e.categories?.areaTematica?.map((a) => a.name).join(', ') ?? '';
            const ticketInfo =
                e.ticketsType === 'ENTRADA_LIBRE'
                    ? 'Entrada libre'
                    : e.ticketsType === 'BOLETERIA'
                      ? `Con boletería${e.ticketsCost ? ` — $${e.ticketsCost}` : ''}`
                      : e.ticketsType ?? '';
            const inscription =
                e.inscriptionDateInitial
                    ? `<p><strong>Inscripciones:</strong> ${e.inscriptionDateInitial} → ${e.inscriptionDateFinal || 'N/A'}</p>`
                    : '';

            const description = `
<p><strong>${e.campus}</strong>${e.dependencia?.name ? ` — ${e.dependencia.name}` : ''}</p>
<p><strong>Fecha:</strong> ${e.date.current}${e.date.final && e.date.final !== e.date.current ? ` → ${e.date.final}` : ''}</p>
${e.location?.address ? `<p><strong>Lugar:</strong> ${e.location.address}</p>` : ''}
<p><strong>Tipo:</strong> ${tipo}${area ? ` | ${area}` : ''}</p>
<p><strong>Acceso:</strong> ${ticketInfo}</p>
${inscription}
${e.imagen ? `<p><img src="${e.imagen}" alt="${e.title}" /></p>` : ''}
${e.description}
${e.ticketsUrl ? `<p><a href="${e.ticketsUrl}">Obtener boletas</a></p>` : ''}
`;

            return {
                title: e.title,
                link: e.url,
                description,
                pubDate: parseDate(e.recordDate),
                category: [...(e.categories?.tipo?.map((t) => t.name) ?? []), ...(e.categories?.areaTematica?.map((a) => a.name) ?? []), e.campus],
                image: e.imagen || undefined,
                author: e.dependencia?.name,
            };
        });

        const campusLabel = campus ? ` — ${campus.charAt(0).toUpperCase() + campus.slice(1)}` : '';
        const categoryLabel = categoryFilter ? ` — ${categoryFilter}` : '';

        return {
            title: `Circular UNAL${campusLabel}${categoryLabel}`,
            link: 'https://circular.unal.edu.co/',
            description: 'Agenda Nacional de eventos y actividades académicas de la Universidad Nacional de Colombia',
            image: 'https://circular.unal.edu.co/typo3conf/ext/unal_skin_circular/Resources/Public/images/favicon.ico',
            item: items,
            language: 'es-CO',
        };
    },
};
