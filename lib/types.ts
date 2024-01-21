export type DataItem = {
  title: string;
  description?: string;
  pubDate: number | string;
  link?: string;
  category?: string[];
  author?: string;
  doi?: string;

  _extra?: Record<string, any> & {
    links?: {
      url: string;
      type: string;
      content_html?: string;
    }[];
  };
}
export type Data = {
  title: string;
  description: string;
  link?: string;
  item: DataItem[];
  allowEmpty?: boolean;
}