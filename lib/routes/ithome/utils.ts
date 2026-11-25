import { parseDate } from '@/utils/time';

export const parseSourceDate = (value?: string) => (value ? parseDate(value, 8) : undefined);
