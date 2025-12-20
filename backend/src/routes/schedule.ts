import { Router } from "express";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = Router()

router.post("/", verifyJWT,  (req, res) => {

})

export default router