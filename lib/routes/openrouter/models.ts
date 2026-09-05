import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const baseUrl = 'https://openrouter.ai';

/** Predefined ranking categories present on OpenRouter, mapping URL slug / API key to display label. */
const categoryNames: Record<string, string> = {
    programming: 'Programming',
    finance: 'Finance',
    legal: 'Legal',
    health: 'Health',
    marketing: 'Marketing',
    'marketing/seo': 'SEO',
    seo: 'SEO',
    academia: 'Academia',
    science: 'Science',
    technology: 'Technology',
    translation: 'Translation',
    roleplay: 'Roleplay',
    trivia: 'Trivia',
};

export const route: Route = {
    path: '/models/:category?',
    categories: ['programming'],
    example: '/openrouter/models',
    parameters: {
        category: {
            description:
                'Filter discounted models by a ranking category. When omitted, all discounted models are returned in highest-to-lowest discount order. When a category is passed, models are filtered by that category and sorted by discount (high to low) with category ranking as secondary sort.',
            default: 'All discounted models',
            options: [
                { value: 'programming', label: 'Programming' },
                { value: 'finance', label: 'Finance' },
                { value: 'legal', label: 'Legal' },
                { value: 'health', label: 'Health' },
                { value: 'marketing', label: 'Marketing' },
                { value: 'seo', label: 'SEO' },
                { value: 'academia', label: 'Academia' },
                { value: 'science', label: 'Science' },
                { value: 'technology', label: 'Technology' },
                { value: 'translation', label: 'Translation' },
                { value: 'roleplay', label: 'Roleplay' },
                { value: 'trivia', label: 'Trivia' },
            ],
        },
    },
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
            source: ['openrouter.ai/models'],
            target: '/openrouter/models',
        },
    ],
    name: 'Discounted Models',
    maintainers: ['codacy20'],
    handler,
};

interface DiscountedModel {
    name: string;
    link: string;
    description: string;
    discount: number;
    categories: string[];
    rankByCategory: Record<string, number>;
}

async function handler(ctx) {
    const { category } = ctx.req.param();
    const rawRequested = (category ?? '').trim().toLowerCase();
    const requested = rawRequested === 'seo' ? 'marketing/seo' : rawRequested;
    const requestedCategory = categoryNames[rawRequested] ?? categoryNames[requested];
    const isFiltered = requestedCategory !== undefined;

    const cached = await cache.tryGet<DiscountedModel[]>('openrouter:discounted-models', fetchModels);

    const models = isFiltered
        ? [...cached].filter((model) => model.rankByCategory[requested] !== undefined).toSorted((a, b) => b.discount - a.discount || (a.rankByCategory[requested] ?? 0) - (b.rankByCategory[requested] ?? 0))
        : [...cached];

    const items = models.map((model) => ({
        title: `${model.name} - ${Math.round(model.discount * 100)}% off`,
        link: model.link,
        description: model.description,
        category: model.categories,
    }));

    return {
        title: isFiltered ? `OpenRouter ${requestedCategory} discounted models` : 'OpenRouter discounted models',
        link: `${baseUrl}/models?order=discount-high-to-low`,
        item: items,
    };
}

/** Fetches the discounted model list from OpenRouter frontend APIs. */
async function fetchModels(): Promise<DiscountedModel[]> {
    const [findResponse, catalogResponse] = await Promise.all([ofetch(`${baseUrl}/api/frontend/v1/models/find?active=true&fmt=cards&order=discount-high-to-low`), ofetch(`${baseUrl}/api/frontend/v1/catalog/models`)]);

    const catModels = Array.isArray(catalogResponse?.data) ? catalogResponse.data : (catalogResponse?.data?.models ?? []);
    const pricingMap = new Map<string, any>();
    for (const cm of catModels) {
        const pricing = cm.endpoint?.pricing;
        if (pricing) {
            if (cm.slug) {
                pricingMap.set(cm.slug, pricing);
            }
            if (cm.permaslug) {
                pricingMap.set(cm.permaslug, pricing);
            }
        }
    }

    const findModels = findResponse?.data?.models ?? [];
    const categoriesMap = findResponse?.data?.categories ?? {};

    const discountedModels: DiscountedModel[] = [];

    for (const m of findModels) {
        const slug = m.slug;
        const permaslug = m.permaslug;
        const pricing = pricingMap.get(slug) ?? pricingMap.get(permaslug) ?? {};
        const discount = Number(pricing.discount ?? 0);

        if (discount > 0) {
            const rawCategories = categoriesMap[permaslug] ?? categoriesMap[slug] ?? [];
            const rankByCategory: Record<string, number> = {};
            const categories: string[] = [];

            for (const cat of rawCategories) {
                const catName = cat.category?.toLowerCase();
                const rank = cat.rank;
                if (catName) {
                    rankByCategory[catName] = rank;
                    const displayName = categoryNames[catName] ?? catName;
                    if (!categories.includes(displayName)) {
                        categories.push(displayName);
                    }
                }
            }

            discountedModels.push({
                name: m.name,
                link: `${baseUrl}/${slug}`,
                description: m.description ?? '',
                discount,
                categories,
                rankByCategory,
            });
        }
    }

    return discountedModels;
}
