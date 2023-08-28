import { beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorRequestHandler, Request, Response } from "express";
import experimentController from "../../../src/controllers/experimentController.js";
import ExperimentDAO, {
  ExperimentPopulated,
  PerceptualDimensionPopulated,
  StimulusPopulated,
} from "../../../src/db/daos/ExperimentDAO.js";
import {
  API_ERROR_TYPES,
  ApiError,
  httpStatusCodes,
} from "../../../src/middleware/errors.js";
import { Types } from "mongoose";
import { Experiment } from "../../../src/db/models/Experiment/experiment.valSchemas.js";

vi.mock("../../../src/middleware/logger.ts", () => {
  return {
    default: {
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
  };
});

describe("ExperimentController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Response;
  let mockErrorHandler: ErrorRequestHandler;

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {},
      sessionData: { _id: "user123" }, // Mock session data as needed
    } as Partial<Request>;
    mockResponse = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    } as unknown as Response;
    mockErrorHandler = (err, req, res, next) => {
      console.error(err);
      res.status(err.status || 500).json({ error: err.message });
    };
  });

  describe("getExperimentById", () => {
    it("should return a specific experiment", async () => {
      const mockExperimentId = new Types.ObjectId();
      const mockExperimenterId = new Types.ObjectId();
      const mockStimulusId = new Types.ObjectId();
      const mockPerceptDimId = new Types.ObjectId();
      const mockMediaAssetId = new Types.ObjectId();
      const mockExperimentSessionId = new Types.ObjectId();

      const mockExperiment: ExperimentPopulated = {
        _id: mockExperimentId,
        experimenter: {
          _id: mockExperimenterId,
          username: "mockExperimenter",
        },
        stimuli: [
          {
            _id: mockStimulusId,
            title: "mockStimulus",
            type: "audio",
            description: "stimulus description",
            mediaAsset: {
              _id: mockMediaAssetId,
              mimetype: "audio/ogg",
              filename: "mockAudioFilename",
            },
          },
        ],
        perceptualDimensions: [
          {
            _id: mockPerceptDimId,
            title: "mockPerceptDim",
            type: "audio",
            description: "perceptualDimension description",
            mediaAssets: [
              {
                _id: mockMediaAssetId,
                mimetype: "audio/ogg",
                filename: "mockAudioFilename",
              },
            ],
          },
        ],
        experimentSessions: [
          {
            _id: mockExperimentSessionId,
            experiment_step: 0,
          },
        ],
      };

      vi.spyOn(ExperimentDAO, "findById").mockResolvedValueOnce(mockExperiment);

      await experimentController.getExperimentById(
        {
          ...mockRequest,
          params: { experimentId: mockExperimentId.toString() },
        } as Request,
        mockResponse,
      );

      expect(ExperimentDAO.findById).toHaveBeenCalledWith(
        expect.objectContaining({ _id: mockExperimentId }),
      );
      expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        msg: expect.stringContaining("Fetched experiment with id:"),
        experiment: mockExperiment,
      });
    });

    it("should return an error when experiment is not found", async () => {
      const mockExperimentId = new Types.ObjectId();

      vi.spyOn(ExperimentDAO, "findById").mockResolvedValueOnce(null);

      try {
        await experimentController.getExperimentById(
          {
            ...mockRequest,
            params: { experimentId: mockExperimentId.toString() },
          } as Request,
          mockResponse,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).type).toBe(API_ERROR_TYPES.NOT_FOUND);
        expect((error as ApiError).message).toBe("Experiment not found");
      }

      expect(ExperimentDAO.findById).toHaveBeenCalledWith(
        expect.objectContaining({ _id: mockExperimentId }),
      );
    });
  });

  describe("listActiveExperiments", () => {
    it("should fetch all active experiments", async () => {
      const mockActiveExperiments = [
        { _id: new Types.ObjectId() },
        { _id: new Types.ObjectId() },
      ];
      vi.spyOn(ExperimentDAO, "findAllActive").mockResolvedValueOnce(
        mockActiveExperiments,
      );

      await experimentController.listActiveExperiments(
        mockRequest as Request,
        mockResponse,
      );

      expect(ExperimentDAO.findAllActive).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        msg: "Fetched all active experiments",
        activeExperiments: mockActiveExperiments,
      });
    });
  });

  describe("listExperimentsForExperimenter", () => {
    it("should fetch all experiments for the experimenter", async () => {
      const mockExperimenterId = new Types.ObjectId();
      const mockExperimenterUsername = "mockUsername";
      mockRequest.sessionData = { _id: mockExperimenterId };
      const mockExperiments = [
        {
          _id: new Types.ObjectId(),
          experimenter: {
            _id: mockExperimenterId,
            username: mockExperimenterUsername,
          },
        },
        {
          _id: new Types.ObjectId(),
          experimenter: {
            _id: mockExperimenterId,
            username: mockExperimenterUsername,
          },
        },
      ];
      vi.spyOn(ExperimentDAO, "findAllByUser").mockResolvedValueOnce(
        mockExperiments,
      );

      await experimentController.listExperimentsForExperimenter(
        mockRequest as Request,
        mockResponse,
      );

      expect(ExperimentDAO.findAllByUser).toHaveBeenCalledWith(
        mockExperimenterId,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        msg: "Fetched all active experiments",
        experiments: mockExperiments,
      });
    });

    it("should return an error when experimenterId is invalid or doesn't exist", async () => {
      const mockExperimenterId = new Types.ObjectId();
      mockRequest.sessionData = { _id: mockExperimenterId };
      // Mocking ExperimentDAO.findAllByUser to return an empty list (no experiments found)
      vi.spyOn(ExperimentDAO, "findAllByUser").mockResolvedValueOnce([]);

      try {
        await experimentController.listExperimentsForExperimenter(
          mockRequest as Request,
          mockResponse,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).type).toBe(API_ERROR_TYPES.NO_DATA);
        expect((error as ApiError).message).toBe(
          "No experiments exist for the specified experimenter",
        );
      }

      expect(ExperimentDAO.findAllByUser).toHaveBeenCalledWith(
        mockExperimenterId,
      );
    });
  });

  describe("addExperiment", () => {
    it("should create a new experiment", async () => {
      const mockExperimenterId = new Types.ObjectId();
      mockRequest.sessionData = { _id: mockExperimenterId };
      // Mocked request body
      const mockRequestBody = {
        title: "Mock Experiment",
        description: "This is a mock experiment",
        stimuliIds: [
          new Types.ObjectId(),
          new Types.ObjectId(),
          new Types.ObjectId(),
        ], // Mocked array of stimulus IDs
        perceptualDimensionsIds: [new Types.ObjectId(), new Types.ObjectId()], // Mocked array of perceptual dimension IDs
      };

      // Mocking ExperimentDAO.create to return the created experiment
      const mockCreatedExperiment = {
        _id: new Types.ObjectId(),
        title: mockRequestBody.title,
        description: mockRequestBody.description,
        isActive: false,
        experimenter: mockExperimenterId,
        experimentSessions: [],
        stimuli: mockRequestBody.stimuliIds,
        perceptualDimensions: mockRequestBody.perceptualDimensionsIds,
      }; // Mocked created experiment

      vi.spyOn(ExperimentDAO, "create").mockResolvedValueOnce(
        mockCreatedExperiment,
      );

      await experimentController.addExperiment(
        {
          ...mockRequest,
          params: { experimentId: mockExperimenterId.toString() },
          body: mockRequestBody,
        } as Request,
        mockResponse,
      );

      expect(ExperimentDAO.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: mockRequestBody.title,
          description: mockRequestBody.description,
          isActive: false,
          experimenter: mockExperimenterId,
          experimentSessions: [],
          stimuli: mockRequestBody.stimuliIds,
          perceptualDimensions: mockRequestBody.perceptualDimensionsIds,
        }),
      );
      expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        msg:
          `Experimenter ${mockExperimenterId} created a new Experiment successfully`,
        createdExperiment: mockCreatedExperiment,
      });
    });
  });

  describe("editExperiment", () => {
    const mockExperimentId = new Types.ObjectId();
    const mockExperimenterId = new Types.ObjectId();
    const mockInitialStimuli: StimulusPopulated[] = [
      {
        _id: new Types.ObjectId(),
        title: "Stim1",
        type: "audio",
        description: "Stim1 desc",
        mediaAsset: {
          _id: new Types.ObjectId(),
          mimetype: "audio/ogg",
          filename: "assetname1",
        },
      },
      {
        _id: new Types.ObjectId(),
        title: "Stim2",
        type: "audio",
        description: "Stim2 desc",
        mediaAsset: {
          _id: new Types.ObjectId(),
          mimetype: "audio/ogg",
          filename: "assetname2",
        },
      },
    ];
    const mockInitialPerceptualDims: PerceptualDimensionPopulated[] = [
      {
        _id: new Types.ObjectId(),
        title: "PerceptualDim1",
        type: "audio",
        description: "PerceptualDim1 desc",
        mediaAssets: [
          {
            _id: new Types.ObjectId(),
            mimetype: "audio/ogg",
            filename: "assetname1",
          },
        ],
      },
      {
        _id: new Types.ObjectId(),
        title: "PerceptualDim2",
        type: "audio",
        description: "PerceptualDim2 desc",
        mediaAssets: [
          {
            _id: new Types.ObjectId(),
            mimetype: "audio/ogg",
            filename: "assetname2",
          },
        ],
      },
    ];
    const stimuliToAdd = [new Types.ObjectId(), new Types.ObjectId()];
    const stimuliToRemove = [mockInitialStimuli[1]._id];
    const perceptualDimsToAdd = [new Types.ObjectId(), new Types.ObjectId()];
    const perceptualDimsToRemove = [mockInitialPerceptualDims[0]._id];
    it("should add stimuli to an existing experiment", async () => {
      const mockRequestBody = {
        stimuliToAdd,
      };

      const mockExistingExperiment: ExperimentPopulated = {
        _id: mockExperimentId,
        title: "Initial Title",
        description: "Initial description",
        isActive: false,
        experimenter: { _id: mockExperimenterId, username: "mockExperimenter" },
        experimentSessions: [],
        stimuli: mockInitialStimuli,
        perceptualDimensions: mockInitialPerceptualDims,
      };

      vi.spyOn(ExperimentDAO, "findById").mockResolvedValueOnce(
        mockExistingExperiment,
      );

      const mockUpdatedExperiment: Experiment = {
        _id: mockExistingExperiment._id,
        title: mockExistingExperiment.title,
        isActive: mockExistingExperiment.isActive,
        experimenter: mockExistingExperiment.experimenter._id,
        experimentSessions: [],
        stimuli: [
          ...mockExistingExperiment.stimuli.map((stim) => stim._id),
          ...stimuliToAdd,
        ],
      };

      vi.spyOn(ExperimentDAO, "update").mockResolvedValueOnce(
        mockUpdatedExperiment,
      );

      await experimentController.editExperiment(
        {
          ...mockRequest,
          params: { experimentId: mockExperimentId.toString() },
          body: mockRequestBody,
        } as Request,
        mockResponse,
      );

      expect(ExperimentDAO.findById).toHaveBeenCalledWith(
        expect.objectContaining(mockExistingExperiment._id),
      );
      expect(ExperimentDAO.update).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockExistingExperiment,
          experimenter: mockExistingExperiment.experimenter._id,
          stimuli: [
            ...mockExistingExperiment.stimuli.map((stim) => stim._id),
            ...stimuliToAdd,
          ],
          perceptualDimensions: [
            ...mockExistingExperiment.perceptualDimensions.map(
              (dim) => dim._id,
            ),
          ],
        }),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        msg: `Experiment ${mockExistingExperiment._id} was edited successfully`,
        editedExperiment: mockUpdatedExperiment,
      });
    });

    it("should remove stimuli from an existing experiment", async () => {
      const mockRequestBody = {
        stimuliToRemove,
      };

      const mockExistingExperiment: ExperimentPopulated = {
        _id: mockExperimentId,
        title: "Initial Title",
        description: "Initial description",
        isActive: false,
        experimenter: { _id: mockExperimenterId, username: "mockExperimenter" },
        experimentSessions: [],
        stimuli: mockInitialStimuli,
        perceptualDimensions: mockInitialPerceptualDims,
      };

      vi.spyOn(ExperimentDAO, "findById").mockResolvedValueOnce(
        mockExistingExperiment,
      );

      const mockUpdatedExperiment: Experiment = {
        _id: mockExistingExperiment._id,
        title: mockExistingExperiment.title,
        isActive: mockExistingExperiment.isActive,
        experimenter: mockExistingExperiment.experimenter._id,
        experimentSessions: [],
        stimuli: [mockInitialStimuli[0]._id],
        perceptualDimensions: mockExistingExperiment.perceptualDimensions.map(
          (dim) => dim._id,
        ),
      };

      vi.spyOn(ExperimentDAO, "update").mockResolvedValueOnce(
        mockUpdatedExperiment,
      );

      await experimentController.editExperiment(
        {
          ...mockRequest,
          params: { experimentId: mockExperimentId.toString() },
          body: mockRequestBody,
        } as Request,
        mockResponse,
      );

      expect(ExperimentDAO.findById).toHaveBeenCalledWith(
        expect.objectContaining(mockExistingExperiment._id),
      );
      expect(ExperimentDAO.update).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockExistingExperiment,
          experimenter: mockExistingExperiment.experimenter._id,
          stimuli: [mockExistingExperiment.stimuli[0]._id],
          perceptualDimensions: [
            ...mockExistingExperiment.perceptualDimensions.map(
              (dim) => dim._id,
            ),
          ],
        }),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        msg: `Experiment ${mockExistingExperiment._id} was edited successfully`,
        editedExperiment: mockUpdatedExperiment,
      });
    });

    it("should add perceptualDimensions to an existing experiment", async () => {
      const mockRequestBody = {
        perceptualDimsToAdd,
      };

      const mockExistingExperiment: ExperimentPopulated = {
        _id: mockExperimentId,
        title: "Initial Title",
        description: "Initial description",
        isActive: false,
        experimenter: { _id: mockExperimenterId, username: "mockExperimenter" },
        experimentSessions: [],
        stimuli: mockInitialStimuli,
        perceptualDimensions: mockInitialPerceptualDims,
      };

      vi.spyOn(ExperimentDAO, "findById").mockResolvedValueOnce(
        mockExistingExperiment,
      );

      const mockUpdatedExperiment: Experiment = {
        _id: mockExistingExperiment._id,
        title: mockExistingExperiment.title,
        isActive: mockExistingExperiment.isActive,
        experimenter: mockExistingExperiment.experimenter._id,
        experimentSessions: [],
        perceptualDimensions: [
          ...mockExistingExperiment.stimuli.map((stim) => stim._id),
          ...perceptualDimsToAdd,
        ],
      };

      vi.spyOn(ExperimentDAO, "update").mockResolvedValueOnce(
        mockUpdatedExperiment,
      );

      await experimentController.editExperiment(
        {
          ...mockRequest,
          params: { experimentId: mockExperimentId.toString() },
          body: mockRequestBody,
        } as Request,
        mockResponse,
      );

      expect(ExperimentDAO.findById).toHaveBeenCalledWith(
        expect.objectContaining(mockExistingExperiment._id),
      );
      expect(ExperimentDAO.update).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockExistingExperiment,
          experimenter: mockExistingExperiment.experimenter._id,
          perceptualDimensions: [
            ...mockExistingExperiment.perceptualDimensions.map(
              (stim) => stim._id,
            ),
            ...perceptualDimsToAdd,
          ],
          stimuli: [...mockExistingExperiment.stimuli.map((stim) => stim._id)],
        }),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        msg: `Experiment ${mockExistingExperiment._id} was edited successfully`,
        editedExperiment: mockUpdatedExperiment,
      });
    });

    it("should remove stimuli from an existing experiment", async () => {
      const mockRequestBody = {
        perceptualDimsToRemove,
      };

      const mockExistingExperiment: ExperimentPopulated = {
        _id: mockExperimentId,
        title: "Initial Title",
        description: "Initial description",
        isActive: false,
        experimenter: { _id: mockExperimenterId, username: "mockExperimenter" },
        experimentSessions: [],
        stimuli: mockInitialStimuli,
        perceptualDimensions: mockInitialPerceptualDims,
      };

      vi.spyOn(ExperimentDAO, "findById").mockResolvedValueOnce(
        mockExistingExperiment,
      );

      const mockUpdatedExperiment: Experiment = {
        _id: mockExistingExperiment._id,
        title: mockExistingExperiment.title,
        isActive: mockExistingExperiment.isActive,
        experimenter: mockExistingExperiment.experimenter._id,
        experimentSessions: [],
        perceptualDimensions: [mockInitialPerceptualDims[1]._id],
        stimuli: mockExistingExperiment.stimuli.map((stim) => stim._id),
      };

      vi.spyOn(ExperimentDAO, "update").mockResolvedValueOnce(
        mockUpdatedExperiment,
      );

      await experimentController.editExperiment(
        {
          ...mockRequest,
          params: { experimentId: mockExperimentId.toString() },
          body: mockRequestBody,
        } as Request,
        mockResponse,
      );

      expect(ExperimentDAO.findById).toHaveBeenCalledWith(
        expect.objectContaining(mockExistingExperiment._id),
      );
      expect(ExperimentDAO.update).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockExistingExperiment,
          experimenter: mockExistingExperiment.experimenter._id,
          perceptualDimensions: [
            mockExistingExperiment.perceptualDimensions[1]._id,
          ],
          stimuli: [...mockExistingExperiment.stimuli.map((stim) => stim._id)],
        }),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        msg: `Experiment ${mockExistingExperiment._id} was edited successfully`,
        editedExperiment: mockUpdatedExperiment,
      });
    });

    it("should handle an error if experiment is not found", async () => {
      const mockRequestBody = {
        title: "Updated Title",
        description: "Updated description",
        isActive: true,
        experimenter: mockExperimenterId,
        stimuliToAdd,
        stimuliToRemove,
        perceptualDimsToAdd,
        perceptualDimsToRemove,
      };

      // Mocking ExperimentDAO.findById to return null (experiment not found)
      vi.spyOn(ExperimentDAO, "findById").mockResolvedValueOnce(null);
      try {
        await experimentController.editExperiment(
          {
            ...mockRequest,
            params: { experimenterId: mockExperimenterId.toString() },
            body: mockRequestBody,
          } as Request,
          mockResponse,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).type).toBe(API_ERROR_TYPES.NOT_FOUND);
        expect((error as ApiError).message).toBe("Experiment not found");
      }

      expect(ExperimentDAO.findById).toHaveBeenCalledWith(
        expect.objectContaining(mockExperimentId),
      );
    });
  });

  describe("deleteExperiment", () => {
    const mockExperimentId = new Types.ObjectId();
    it("should delete an existing experiment", async () => {
      vi.spyOn(ExperimentDAO, "deleteById").mockResolvedValueOnce(true);

      await experimentController.deleteExperiment(
        {
          ...mockRequest,
          params: { experimentId: mockExperimentId.toString() },
        } as Request,
        mockResponse,
      );

      expect(ExperimentDAO.deleteById).toHaveBeenCalledWith(mockExperimentId);
      expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        msg: "Experiment deleted successfully",
      });
    });

    it("should handle an error if experiment is not found", async () => {
      vi.spyOn(ExperimentDAO, "deleteById").mockResolvedValueOnce(false);

      try {
        await experimentController.deleteExperiment(
          {
            ...mockRequest,
            params: { experimentId: mockExperimentId.toString() },
          } as Request,
          mockResponse,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).type).toBe(API_ERROR_TYPES.NOT_FOUND);
        expect((error as ApiError).message).toBe(
          "The specified experiment was not found. Can't go through the deletion",
        );
      }
      expect(ExperimentDAO.deleteById).toHaveBeenCalledWith(
        expect.objectContaining(mockExperimentId),
      );
    });
  });
});
