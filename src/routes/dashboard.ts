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
import stimulusValSchemas from "../db/models/Stimulus/stimulus.valSchemas.js";
import perceptualDimensionValSchemas from "../db/models/PerceptualDimension/perceptualDimension.valSchemas.js";
import mediaAssetController from "../controllers/mediaAssetController.js";
import mediaAssetValSchemas from "../db/models/MediaAsset/mediaAsset.valSchemas.js";
import multer from "multer";
import { multerDestPath } from "../config.js";

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

// @route    api/dashboard/experiments/:experimentId
// @method   GET
// @desc     Get the experiment specified by id
// @access   Private: run isAuthedExperimenter Policy-Middleware
router.get(
  "/experiments/:experimentId",
  asyncHandler(isAuthedExperimenter),
  isValidReq(
    z.object({
      experimentId: z.custom<Types.ObjectId>(),
    }),
    VALIDATION_SOURCE.PARAMS,
  ),
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
  isValidReq(
    z.object({ experimentId: z.custom<Types.ObjectId>() }),
    VALIDATION_SOURCE.PARAMS,
  ),
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
  isValidReq(
    z.object({ experimentId: z.custom<Types.ObjectId>() }),
    VALIDATION_SOURCE.PARAMS,
  ),
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

// @route    api/dashboard/experiments/:experimentId/stimuli
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

// @route    api/dashboard/experiments/:experimentId/perceptualDimensions
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
    VALIDATION_SOURCE.PARAMS,
  ),
  asyncHandler(stimulusController.listAllStimuliOfType),
);

// @route    api/dashboard/stimuli
// @method   GET
// @desc     Get stimuli by query
// @access   Private: run isAuthedExperimenter Policy-Middleware
router.get(
  "/stimuli",
  asyncHandler(isAuthedExperimenter),
  isValidReq(
    z.object({
      type: z.enum(typesEnum),
      mediaAssetId: z.custom<Types.ObjectId>(),
      experimentId: z.custom<Types.ObjectId>(),
    }),
    VALIDATION_SOURCE.QUERY,
  ),
  asyncHandler(stimulusController.queryStimuli),
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
    VALIDATION_SOURCE.PARAMS,
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
  isValidReq(
    z.object({
      stimulusId: z.custom<Types.ObjectId>(),
    }),
    VALIDATION_SOURCE.PARAMS,
  ),
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
    VALIDATION_SOURCE.PARAMS,
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
      type: z.enum(perceptDimsTypes),
    }),
    VALIDATION_SOURCE.PARAMS,
  ),
  asyncHandler(perceptualDimensionController.listAllPerceptualDimensionsOfType),
);

// @route    api/dashboard/perceptualDimensions
// @method   GET
// @desc     Get perceptualDimensions by query
// @access   Private: run isAuthedExperimenter Policy-Middleware
router.get(
  "/perceptualDimensions",
  asyncHandler(isAuthedExperimenter),
  isValidReq(
    z.object({
      type: z.enum(perceptDimsTypes),
      mediaAssetId: z.custom<Types.ObjectId>(),
      experimentId: z.custom<Types.ObjectId>(),
    }),
    VALIDATION_SOURCE.QUERY,
  ),
  asyncHandler(perceptualDimensionController.queryPerceptualDimensions),
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
  isValidReq(
    z.object({
      perceptualDimensionId: z.custom<Types.ObjectId>(),
    }),
    VALIDATION_SOURCE.PARAMS,
  ),
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
    VALIDATION_SOURCE.PARAMS,
  ),
  asyncHandler(perceptualDimensionController.remove),
);

// @route    api/dashboard/perceptualDimensions/:perceptualDimensionId/media_assets
// @method   GET
// @desc     Patch(update) the specified perceptualDimension
// @access   Private: run isAuthedExperimenter Policy-Middleware
router.get(
  "/perceptualDimensions/:perceptualDimensionId.media_assets",
  asyncHandler(isAuthedExperimenter),
  isValidReq(
    z.object({
      perceptualDimensionId: z.custom<Types.ObjectId>(),
    }),
    VALIDATION_SOURCE.PARAMS,
  ),
  asyncHandler(mediaAssetController.listMediaAssetsForPerceptualDimension),
);

// @route    api/dashboard/media_assets
// @method   GET
// @desc     List all media_assets by query
// @access   Private: run isAuthedExperimenter Policy-Middleware
const mediaAssetTypes = typesEnum;
router.get(
  "/media_assets",
  asyncHandler(isAuthedExperimenter),
  isValidReq(
    z.object({
      mimetype: z.enum(mediaAssetTypes),
      perceptualDimensionId: z.custom<Types.ObjectId>(),
    }),
    VALIDATION_SOURCE.QUERY,
  ),
  asyncHandler(mediaAssetController.queryMediaAssets),
);

// @route    api/dashboard/media_assets/:mediaAssetId/stimuli
// @method   GET
// @desc     List all stimuli associated with the specified media_asset
// @access   Private: run isAuthedExperimenter Policy-Middleware
router.get(
  "/media_assets/:mediaAssetId/stimuli",
  asyncHandler(isAuthedExperimenter),
  isValidReq(
    z.object({
      mediaAssetId: z.custom<Types.ObjectId>(),
    }),
    VALIDATION_SOURCE.PARAMS,
  ),
  asyncHandler(stimulusController.listStimuliForMediaAsset),
);

const upload = multer({
  dest: multerDestPath,
  limits: { fileSize: 6291456 },
});

// @route    api/dashboard/media_assets
// @method   POST
// @desc     Post a new media_asset
// @access   Private: run isAuthedExperimenter Policy-Middleware
const createMediaAssetSchema = mediaAssetValSchemas.createMediaAsset.pick({
  mimetype: true,
  filename: true,
});

router.post(
  "/media_assets",
  asyncHandler(isAuthedExperimenter),
  express.urlencoded({ limit: "10kb", parameterLimit: 2, extended: false }),
  upload.single("media_asset"),
  isValidReq(createMediaAssetSchema),
  asyncHandler(mediaAssetController.uploadSingle),
);

// @route    api/dashboard/media_assets/multi
// @method   POST
// @desc     Post a new media_asset
// @access   Private: run isAuthedExperimenter Policy-Middleware
router.post(
  "/media_assets/multi",
  asyncHandler(isAuthedExperimenter),
  express.urlencoded({ limit: "1mb", extended: true }),
  upload.array("media_assets", 10),
  asyncHandler(mediaAssetController.uploadMulti),
);

// @route    api/dashboard/media_assets/:media_assetId
// @method   PATCH
// @desc     Patch(update) the specified media_asset
// @access   Private: run isAuthedExperimenter Policy-Middleware
const editMediaAssetSchema = createMediaAssetSchema;
router.patch(
  "/media_assets/:mediaAssetId",
  asyncHandler(isAuthedExperimenter),
  express.urlencoded({ limit: "10kb", parameterLimit: 2, extended: false }),
  isValidReq(
    z.object({
      mediaAssetId: z.custom<Types.ObjectId>(),
    }),
    VALIDATION_SOURCE.PARAMS,
  ),
  isValidReq(editMediaAssetSchema),
  asyncHandler(mediaAssetController.edit),
);

// @route    api/dashboard/media_assets/:mediaAssetId/download
// @method   GET
// @desc     Download the specified media_asset
// @access   Private: run isAuthedExperimenter Policy-Middleware
router.get(
  "media_assets/:mediaAssetId/download",
  asyncHandler(isAuthedExperimenter),
  isValidReq(
    z.object({
      mediaAssetId: z.custom<Types.ObjectId>(),
    }),
    VALIDATION_SOURCE.PARAMS,
  ),
  asyncHandler(mediaAssetController.downloadSingle),
);

// @route    api/dashboard/media_assets/:mediaAssetId
// @method   DELETE
// @desc     Delete the (specified by id) media_asset
// @access   Private: run isAuthedExperimenter Policy-Middleware
router.delete(
  "/media_assets/:mediaAssetId",
  asyncHandler(isAuthedExperimenter),
  isValidReq(
    z.object({
      mediaAssetId: z.custom<Types.ObjectId>(),
    }),
    VALIDATION_SOURCE.PARAMS,
  ),
  asyncHandler(mediaAssetController.remove),
);

export default router;
