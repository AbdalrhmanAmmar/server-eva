import express from "express";
import { CreateForm, getAllForms } from "../controller/FormController.js";
const router = express.Router();

router.post("/", CreateForm);
router.get("/", getAllForms);

export default router;