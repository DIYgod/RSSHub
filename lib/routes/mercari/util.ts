import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';
import path from 'node:path';

import type { DataItem } from '@/types';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

import type { ItemDetail, SearchResponse, ShopItemDetail } from './types';

const rootURL = 'https://api.mercari.jp/';
const rootProductURL = 'https://jp.mercari.com/item/';
const rootShopProductURL = 'https://jp.mercari.com/shops/product/';
const searchURL = `${rootURL}v2/entities:search`;
const itemInfoURL = `${rootURL}items/get`;
const shopItemInfoURL = `${rootURL}v1/marketplaces/shops/products/`;
const uuidv4 = () => crypto.randomUUID();

const MercariStatus = {
    default: '',
    onsale: 'STATUS_ON_SALE',
    soldout: 'STATUS_SOLD_OUT',
} as const;

const MercariSort = {
    default: 'SORT_DEFAULT',
    create_time: 'SORT_CREATED_TIME',
    like: 'SORT_NUM_LIKES',
    score: 'SORT_SCORE',
    price: 'SORT_PRICE',
} as const;

const MercariOrder = {
    desc: 'ORDER_DESC',
    asc: 'ORDER_ASC',
} as const;

function bytesToBase64URL(b: Buffer): string {
    return b.toString('base64').replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function strToBase64URL(s: string): string {
    return bytesToBase64URL(Buffer.from(s, 'utf-8'));
}

function publicKeyToJWK(publicKey: crypto.KeyObject): any {
    const jwk = publicKey.export({ format: 'jwk' }) as { x: string; y: string };
    return {
        crv: 'P-256',
        kty: 'EC',
        x: jwk.x,
        y: jwk.y,
    };
}

function publicKeyToHeader(publicKey: crypto.KeyObject): any {
    return {
        typ: 'dpop+jwt',
        alg: 'ES256',
        jwk: publicKeyToJWK(publicKey),
    };
}

function derDecode(der: Buffer): { r: Buffer; s: Buffer } {
    let offset = 0;

    if (der[offset++] !== 0x30) {
        throw new Error('Invalid DER signature');
    }
    const lenInfo = readDerLength(der, offset);
    offset += lenInfo.bytesRead;

    if (der[offset++] !== 0x02) {
        throw new Error('Expected INTEGER for R');
    }
    const rLen = readDerLength(der, offset);
    offset += rLen.bytesRead;
    const r = der.subarray(offset, offset + rLen.length);
    offset += rLen.length;

    if (der[offset++] !== 0x02) {
        throw new Error('Expected INTEGER for S');
    }
    const sLen = readDerLength(der, offset);
    offset += sLen.bytesRead;
    const s = der.subarray(offset, offset + sLen.length);
    offset += sLen.length;

    if (offset !== der.length) {
        throw new Error('Extra bytes in DER signature');
    }

    return {
        r: fixBufferLength(r, 32),
        s: fixBufferLength(s, 32),
    };
}

function readDerLength(buf: Buffer, offset: number): { length: number; bytesRead: number } {
    const byte = buf[offset];
    if (byte < 0x80) {
        return { length: byte, bytesRead: 1 };
    }
    const bytesCount = byte & 0x7f;
    if (bytesCount > 4) {
        throw new Error('DER length too long');
    }

    let length = 0;
    for (let i = 0; i < bytesCount; i++) {
        length = (length << 8) | buf[offset + 1 + i];
    }
    return { length, bytesRead: 1 + bytesCount };
}

function fixBufferLength(buffer: Buffer, length: number): Buffer {
    if (buffer.length > length) {
        const start = buffer.length - length;
        return buffer.subarray(start);
    }
    if (buffer.length < length) {
        return Buffer.concat([Uint8Array.from(Buffer.alloc(length - buffer.length)), Uint8Array.from(buffer)]);
    }
    return buffer;
}

function generateDPOP({ uuid, method, url }: { uuid: string; method: string; url: string }): string {
    // Generate ECDSA key pair
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
        namedCurve: 'prime256v1',
    });

    // Create JWT payload
    const payload = {
        iat: Math.floor(Date.now() / 1000),
        jti: uuid,
        htu: url,
        htm: method.toUpperCase(),
    };

    // Create JWT header
    const header = publicKeyToHeader(publicKey);

    // Prepare signing input
    const headerB64 = strToBase64URL(JSON.stringify(header));
    const payloadB64 = strToBase64URL(JSON.stringify(payload));
    const signingInput = `${headerB64}.${payloadB64}`;

    // Sign the input
    const sign = crypto.createSign('SHA256');
    sign.update(signingInput);
    const derSignature = sign.sign(privateKey);

    // Process signature
    const { r, s } = derDecode(derSignature);
    const signature = bytesToBase64URL(Buffer.concat([Uint8Array.from(r), Uint8Array.from(s)]));

    return `${signingInput}.${signature}`;
}

const fetchFromMercari = async <T>(url: string, data: any, method: 'POST' | 'GET' = 'POST'): Promise<T> => {
    const DPOP = generateDPOP({
        uuid: uuidv4(),
        method,
        url,
    });

    const headers = new Headers({
        DPOP,
        'X-Platform': 'web',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json; charset=utf-8',
    });

    const options = {
        method,
        headers,
        body: method === 'POST' ? JSON.stringify(data) : undefined,
        query: method === 'GET' ? data : undefined,
    };

    try {
        return await ofetch<T>(url, options);
    } catch (error) {
        throw new Error(`API request failed: ${error}`);
    }
};

const pageToPageToken = (page: number): string => {
    if (page === 0) {
        return '';
    }
    return `v1:${page}`;
};

interface SearchOptions {
    categoryId?: number[];
    brandId?: number[];
    priceMin?: number;
    priceMax?: number;
    itemConditionId?: number[];
    excludeKeyword?: string;
    itemTypes?: string[];
    attributes?: Array<{
        id: string;
        values: string[];
    }>;
}

const fetchSearchItems = async (sort: string, order: string, status: string[], keyword: string, options: SearchOptions = {}): Promise<SearchResponse> => {
    const data = {
        userId: `MERCARI_BOT_${uuidv4()}`,
        pageSize: 120,
        pageToken: pageToPageToken(0),
        searchSessionId: uuidv4(),
        indexRouting: 'INDEX_ROUTING_UNSPECIFIED',
        thumbnailTypes: [],
        searchCondition: {
            keyword,
            excludeKeyword: options.excludeKeyword || '',
            sort,
            order,
            status: status || [],
            sizeId: [],
            categoryId: options.categoryId || [],
            brandId: options.brandId || [],
            sellerId: [],
            priceMin: options.priceMin || 0,
            priceMax: options.priceMax || 0,
            itemConditionId: options.itemConditionId || [],
            shippingPayerId: [],
            shippingFromArea: [],
            shippingMethod: [],
            colorId: [],
            hasCoupon: false,
            attributes: options.attributes || [],
            itemTypes: options.itemTypes || [],
            skuIds: [],
            shopIds: [],
            excludeShippingMethodIds: [],
        },
        serviceFrom: 'suruga',
        withItemBrand: true,
        withItemSize: false,
        withItemPromotions: true,
        withItemSizes: true,
        withShopname: false,
        useDynamicAttribute: true,
        withSuggestedItems: true,
        withOfferPricePromotion: true,
        withProductSuggest: true,
        withParentProducts: false,
        withProductArticles: true,
        withSearchConditionId: true,
        withAuction: true,
    };

    logger.debug(JSON.stringify(data));
    return await fetchFromMercari<SearchResponse>(searchURL, data, 'POST');
};

const fetchItemDetail = (item_id: string, item_type: string, country_code?: string): Promise<ItemDetail | ShopItemDetail> => {
    if (item_type === 'ITEM_TYPE_BEYOND') {
        return fetchFromMercari<ShopItemDetail>(
            shopItemInfoURL + item_id,
            {
                view: 'FULL',
                imageType: 'JPEG',
            },
            'GET'
        );
    }

    return fetchFromMercari<ItemDetail>(
        itemInfoURL,
        {
            id: item_id,
            country_code,
            include_item_attributes: true,
            include_product_page_component: true,
            include_non_ui_item_attributes: true,
            include_donation: true,
            include_offer_like_coupon_display: true,
            include_offer_coupon_display: true,
            include_item_attributes_sections: true,
            include_auction: false,
        },
        'GET'
    );
};

const formatItemDetail = (detail: ItemDetail | ShopItemDetail): DataItem => {
    if ((detail as ShopItemDetail).displayName) {
        const shopItemDetail = detail as ShopItemDetail;
        return {
            title: shopItemDetail.displayName,
            description: art(path.join(__dirname, 'templates/shopItem.art'), shopItemDetail),
            pubDate: parseDate(shopItemDetail.createTime),
            guid: shopItemDetail.name,
            link: `${rootShopProductURL}${shopItemDetail.name}`,
            image: shopItemDetail.thumbnail,
            language: 'ja',
            author: shopItemDetail.productDetail.shop.displayName,
            updated: parseDate(shopItemDetail.updateTime),
        };
    }

    const itemDetail = detail as ItemDetail;
    return {
        title: itemDetail.data.name,
        description: art(path.join(__dirname, 'templates/item.art'), itemDetail),
        pubDate: parseDate(itemDetail.data.created * 1000),
        guid: itemDetail.data.id,
        link: `${rootProductURL}${itemDetail.data.id}`,
        image: itemDetail.data.thumbnails[0],
        language: 'ja',
        author: itemDetail.data.seller.name,
        updated: parseDate(itemDetail.data.updated * 1000),
    };
};

export { fetchItemDetail, fetchSearchItems, formatItemDetail, MercariOrder, MercariSort, MercariStatus };
