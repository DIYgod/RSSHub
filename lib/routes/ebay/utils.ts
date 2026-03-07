import { CheerioAPI, Element } from 'cheerio';

/**
 * Transforms an eBay image URL to prefer WebP format if it's a JPG/JPEG.
 * @param url The original image URL.
 * @returns The transformed URL.
 */
export const transformImage = (url?: string): string | undefined => {
    if (!url) {
        return undefined;
    }
    // eBay images often look like https://i.ebayimg.com/images/g/.../s-l500.jpg
    // Replacing .jpg with .webp usually works if s-lXXX is used.
    return url.replace(/\.jpe?g$/i, '.webp');
};

/**
 * Common item structure for eBay routes.
 */
export interface eBayItem {
    title: string;
    link: string;
    description: string;
    category?: string;
    author?: string;
}

/**
 * Helper to extract common data from an eBay item element.
 * Note: Since selectors vary, this might be less useful than specific logic in each route,
 * but let's provide a way to standardize the output.
 */
export const createItem = (title: string, price: string, link: string, image?: string): eBayItem => ({
    title: `${title} - ${price}`,
    link,
    description: `<img src="${transformImage(image)}"><br>Price: ${price}`,
});
