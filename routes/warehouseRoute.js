import express from 'express';
import { addWarehouse, getAllWarehouses,updateWarehouse } from '../controller/warehouseController.js';

const router = express.Router();

router.post('/', addWarehouse);
router.get('/', getAllWarehouses);
router.patch('/:id', updateWarehouse);

export default router;
