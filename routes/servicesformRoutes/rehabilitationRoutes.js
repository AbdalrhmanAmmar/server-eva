import express from "express";
import { createRehabilitation, getRehabilitation, getRehabilitationById, updateRehabilitationStatus } from "../../controller/servicesformController/RehabilitationController.js";



const router = express.Router();


router.post("/", createRehabilitation)
router.get("/", getRehabilitation)

router.get("/:id", getRehabilitationById); // get by id
router.patch("/:id/status", updateRehabilitationStatus);

export default router;