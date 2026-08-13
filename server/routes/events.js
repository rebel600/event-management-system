import express from "express";

import {
  getEvents,
  createEvent,
  updateEvent,
} from "../controllers/eventController.js";

import { getEventLogs } from "../controllers/eventLogController.js";

const router = express.Router();

router.get("/", getEvents);
router.post("/", createEvent);
router.patch("/:id", updateEvent);
router.get("/:id/logs", getEventLogs);

export default router;
