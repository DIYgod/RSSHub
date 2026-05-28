import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

/**
 * Resolve the Location string to locationId
 * @param location location string as entered into the Kleinanzeigen search
 * @returns
 */
export const resolveLocation = async (location: string) => {
    const url = new URL('https://www.kleinanzeigen.de/s-ort-empfehlungen.json');
    url.searchParams.append('query', location);

    // get url as string
    const urlString = url.toString();

    // fetch location recommendations
    const res = await cache.tryGet(urlString, async () => await ofetch<Record<`_${number}`, string>>(urlString));

    // find searched location and return it or null
    const locationEntry = Object.entries(res).findLast((x) => x[1] === location);
    if (!locationEntry) {
        return null;
    }

    return Number.parseInt(locationEntry[0].slice(1));
};
