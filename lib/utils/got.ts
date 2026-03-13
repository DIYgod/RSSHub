import { destr } from 'destr';

import ofetch from '@/utils/ofetch';

import { getSearchParamsString } from './helpers';

const getFakeGot = (defaultOptions?: any) => {
    const fakeGot = (request, options?: any) => {
        if (!(typeof request === 'string' || request instanceof Request) && request.url) {
            options = {
                ...request,
                ...options,
            };
            request = request.url;
        }
        if (options?.hooks?.beforeRequest) {
            for (const hook of options.hooks.beforeRequest) {
                hook(options);
            }
            delete options.hooks;
        }

        options = {
            ...defaultOptions,
            ...options,
        };

        if (options?.json && !options.body) {
            options.body = options.json;
            delete options.json;
        }
        if (options?.form && !options.body) {
            options.body = new URLSearchParams(options.form as Record<string, string>).toString();
            if (!options.headers) {
                options.headers = {};
            }
            options.headers['content-type'] = 'application/x-www-form-urlencoded';
            delete options.form;
        }
        if (options?.searchParams) {
            request += '?' + getSearchParamsString(options.searchParams);
            delete options.searchParams;
        }

        // Add support for buffer responseType, to be compatible with got
        options.parseResponse = (responseText) => ({
            data: destr(responseText),
            body: responseText,
        });

        if (options?.responseType === 'buffer' || options?.responseType === 'arrayBuffer') {
            options.responseType = 'arrayBuffer';
            delete options.parseResponse;
        }

        if (options.cookieJar) {
            const cookies = options.cookieJar.getCookiesSync(request);
            if (cookies.length) {
                if (!options.headers) {
                    options.headers = {};
                }
                options.headers.cookie = cookies.join('; ');
            }
            delete options.cookieJar;
        }

        const response = ofetch(request, options);

        if (options?.responseType === 'arrayBuffer') {
            return response.then((responseData) => ({
                data: Buffer.from(responseData),
                body: Buffer.from(responseData),
            }));
        }
        return response;
    };

    fakeGot.get = (request, options?) => fakeGot(request, { ...options, method: 'GET' });
    fakeGot.post = (request, options?) => fakeGot(request, { ...options, method: 'POST' });
    fakeGot.put = (request, options?) => fakeGot(request, { ...options, method: 'PUT' });
    fakeGot.patch = (request, options?) => fakeGot(request, { ...options, method: 'PATCH' });
    fakeGot.head = (request, options?) => fakeGot(request, { ...options, method: 'HEAD' });
    fakeGot.delete = (request, options?) => fakeGot(request, { ...options, method: 'DELETE' });
    fakeGot.extend = (options) => getFakeGot(options);

    return fakeGot;
};

export default getFakeGot();
