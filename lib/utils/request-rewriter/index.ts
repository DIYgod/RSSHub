import http from 'node:http';
import https from 'node:https';

import { FormData, Headers, Request, Response } from 'undici';

import fetch from '@/utils/request-rewriter/fetch';
import getWrappedGet from '@/utils/request-rewriter/get';

Object.defineProperties(globalThis, {
    fetch: { value: fetch, writable: true, configurable: true },
    Headers: { value: Headers, writable: true, configurable: true },
    FormData: { value: FormData, writable: true, configurable: true },
    Request: { value: Request, writable: true, configurable: true },
    Response: { value: Response, writable: true, configurable: true },
});

http.get = getWrappedGet(http.get);
http.request = getWrappedGet(http.request);
https.get = getWrappedGet(https.get);
https.request = getWrappedGet(https.request);
