import { load } from 'cheerio';
import sanitize from 'sanitize-html';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

/**
 * Parse item infos about a product page
 * @param url url of the product page
 * @returns
 */
export const getProductPage = (url: string): Promise<DataItem> =>
    cache.tryGet(url, async () => {
        const response = await ofetch(url);
        const $ = load(response);

        const product = $('#viewad-product');
        const sellerProfile = $('#viewad-profile-box');

        const title = product
            .find('#viewad-title')
            .find('.is-hidden') // Find all elements with class 'is-hidden'
            .remove() // Remove them
            .end() // Go back to the h1
            .text() // Get the text
            .trim();

        // price of the product
        const price =
            product.find('.boxedarticle--price').text().trim() + // price
            ' ' +
            product.find('.boxedarticle--details--shipping').text().trim(); // shipping price

        // address of the product
        const address = product.find('[itemprop="address"]').text().trim();

        // description of the product
        const descriptionHtml = product.find('[itemprop="description"]').html() || '';
        const description = sanitize(descriptionHtml, {
            allowedTags: ['br'],
        });

        // get images from page
        const images = product
            .find('#viewad-image')
            .toArray()
            .map((img) => ({
                src: $(img).attr('src'),
                alt: $(img).attr('alt'),
            }));

        // create html for images
        const imagesHtml = images
            .filter((img) => img.src)
            .map((img) => `<img src="${img.src}" alt="${img.alt}" />`)
            .join('<br>');

        const category = [
            ...$('.breadcrump .breadcrump-link')
                .toArray()
                .slice(1)
                .map((x) => $(x).text().trim()),
            product
                .find('.addetailslist--detail')
                .filter((i, el) => $(el).text().includes('Art'))
                .find('.addetailslist--detail--value')
                .text()
                .trim(),
        ].join(' > ');

        return {
            title,
            link: url,
            description: `${price}<br>${address}<br><br>${description}<br>${imagesHtml}<br>`,
            author: [
                {
                    name: sellerProfile.find('.userprofile-vip a').text().trim(),
                    url: sellerProfile.find('.userprofile-vip a').attr('href'),
                },
            ],
            category: [category],
        };
    });
