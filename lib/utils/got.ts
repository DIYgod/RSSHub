import logger from '@/utils/logger';
import { config } from '@/config';
import got, { type Response, type NormalizedOptions, type Options } from 'got';

const custom: typeof got & {
    all?: <T>(list: Array<Promise<T>>) => Promise<Array<T>>;
} = got.extend({
    retry: {
        limit: config.requestRetry,
        statusCodes: [400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 421, 422, 423, 424, 426, 428, 429, 431, 451, 500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511, 521, 522, 524],
    },
    hooks: {
        beforeRetry: [
            (
                options: NormalizedOptions & {
                    retryCount?: number;
                },
                err,
                count
            ) => {
                logger.error(`Request ${options.url} fail, retry attempt #${count}: ${err}`);
                options.retryCount = count;
            },
        ],
        beforeRedirect: [
            (options, response) => {
                logger.http(`Redirecting to ${options.url} for ${response.requestUrl}`);
            },
        ],
        afterResponse: [
            (
                response: Response & {
                    data?: Record<string, any> | string;
                    status?: number;
                }
            ) => {
                try {
                    response.data = JSON.parse(response.body as string);
                } catch {
                    response.data = response.body as string;
                }
                response.status = response.statusCode;
                return response;
            },
        ],
        init: [
            (
                options: Options & {
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
export type { Response, NormalizedOptions, Options } from 'got';
