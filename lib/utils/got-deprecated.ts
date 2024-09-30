import logger from '@/utils/logger';
import { config } from '@/config';
import got, { CancelableRequest, Response as GotResponse, OptionsInit, Options, Got } from 'got';

type Response<T> = GotResponse<string> & {
    data: T;
    status: number;
};

type GotRequestFunction = {
    (url: string | URL, options?: Options): CancelableRequest<Response<Record<string, any>>>;
    <T>(url: string | URL, options?: Options): CancelableRequest<Response<T>>;
    (options: Options): CancelableRequest<Response<Record<string, any>>>;
    <T>(options: Options): CancelableRequest<Response<T>>;
};

// @ts-expect-error got instance with custom response type
const custom: {
    all?: <T>(list: Array<Promise<T>>) => Promise<Array<T>>;
    get: GotRequestFunction;
    post: GotRequestFunction;
    put: GotRequestFunction;
    patch: GotRequestFunction;
    head: GotRequestFunction;
    delete: GotRequestFunction;
} & GotRequestFunction &
    Got = got.extend({
    retry: {
        limit: config.requestRetry,
        statusCodes: [400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 421, 422, 423, 424, 426, 428, 429, 431, 451, 500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511, 521, 522, 524],
    },
    hooks: {
        beforeRetry: [
            (err, count) => {
                logger.error(`Request ${err.options.url} fail, retry attempt #${count}: ${err}`);
            },
        ],
        beforeRedirect: [
            (options, response) => {
                logger.http(`Redirecting to ${options.url} for ${response.requestUrl}`);
            },
        ],
        afterResponse: [
            // @ts-expect-error custom response type
            (response: Response<Record<string, any>>) => {
                try {
                    response.data = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
                } catch {
                    // @ts-expect-error for compatibility
                    response.data = response.body;
                }
                response.status = response.statusCode;
                return response;
            },
        ],
        init: [
            (
                options: OptionsInit & {
                    data?: string;
                }
            ) => {
                // compatible with axios api
                if (options && options.data) {
                    options.body = options.body || options.data;
                }
            },
        ],
    },
    headers: {
        'user-agent': config.ua,
    },
    timeout: {
        request: config.requestTimeout,
    },
});
custom.all = (list) => Promise.all(list);

export default custom;
export type { Response, Options } from 'got';
