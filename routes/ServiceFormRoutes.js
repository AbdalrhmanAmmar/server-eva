import express from 'express';
import  {createSafetyRequest, getServices}  from '../controller/ServiceFormController.js';


const router = express.Router();

router.post("/" ,createSafetyRequest)
router.get("/" ,getServices)

export default router;