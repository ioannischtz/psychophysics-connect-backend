import express from "express";
import isValidReq from "../policies/isValidReq.js";
import asyncHandler from "express-async-handler";
import { isAuthedSubject } from "../policies/isAuthed.js";
import experimentController from "../controllers/experimentController.js";
import experimentSessionController from "../controllers/experimentSessionController.js";
import experimentSessionValSchemas from "../db/models/ExperimentSession/experimentSession.valSchemas.js";
import responseValSchemas from "../db/models/Response/response.valSchemas.js";

const router = express.Router();

// @route    api/homepage/active_experiments
// @method   GET
// @desc     List all active experiments
// @access   Public
router.get(
  "/active_experiments",
  asyncHandler(isAuthedSubject),
  asyncHandler(experimentController.listActiveExperiments),
);

// @route    api/homepage/experiment_sessions
// @method   GET
// @desc     List all of the subject's experiment_sessions
// @access   Private: run isAuthedSubject policy-middleware
router.get(
  "/experiment_sessions",
  asyncHandler(isAuthedSubject),
  asyncHandler(experimentSessionController.getAllByUser),
);

// @route    api/homepage/experiment_sessions
// @method   POST
// @desc     Start a new experiment_session for the specified experiment
// @access   Private: run isAuthedSubject policy-middleware
router.post(
  "/experiment_sessions",
  express.urlencoded({ limit: "1kb", parameterLimit: 1, extended: false }),
  isValidReq(experimentSessionValSchemas.createExperimentSession),
  asyncHandler(isAuthedSubject),
  asyncHandler(experimentSessionController.newSession),
);

// @route    api/homepage/experiment_sessions/respond_single
// @method   POST
// @desc     Post a single response for the specified experiment_session
// @access   Private: run isAuthedSubject policy-middleware
router.post(
  "/experiment_sessions/respond_single",
  express.urlencoded({ limit: "20kb", parameterLimit: 5, extended: false }),
  isValidReq(responseValSchemas.createResponse),
  asyncHandler(isAuthedSubject),
  asyncHandler(experimentSessionController.respondSingle),
);

export default router;
