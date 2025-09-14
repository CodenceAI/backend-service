import express from 'express';
import { analyzeRepoService } from '../services/repoAnalyzer';
import { searchRepoService } from '../services/searchRepoService';

const router = express.Router();

router.post('/analyze', analyzeRepoService);
router.post('/search', searchRepoService);
export default router;
