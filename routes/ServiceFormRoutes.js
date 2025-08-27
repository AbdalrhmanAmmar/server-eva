import express from 'express';
import  {createSafetyRequest, getSafetyRequestById, getServices, updateSafetyRequestStatus}  from '../controller/ServiceFormController.js';


const router = express.Router();

router.post("/" ,createSafetyRequest)
router.get("/" ,getServices)
router.patch('/:id/status', updateSafetyRequestStatus);
router.get('/:id', getSafetyRequestById); 



export default router;