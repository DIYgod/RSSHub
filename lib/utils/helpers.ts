import { Context } from "hono";
import { ReadableStream } from "node:stream/web";

export const getRouteNameFromPath = (path: string) => {
  const p = path.split('/').filter(Boolean);
  if (p.length > 0) {
    return p[0];
  }
  return null;
}

export const getIp = (ctx: Context) => {
  return ctx.req.header('X-Real-IP') || ctx.req.header('X-Forwarded-For')
}

export const streamToString = async (stream: ReadableStream) => {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
  }
  const result = new TextDecoder('utf-8').decode(
    new Uint8Array(chunks.reduce((a, c) => a + c.length, 0))
  );
  return result;
}