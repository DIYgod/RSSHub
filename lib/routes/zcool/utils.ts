import { renderWork } from './templates/work';

const extractArticle = (data) => data.props.pageProps.data.summary + data.props.pageProps.data.memo;

const extractWork = (data) => renderWork(data.props.pageProps.data);

export { extractArticle, extractWork };
