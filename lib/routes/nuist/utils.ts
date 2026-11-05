import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

// These servers reset HTTP/2 connections before the TLS handshake completes.
export default got.extend({ allowH2: false });

export const parseCampusDate = (date: string | undefined) =>
    date
        ? parseDateInTimezone(
              date
                  .replaceAll(/[年月.]/g, '-')
                  .replace('日', '')
                  .trim(),
              8
          )
        : undefined;
