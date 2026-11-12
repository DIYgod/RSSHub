import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import NotFoundError from '@/errors/types/not-found';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const endPoints = {
    zh: {
        url: 'https://odinapi.asus.com.cn/',
        lang: 'cn',
        websiteCode: 'cn',
        supportOrigin: 'https://www.asus.com.cn',
        rogSupportOrigin: 'https://rog.asus.com.cn',
    },
    en: {
        url: 'https://odinapi.asus.com/',
        lang: 'en',
        websiteCode: 'global',
        supportOrigin: 'https://www.asus.com',
        rogSupportOrigin: 'https://rog.asus.com',
    },
};

export type Language = keyof typeof endPoints;

export type ProductInfo = {
    productID: string;
    hashId: string;
    url: string;
    title: string;
    image: string;
    m1Id: number;
    productLine: string;
};

export type SupportFile = {
    Id: string;
    Version: string;
    Title: string;
    Description: string | null;
    FileSize: string;
    ReleaseDate: string;
    DownloadUrl: {
        Global: string | null;
        China: string | null;
    };
    sha256?: string;
};

export type SupportFileGroup = {
    Name: string;
    Files: SupportFile[];
};

const globalDownloadOrigin = 'https://dlcdnets.asus.com';
const chinaDownloadOrigin = 'https://dlcdnets.asus.com.cn';

export const parseLanguage = (language: string = 'en'): Language => {
    if (!Object.hasOwn(endPoints, language)) {
        throw new InvalidParameterError('Invalid language. Use en for global or zh for Chinese ASUS support.');
    }
    return language as Language;
};

const normalizeModel = (model: string): string =>
    model
        .replace(/-model$/i, '')
        .toLowerCase()
        .replaceAll(/[^a-z\d]/g, '');

const matchesModel = (product, model: string): boolean => {
    const productSlug = new URL(product.Url).pathname.split('/').findLast((segment) => segment.length > 0);
    const names = [product.Title, ...product.Title.split(/[()/]/), productSlug].filter(Boolean);
    return names.some((name) => normalizeModel(name) === normalizeModel(model));
};

export const getProductInfo = (model: string, language: Language) => {
    const { url, lang, websiteCode } = endPoints[language];

    const searchAPI = `${url}recent-data/apiv2/SearchSuggestion?SystemCode=asus&WebsiteCode=${websiteCode}&SearchKey=${model}&SearchType=ProductsAll&RowLimit=4&sitelang=${lang}`;

    return cache.tryGet(`asus:product:${model}:${language}`, async (): Promise<ProductInfo> => {
        const response = await ofetch(searchAPI);
        // An unmatched search still returns recommended products, so its first item is not reliable.
        const product = response.Result?.flatMap((group) => group.Content ?? []).find((candidate) => matchesModel(candidate, model));
        if (!product) {
            throw new NotFoundError(`ASUS did not return a matching product for ${model}. Use the exact model name or product-page slug.`);
        }

        return {
            productID: product.DataId,
            hashId: product.HashId,
            url: product.Url,
            title: product.Title,
            image: product.ImageURL,
            m1Id: product.M1Id,
            productLine: product.ProductLine,
        };
    });
};

const isRogProduct = (productInfo: ProductInfo) => new URL(productInfo.url).hostname.startsWith('rog.');

/**
 * Builds a support API URL for the site that hosts the product's page.
 * The main site rejects some ROG products (e.g. ROG laptops), and the ROG site rejects non-ROG products.
 * Both need `model` and `cpu` to be present, even when empty, and products sold as a series need their `m1id`.
 */
const getSupportAPI = (productInfo: ProductInfo, language: Language, path: string, extraParams: Record<string, string> = {}) => {
    const { websiteCode, supportOrigin, rogSupportOrigin } = endPoints[language];
    const params = new URLSearchParams({
        website: websiteCode,
        model: '',
        pdid: productInfo.productID,
        m1id: String(productInfo.m1Id),
        cpu: '',
        ...extraParams,
    });
    return `${isRogProduct(productInfo) ? rogSupportOrigin : supportOrigin}/support/${path}?${params}`;
};

const getSupportResult = async (url: string, productInfo: ProductInfo) => {
    const response = await ofetch(url);
    if (response.Status !== 'SUCCESS' || !response.Result) {
        throw new NotFoundError(`ASUS support did not return downloads for ${productInfo.title}: ${response.Message ?? 'unknown error'}`);
    }
    return response.Result;
};

export const getBIOS = async (productInfo: ProductInfo, language: Language): Promise<SupportFileGroup[]> => {
    const result = await getSupportResult(getSupportAPI(productInfo, language, 'webapi/ProductV2/GetPDBIOS'), productInfo);
    return result.Obj;
};

export const getOperatingSystems = async (productInfo: ProductInfo, language: Language): Promise<Array<{ Id: string; Name: string }>> => {
    // The two sites serve the OS list from different endpoints.
    const path = isRogProduct(productInfo) ? 'webapi/product/GetPDOS' : 'api/product.asmx/GetPDOS';
    const result = await getSupportResult(getSupportAPI(productInfo, language, path), productInfo);
    return result.Obj;
};

export const getDrivers = async (productInfo: ProductInfo, language: Language, osId: string): Promise<SupportFileGroup[]> => {
    const result = await getSupportResult(getSupportAPI(productInfo, language, 'webapi/ProductV2/GetPDDrivers', { osid: osId }), productInfo);
    return result.Obj;
};

/**
 * Uses the file's own title, adding the version when the title does not already include it.
 * Files without a title (e.g. motherboard BIOS) fall back to `fallbackPrefix` plus the version.
 */
export const getFileTitle = (file: SupportFile, fallbackPrefix: string) => {
    if (!file.Title) {
        return `${fallbackPrefix} ${file.Version}`;
    }
    return file.Title.includes(file.Version) ? file.Title : `${file.Title} ${file.Version}`;
};

// Most download URLs are paths on the ASUS CDN, but some (e.g. Microsoft Store apps) are absolute.
const toDownloadUrl = (path: string, origin: string) => new URL(path, origin).href;

const getFileName = (url: string) => new URL(url).pathname.split('/').pop() || url;

export const renderFileDescription = (file: SupportFile, language: Language) => {
    const globalUrl = file.DownloadUrl.Global ? toDownloadUrl(file.DownloadUrl.Global, globalDownloadOrigin) : undefined;
    const chinaUrl = file.DownloadUrl.China ? toDownloadUrl(file.DownloadUrl.China, chinaDownloadOrigin) : undefined;

    return renderToString(
        language === 'zh' ? (
            <>
                <p>更新信息：</p>
                {raw(file.Description ?? '')}
                <p>版本: {file.Version}</p>
                <p>大小: {file.FileSize}</p>
                {file.sha256 ? <p>SHA-256: {file.sha256}</p> : null}
                {chinaUrl || globalUrl ? (
                    <p>
                        下载链接: {chinaUrl ? <a href={chinaUrl}>中国下载</a> : null}
                        {chinaUrl && globalUrl ? ' | ' : null}
                        {globalUrl ? <a href={globalUrl}>全球下载</a> : null}
                    </p>
                ) : null}
            </>
        ) : (
            <>
                <p>
                    <b>Changes:</b>
                </p>
                {raw(file.Description ?? '')}
                <p>
                    <b>Version:</b> {file.Version}
                </p>
                <p>
                    <b>Size:</b> {file.FileSize}
                </p>
                {file.sha256 ? (
                    <p>
                        <b>SHA-256:</b> {file.sha256}
                    </p>
                ) : null}
                {globalUrl ? (
                    <p>
                        <b>Download:</b> <a href={globalUrl}>{getFileName(globalUrl)}</a>
                    </p>
                ) : null}
            </>
        )
    );
};
