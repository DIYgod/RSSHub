import crypto from 'node:crypto';

import { hextob64, KJUR } from 'jsrsasign';

import { config } from '@/config';
import ofetch from '@/utils/ofetch';

// The following constant is extracted from this script: https://file.caixin.com/pkg/cx-pay-layer/js/wap.js?v=5.15.421933 . It is believed to contain no sensitive information.
// Refer to this discussion for further explanation: https://github.com/DIYgod/RSSHub/pull/17231
const rsaPrivateKey =
    '-----BEGIN PRIVATE KEY-----MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCLci8q2u3NGFyFlMUwjCP91PsvGjHdRAq9fmqZLxvue+n+RhzNxnKKYOv35pLgFKWXsGq2TV+5Xrv6xZgNx36IUkqbmrO+eCa8NFmti04wvMfG3DCNdKA7Lue880daNiK3BOhlQlZPykUXt1NftMNS/z+e70W+Vpv1ZxCx5BipqZkdoceM3uin0vUQmqmHqjxi5qKUuov90dXLaMxypCA0TDsIDnX8RPvPtqKff1p2TMW2a0XYe7CPYhRggaQMpmo0TcFutgrM1Vywyr2TPxYR+H/tpuuWRET7tUIQykBYoO1WKfL2dX6cxarjAJfnYnod3sMzppHouyp8Pt7gHVG7AgMBAAECggEAEFshSy6IrADKgWSUyH/3jMNZfwnchW6Ar/9O847CAPQJ2yhQIpa/Qpnhs58Y5S2myqcHrUBgFPcWp3BbyGn43naAh8XahWHEcVjWl/N6BV9vM1UKYN0oGikDR3dljCBDbCIoPBBO3WcFOaXoIpaqPmbwCG1aSdwQyPUA0UzG08eDbuHK6L5jvbe3xv5kLpWTVddrocW+SakbZRAX1Ykp7IujOce235nM7GOfoq4b8jmK5CLg6VIZGQV20wnn9YxuFOndRSjneFberzfzBMhVLpPsQ16M2xDLpZaDTggZnq2L6nZygds8Hda++ga3WbD3TcgjJNYuENu1S88IowYhSQKBgQDFqRA+38mo6KsxVDCNWcuEk2hSq8NEUzRHJpS7/QjZmEIYpFzDXgSGwhZJ0WNsQtaxJeBbc7B/OOqh8TL1reLl5AdTimS1OLHWVf/MUsLVS7Y82hx/hpYWxZnRSq41oI3P8FO/53FiQMYo2wbwqF6uQjB1y8h58aqL3OYpTH/5xQKBgQC0mobALJ+bU4nCPzkVDZuD6RyNWPwS1aE3+925wDSN2rJ0iLIb4N5czWZmHb66VlAtfGbp2q+amsCV4r6UR19A/y8k9SFB0mdtxix6mjEfaGhVJm4B1mkvsn0OHMAanKkohUvCjROQc3sziyp2gqSEQ98G7//VMPx/3dhgyQpVfwKBgQCycsqu6N0n+D6t/0MCKiJaI7bYhCd7JN8aqVM4UN5PjG2Hz8PLwbK2cr0qkbaAA+vN7NMb3Vtn0FvMLnUCZqVlRTP0EQqQrYmoZuXUcpdhd8QkNgnqe/g+wND4qcKTucquA1uo8mtj9/Su5+bhGDC6hBk6D+uDZFHDiX/loyIavQKBgQCXF6AcLjjpDZ52b8Yloti0JtXIOuXILAlQeNoqiG5vLsOVUrcPM7VUFlLQo5no8kTpiOXgRyAaS9VKkAO4sW0zR0n9tUY5dvkokV6sw0rNZ9/BPQFTcDlXug99OvhMSzwJtlqHTNdNRg+QM6E2vF0+ejmf6DEz/mN/5e0cK5UFqQKBgCR2hVfbRtDz9Cm/P8chPqaWFkH5ulUxBpc704Igc6bVH5DrEoWo6akbeJixV2obAZO3sFyeJqBUqaCvqG17Xei6jn3Hc3WMz9nLrAJEI9BTCfwvuxCOyY0IxqAAYT28xYv42I4+ADT/PpCq2Dj5u43X0dapAjZBZDfVVis7q1Bw-----END PRIVATE KEY-----';

export async function getFulltext(url: string) {
    if (!config.caixin.cookie) {
        return;
    }
    if (!/(\d+)\.html/.test(url)) {
        return;
    }
    const articleID = url.match(/(\d+)\.html/)[1];

    const nonce = crypto.randomUUID().replaceAll('-', '').toUpperCase();

    const userID = config.caixin.cookie
        .split(';')
        .find((e) => e.includes('SA_USER_UID'))
        ?.split('=')[1]; //

    const rawString = `id=${articleID}&uid=${userID}&${nonce}=nonce`;

    const sig = new KJUR.crypto.Signature({ alg: 'SHA256withRSA' });
    sig.init(rsaPrivateKey);
    sig.updateString(rawString);
    const sigValueHex = hextob64(sig.sign());

    const isWeekly = url.includes('weekly');
    const res = await ofetch(`https://gateway.caixin.com/api/newauth/checkAuthByIdJsonp`, {
        query: {
            type: 1,
            page: isWeekly ? 0 : 1,
            rand: Math.random(),
            id: articleID,
        },
        headers: {
            'X-Sign': encodeURIComponent(sigValueHex),
            'X-Nonce': encodeURIComponent(nonce),
            Cookie: config.caixin.cookie,
        },
    });

    const { content = '', pictureList } = JSON.parse(res.data.match(/resetContentInfo\((.*)\)/)[1]);
    return content + (pictureList ? pictureList.map((e) => `<img src="${e.url}" id="picture_${e.id}" alt="${e.desc}"><dl><dt>${e.desc}</dt></dl>`).join('') : '');
}
