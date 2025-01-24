import { AlertItem } from './types';

export const generateContent = (alertItem: AlertItem) => `
<p>${alertItem.description}</p>
<div>
  <div><strong>预警编号:</strong> ${alertItem.identifier}</div>
  <div><strong>发布时间:</strong> ${alertItem.ctime}</div>
</div>
`;
