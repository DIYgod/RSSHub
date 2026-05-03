import type { Router } from '@/types';

const router = (router: Router) => {
    router.get('/zl', './zl');
};

export default router;
