import http from 'node:http';
import https from 'node:https';

import { FormData, Headers, Request, Response } from 'undici';

import fetch from '@/utils/request-rewriter/fetch';
import getWrappedGet from '@/utils/request-rewriter/get';

Object.defineProperties(globalThis, {
    fetch: { value: fetch },
    Headers: { value: Headers },
    FormData: { value: FormData },
    Request: { value: Request },
    Response: { value: Response },
});

http.get = getWrappedGet(http.get);
http.request = getWrappedGet(http.request);
https.get = getWrappedGet(https.get);
https.request = getWrappedGet(https.request);
