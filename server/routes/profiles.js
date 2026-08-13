import express from "express";

import { getProfiles, createProfile, updateProfile } from "../controllers/profileController.js";

const router = express.Router();

router.get("/", getProfiles);

router.post("/", createProfile);

router.patch("/:id", updateProfile)

export default router;
