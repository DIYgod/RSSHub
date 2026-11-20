import type { Response as UndiciResponse } from 'undici';

import { config } from '@/config';

/**
 * Make the body of a response fail, which also stops the download, once more than `maxSize` bytes of it have been read
 * after `Content-Encoding` is decoded
 */
const limitResponseSize = <T extends Response | UndiciResponse>(response: T, maxSize = config.requestMaxResponseSize): T => {
    if (!response.body) {
        return response;
    }
    let size = 0;
    const body = (response.body as ReadableStream<Uint8Array>).pipeThrough(
        new TransformStream<Uint8Array, Uint8Array>({
            transform(chunk, controller) {
                size += chunk.byteLength;
                if (size > maxSize) {
                    controller.error(new Error(`Response body is larger than ${maxSize} bytes`));
                    return;
                }
                controller.enqueue(chunk);
            },
        })
    );
    const limited = new Response(body, { headers: response.headers as Headers });
    // not constructor options or, like the status 999 some sites answer with, refused by the constructor
    Object.defineProperties(limited, {
        status: { value: response.status },
        statusText: { value: response.statusText },
        ok: { value: response.ok },
        url: { value: response.url },
        redirected: { value: response.redirected },
        type: { value: response.type },
    });
    return limited as T;
};

export default limitResponseSize;
