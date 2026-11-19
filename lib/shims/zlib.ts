// zlib for CommonJS dependencies in Cloudflare Workers, handed out by the node:module shim
import zlib from 'node:zlib';

// workerd grows the output of the sync zlib calls 40 KiB at a time
const WORKERD_CHUNK_SIZE = 40 * 1024;

// workerd throws "Memory limit exceeded" when the output has to grow past maxOutputLength on the way
// to a size that still fits in it, which is where adm-zip puts the limit (the size of the entry).
// Leave room for one more chunk and check the limit here instead.
// Not needed once the runtime has https://github.com/cloudflare/workerd/pull/8642
export const inflateRawSync: typeof zlib.inflateRawSync = (buffer, options) => {
    const maxOutputLength = options?.maxOutputLength;
    if (maxOutputLength === undefined) {
        return zlib.inflateRawSync(buffer, options);
    }
    const result = zlib.inflateRawSync(buffer, { ...options, maxOutputLength: maxOutputLength + WORKERD_CHUNK_SIZE });
    if (result.length > maxOutputLength) {
        throw Object.assign(new RangeError(`Cannot create a Buffer larger than ${maxOutputLength} bytes`), { code: 'ERR_BUFFER_TOO_LARGE' });
    }
    return result;
};

export default { ...zlib, inflateRawSync };
