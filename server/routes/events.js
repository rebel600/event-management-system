import express from "express";

import {
  getEvents,
  createEvent,
  updateEvent,
  getEventLogs
} from "../controllers/eventController.js";

const router = express.Router();

router.get("/", getEvents);
router.post("/", createEvent);
router.patch("/:id", updateEvent);
router.get("/:id/logs", getEventLogs);

export default router;
