const querystring = require('querystring');
const got = require('@/utils/got');

const API_KEY = 'ba0c2dad52b3ec';
const SEARCH_ENDPOINT = 'https://api.leboncoin.fr/finder/search';

// convert the querystring read from the url to the object expected by the rest API
const convertQueryToFilters = (query) => {
    const queryObject = querystring.parse(query);

    const filters = { keywords: {}, location: {}, ranges: {}, enums: {} };

    queryObject.ad_type = queryObject.ad_type || 'offer';

    for (const [key, value] of Object.entries(queryObject)) {
        // category
        if (key === 'category') {
            filters.category = { id: queryObject.category };
            continue;
        }

        // location.locations
        if (key === 'locations') {
            filters.location.locations = value
                .split(',')
                .map((l) => {
                    if (l.startsWith('r_')) {
                        return { locationType: 'region', region_id: l.slice(2) };
                    }
                    if (l.startsWith('dn_')) {
                        return { locationType: 'department_near', department_id: l.slice(3) };
                    }

                    if (l.startsWith('d_')) {
                        return { locationType: 'department', department_id: l.slice(2) };
                    }

                    {
                        if (l.match(/.+_.+/)) {
                            const [city, zipcode] = l.split('_');
                            return { locationType: 'city', city, zipcode };
                        }
                    }
                    return undefined;
                })
                .filter(Boolean);

            continue;
        }

        // keywords.text
        if (key === 'text') {
            filters.keywords.text = value;

            continue;
        }

        // location.area
        if (key === 'lat' || key === 'lng' || key === 'radius') {
            filters.location.area = {
                lat: parseFloat(queryObject.lat),
                lng: parseFloat(queryObject.lng),
                radius: parseFloat(queryObject.radius),
            };
            continue;
        }

        // range type
        {
            const m = value.match(/^(\d+|min)-(\d+|max)$/);

            if (m) {
                const [, min, max] = m;

                filters.ranges = filters.ranges || {};
                filters.ranges[key] = {};
                if (min !== 'min') {
                    filters.ranges[key].min = parseInt(min);
                }
                if (max !== 'max') {
                    filters.ranges[key].max = parseInt(max);
                }

                continue;
            }
        }

        // enum type
        filters.enums[key] = value.split(',');
    }

    return filters;
};

const buildDescription = (ad) =>
    // the description is made of
    // - first the thumbnail
    // - the ad description
    // - all the images in thumbnail version, and link to large version
    [
        (ad.images && ad.images.thumb_url && `<img src="${ad.images.thumb_url}">`) || '',
        '',
        ...ad.body.split(/\n/),
        '',
        ((ad.images && ad.images.urls_thumb && ad.images.urls_thumb.map((url, i) => `<a href=${ad.images.urls_large[i]}><img src="${url}"></a>`)) || []).join(''),
    ].join('<br>');

module.exports = async (ctx) => {
    const query = ctx.params.query;

    const response = await got({
        headers: {
            api_key: API_KEY,
            origin: 'https://www.leboncoin.fr',
            Accept: '*/*',
        },
        method: 'post',
        url: SEARCH_ENDPOINT,
        body: JSON.stringify({ filters: convertQueryToFilters(query), limit: 50, limit_alu: 3, sort_by: 'time', sort_order: 'desc' }),
    });

    ctx.state.data = {
        title: `ads for ${query.replace(/&/g, ' ')}`,
        description: `ads for ${query.replace(/&/g, ' ')}`,
        link: `https://www.leboncoin.fr/recherche/?${query}`,
        language: 'fr',
        item: (response.data.ads || [])
            .filter((ad) => ad.status === 'active')
            .map((ad) => ({
                title: (ad.price && ad.price[0] ? `${ad.price[0]}€ - ` : '') + ad.subject,
                description: buildDescription(ad),
                pubDate: new Date(ad.first_publication_date).toUTCString(),
                link: ad.url,
            })),
    };
};
