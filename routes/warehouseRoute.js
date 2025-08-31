import express from 'express';
import { addWarehouse, getAllWarehouses,getWarehouseById,updateWarehouse } from '../controller/warehouseController.js';
import { getProductsByWarehouse } from '../controller/ProductController.js';
const router = express.Router();

router.post('/', addWarehouse);
router.get('/', getAllWarehouses);
router.get('/:id', getWarehouseById);
router.patch('/:id', updateWarehouse);
router.get("/products/:warehouse",getProductsByWarehouse)

export default router;
