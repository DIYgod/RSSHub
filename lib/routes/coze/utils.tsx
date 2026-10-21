import { renderToString } from 'hono/jsx/dom/server';
import JSONbig from 'json-bigint';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const baseUrl = 'https://www.coze.cn';
const parseResponse = JSONbig({ storeAsString: true }).parse;
const productTypes = {
    agent: { entityType: 1, name: '智能体', path: '/store/agent' },
    project: { entityType: 6, name: '项目', path: '/store/agent' },
    template: { entityType: 20, name: '模板', path: '/template' },
};

interface ProductMeta {
    id: string;
    entity_type: number;
    entity_version?: number;
    name: string;
    description?: string;
    listed_at?: number;
    category?: { name: string };
    covers?: Array<{ url: string }>;
    readme?: string;
    introduction?: { introduction: string };
    user_info?: { user_id: string | number; name: string };
}

interface Product {
    meta_info: ProductMeta;
}

interface ProductListResponse {
    code: number;
    message: string;
    data?: { products: Product[] };
}

interface DeltaZone {
    ops?: Array<{ insert?: string | object }>;
}

export function getProductType(type: string) {
    if (!Object.hasOwn(productTypes, type)) {
        throw new InvalidParameterError('The product type must be agent, project, or template.');
    }
    return productTypes[type as keyof typeof productTypes];
}

export function getLimit(value?: string) {
    const requested = Number.parseInt(value ?? '20') || 20;
    return Math.max(1, Math.min(20, requested));
}

const getProductLink = (meta: ProductMeta) => {
    switch (meta.entity_type) {
        case 1:
            return `${baseUrl}/store/agent/${meta.id}`;
        case 6:
            return `${baseUrl}/store/project/${meta.id}`;
        case 21:
            return `${baseUrl}/template/agent/${meta.id}`;
        case 23:
        case 25:
            return `${baseUrl}/template/workflow/${meta.id}?entity_type=${meta.entity_type}`;
        case 26:
            return `${baseUrl}/template/project/${meta.id}`;
        default:
            throw new Error(`Coze returned an unsupported product type (${meta.entity_type}).`);
    }
};

function getIntroduction(meta: ProductMeta) {
    const value = meta.readme || meta.introduction?.introduction;
    if (!value) {
        return '';
    }
    try {
        const zones = JSON.parse(value) as Record<string, DeltaZone>;
        return Object.values(zones)
            .flatMap((zone) => zone.ops ?? [])
            .map((operation) => (typeof operation.insert === 'string' ? operation.insert : ''))
            .join('');
    } catch {
        return value;
    }
}

export const getItems = (products: Product[]): DataItem[] =>
    products.map(({ meta_info: meta }) => ({
        title: meta.name,
        link: getProductLink(meta),
        guid: meta.entity_version ? `${meta.id}:${meta.entity_version}` : meta.id,
        author: meta.user_info?.name,
        pubDate: meta.listed_at ? parseDate(meta.listed_at, 'X') : undefined,
        category: meta.category?.name ? [meta.category.name] : undefined,
        description: renderToString(
            <>
                {meta.description ? <p>{meta.description}</p> : undefined}
                {meta.covers?.map((cover) => (
                    <img src={cover.url} />
                ))}
                <div style="white-space: pre-wrap">{getIntroduction(meta)}</div>
            </>
        ),
    }));

export async function getProducts(type: string, limit: number, userId?: string) {
    const { entityType } = getProductType(type);
    const response = await ofetch<ProductListResponse>(`${baseUrl}/api/marketplace/product/${userId ? 'user_product/list' : 'list'}`, {
        parseResponse,
        query: userId ? { entity_type: entityType, user_id: userId, source: 1, cursor: 0, limit } : { entity_type: entityType, page_num: 1, page_size: limit, sort_type: 2 },
    });
    if (response.code !== 0 || !Array.isArray(response.data?.products)) {
        throw new Error(`Coze did not return a public product list (${response.code}: ${response.message}).`);
    }
    const products = response.data.products;
    if (userId && products.some((product) => String(product.meta_info.user_info?.user_id) !== userId)) {
        throw new Error('Coze returned products from a different creator. Check the numeric user ID in the profile URL.');
    }
    return products;
}
