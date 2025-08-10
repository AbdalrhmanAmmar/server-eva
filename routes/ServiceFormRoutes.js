import express from 'express';
import  {createSafetyRequest}  from '../controller/ServiceFormController.js';
import { isAuthenticated } from '../middleware/auth.js';


const router = express.Router();

router.post("/" ,createSafetyRequest)

export default router;