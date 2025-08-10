import express from 'express';
import { addWarehouse, getAllWarehouses,getWarehouseById,updateWarehouse } from '../controller/warehouseController.js';
const router = express.Router();

router.post('/', addWarehouse);
router.get('/', getAllWarehouses);
router.get('/:id', getWarehouseById);
router.patch('/:id', updateWarehouse);

export default router;
