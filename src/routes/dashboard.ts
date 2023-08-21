import express from "express";
import isValidReq, { VALIDATION_SOURCE } from "../policies/isValidReq.js";
import asyncHandler from "express-async-handler";
import { isAuthedExperimenter } from "../policies/isAuthed.js";
import experimentController from "../controllers/experimentController.js";
import experimentValSchemas from "../db/models/Experiment/experiment.valSchemas.js";
import { z } from "zod";
import { Types } from "mongoose";
import experimentSessionController from "../controllers/experimentSessionController.js";
import stimulusController from "../controllers/stimulusController.js";
import perceptualDimensionController from "../controllers/perceptualDimensionController.js";
import { StimulusType } from "../db/daos/StimulusDAO.js";
import stimulusValSchemas from "../db/models/Stimulus/stimulus.valSchemas.js";
import perceptualDimensionValSchemas from "../db/models/PerceptualDimension/perceptualDimension.valSchemas.js";

const router = express.Router();

// @route    api/dashboard/experiments
// @method   GET
// @desc     Get the user's (Role=Experimenter) experiments
// @access   Private: run isAuthedExperimenter Policy-Middleware
router.get(
  "/experiments",
  asyncHandler(isAuthedExperimenter),
  asyncHandler(experimentController.listExperimentsForExperimenter),
);

// @route    api/dashboard/experiments/:id
// @method   GET
// @desc     Get the experiment specified by id
// @access   Private: run isAuthedExperimenter Policy-Middleware
router.get(
  "/experiments/:experimentId",
  asyncHandler(isAuthedExperimenter),
  asyncHandler(experimentController.getExperimentById),
);

// @route    api/dashboard/experiments
// @method   POST
// @desc     Post a new experiment
// @access   Private: run isAuthedExperimenter Policy-Middleware
router.post(
  "/experiments",
  express.urlencoded({ limit: "20kb", parameterLimit: 4, extended: false }),
  asyncHandler(isAuthedExperimenter),
  isValidReq(experimentValSchemas.createExperiment),
  asyncHandler(experimentController.addExperiment),
);

// @route    api/dashboard/experiments/:id
// @method   PATCH
// @desc     Patch(update) the experiment specified by id
// @access   Private: run isAuthedExperimenter Policy-Middleware
const editExperimentValSchema = experimentValSchemas.createExperiment
  .pick({
    title: true,
    description: true,
    isActive: true,
  })
  .extend({
    stimuliToAdd: z.array(z.custom<Types.ObjectId>()).default([]).optional(),
    stimuliToRemove: z.array(z.custom<Types.ObjectId>()).default([]).optional(),
    perceptualDimsToAdd: z
      .array(z.custom<Types.ObjectId>())
      .default([])
      .optional(),
    perceptualDimsToRemove: z
      .array(z.custom<Types.ObjectId>())
      .default([])
      .optional(),
  });

router.patch(
  "/experiments/:experimentId",
  express.urlencoded({ limit: "40kb", parameterLimit: 7, extended: false }),
  asyncHandler(isAuthedExperimenter),
  isValidReq(editExperimentValSchema),
  asyncHandler(experimentController.editExperiment),
);

// @route    api/dashboard/experiments/:id
// @method   DELETE
// @desc     Delete the experiment specified by id
// @access   Private: run isAuthedExperimenter Policy-Middleware
router.delete(
  "/experiments/:experimentId",
  asyncHandler(isAuthedExperimenter),
  asyncHandler(experimentController.deleteExperiment),
);

// @route    api/dashboard/experiments/:id/responses
// @method   GET
// @desc     Get the specified by id experiment's responses
// @access   Private: run isAuthedExperimenter Policy-Middleware
router.get(
  "/experiments/:experimentId/responses",
  asyncHandler(isAuthedExperimenter),
  isValidReq(
    z.object({
      experimentId: z.string(),
    }),
    VALIDATION_SOURCE.PARAMS,
  ),
  asyncHandler(experimentSessionController.getResponsesByExperimentId),
);

// @route    api/dashboard/experiments/:experimentId/subject/:subjectId/responses
// @method   GET
// @desc     Get the specified subject's responses for the specified experiment (by ids)
// @access   Private: run isAuthedExperimenter Policy-Middleware
router.get(
  "/experiments/:experimentId/subject/:subjectId",
  asyncHandler(isAuthedExperimenter),
  isValidReq(
    z.object({
      experimentId: z.string(),
      subjectId: z.string(),
    }),
    VALIDATION_SOURCE.PARAMS,
  ),
  asyncHandler(experimentSessionController.getResponsesByUserAndExperiment),
);

// @route    api/dashboard/experiments/:id/stimuli
// @method   GET
// @desc     Get all the stimuli associated with the specified experiment
// @access   Private: run isAuthedExperimenter Policy-Middleware
router.get(
  "/experiments/:experimentId/stimuli",
  asyncHandler(isAuthedExperimenter),
  isValidReq(
    z.object({
      experimentId: z.string(),
    }),
    VALIDATION_SOURCE.PARAMS,
  ),
  asyncHandler(stimulusController.listStimuliForExperiment),
);

// @route    api/dashboard/experiments/:id/perceptualDimensions
// @method   GET
// @desc     Get all the perceptualDimensions associated with the specified experiment
// @access   Private: run isAuthedExperimenter Policy-Middleware
router.get(
  "/experiments/:experimentId/perceptualDimensions",
  asyncHandler(isAuthedExperimenter),
  isValidReq(
    z.object({
      experimentId: z.string(),
    }),
    VALIDATION_SOURCE.PARAMS,
  ),
  asyncHandler(
    perceptualDimensionController.listPerceptualDimensionsForExperiment,
  ),
);

// @route    api/dashboard/stimuli/types/:type
// @method   GET
// @desc     Get all the stimuli of the specified type
// @access   Private: run isAuthedExperimenter Policy-Middleware
const typesEnum = ["text", "img", "audio"] as const;
router.get(
  "/stimuli/types/:type",
  asyncHandler(isAuthedExperimenter),
  isValidReq(
    z.object({
      type: z.enum(typesEnum),
    }),
  ),
  asyncHandler(stimulusController.listAllStimuliOfType),
);

// @route    api/dashboard/stimuli
// @method   POST
// @desc     Post a new stimulus
// @access   Private: run isAuthedExperimenter Policy-Middleware
const createStimulusSchema = stimulusValSchemas.createStimulus
  .pick({
    title: true,
    type: true,
    description: true,
  })
  .extend({
    mediaAssetId: z.custom<Types.ObjectId>(),
  });
router.post(
  "/stimuli",
  asyncHandler(isAuthedExperimenter),
  express.urlencoded({ limit: "20kb", parameterLimit: 4, extended: false }),
  isValidReq(createStimulusSchema),
  asyncHandler(stimulusController.create),
);

// @route    api/dashboard/stimuli/:stimulusId
// @method   GET
// @desc     Get the specified stimulus
// @access   Private: run isAuthedExperimenter Policy-Middleware
router.get(
  "/stimuli/:stimulusId",
  asyncHandler(isAuthedExperimenter),
  isValidReq(
    z.object({
      stimulusId: z.custom<Types.ObjectId>(),
    }),
  ),
  asyncHandler(stimulusController.getStimulusById),
);

// @route    api/dashboard/stimuli/:stimulusId
// @method   PATCH
// @desc     Patch(update) the specified stimulus
// @access   Private: run isAuthedExperimenter Policy-Middleware
const editStimulusSchema = createStimulusSchema;
router.patch(
  "/stimuli/:stimulusId",
  asyncHandler(isAuthedExperimenter),
  express.urlencoded({ limit: "20kb", parameterLimit: 4, extended: false }),
  isValidReq(editStimulusSchema),
  asyncHandler(stimulusController.edit),
);

// @route    api/dashboard/stimuli/:stimulusId
// @method   DELETE
// @desc     Delete the (specified by id) stimulus
// @access   Private: run isAuthedExperimenter Policy-Middleware
router.delete(
  "/stimuli/:stimulusId",
  asyncHandler(isAuthedExperimenter),
  isValidReq(
    z.object({
      stimulusId: z.custom<Types.ObjectId>(),
    }),
  ),
  asyncHandler(stimulusController.remove),
);

// @route    api/dashboard/perceptualDimensions/types/:type
// @method   GET
// @desc     Get all the perceptualDimensions of the specified type
// @access   Private: run isAuthedExperimenter Policy-Middleware
const perceptDimsTypes = typesEnum;
router.get(
  "/perceptualDimensions/types/:type",
  asyncHandler(isAuthedExperimenter),
  isValidReq(
    z.object({
      type: z.enum(typesEnum),
    }),
  ),
  asyncHandler(perceptualDimensionController.listAllPerceptualDimensionsOfType),
);

// @route    api/dashboard/perceptualDimensions
// @method   POST
// @desc     Post a new perceptualDimension
// @access   Private: run isAuthedExperimenter Policy-Middleware
const createPerceptualDimensionSchema = perceptualDimensionValSchemas
  .createperceptualDimension
  .pick({
    title: true,
    type: true,
    description: true,
  })
  .extend({
    mediaAssetId: z.custom<Types.ObjectId>(),
  });
router.post(
  "/perceptualDimensions",
  asyncHandler(isAuthedExperimenter),
  express.urlencoded({ limit: "20kb", parameterLimit: 4, extended: false }),
  isValidReq(createPerceptualDimensionSchema),
  asyncHandler(perceptualDimensionController.create),
);
// @route    api/dashboard/perceptualDimensions/:perceptualDimensionId
// @method   PATCH
// @desc     Patch(update) the specified perceptualDimension
// @access   Private: run isAuthedExperimenter Policy-Middleware
const editPerceptualDimensionSchema = createPerceptualDimensionSchema;
router.patch(
  "/perceptualDimensions/:perceptualDimensionId",
  asyncHandler(isAuthedExperimenter),
  express.urlencoded({ limit: "20kb", parameterLimit: 4, extended: false }),
  isValidReq(editPerceptualDimensionSchema),
  asyncHandler(perceptualDimensionController.edit),
);
// @route    api/dashboard/perceptualDimensions/:perceptualDimensionId
// @method   DELETE
// @desc     Delete the (specified by id) perceptualDimension
// @access   Private: run isAuthedExperimenter Policy-Middleware
router.delete(
  "/perceptualDimensions/:perceptualDimensionId",
  asyncHandler(isAuthedExperimenter),
  isValidReq(
    z.object({
      perceptualDimensionId: z.custom<Types.ObjectId>(),
    }),
  ),
  asyncHandler(perceptualDimensionController.remove),
);
// @route    api/dashboard/media_assets
// @method   GET
// @desc     Get all the media_assets created by the user (Role=experimenter)
// @access   Private: run isAuthedExperimenter Policy-Middleware

// @route    api/dashboard/media_assets
// @method   POST
// @desc     Post a new media_asset
// @access   Private: run isAuthedExperimenter Policy-Middleware

// @route    api/dashboard/media_assets/:media_assetId
// @method   PATCH
// @desc     Patch(update) the specified media_asset
// @access   Private: run isAuthedExperimenter Policy-Middleware

// @route    api/dashboard/media_assets/:media_assetId
// @method   DELETE
// @desc     Delete the (specified by id) media_asset
// @access   Private: run isAuthedExperimenter Policy-Middleware
