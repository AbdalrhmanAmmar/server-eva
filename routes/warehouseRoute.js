import express from 'express';
import { addWarehouse, getAllWarehouses,getWarehouseById,updateWarehouse } from '../controller/warehouseController.js';
import { getProductsByWarehouse } from '../controller/productController.js';
const router = express.Router();

router.post('/', addWarehouse);
router.get('/', getAllWarehouses);
router.get('/:id', getWarehouseById);
router.get('/:warehouse/products', getProductsByWarehouse); 
router.patch('/:id', updateWarehouse);

export default router;
