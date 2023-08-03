import mongoose from "mongoose";
const mockingoose = require("mockingoose");
import { ExperimentSessionModel } from "../src/db/models/ExperimentSession/ExperimentSessionModel.js";
import { ExperimentSession } from "../src/db/models/ExperimentSession/experimentSession.valSchemas.js";
import ExperimentSessionDAO from "../src/db/daos/ExperimentSessionDAO.js";

describe("ExperimentSessionDAO - create", () => {
  it("should create a new ExperimentSession and return the created session", async () => {
    const mockSessionData: ExperimentSession = {
      subject: new mongoose.Types.ObjectId(),
      experiment: new mongoose.Types.ObjectId(),
      isCompleted: true,
      experiment_step: 1,
      stimuli_order: [1, 2, 3],
      responses: [
        {
          stimulus: new mongoose.Types.ObjectId(), // Provide data for responseSchemaWithId
          perceptualDimension: new mongoose.Types.ObjectId(),
          trial_N: 1,
          responseMode: "slider",
          playCount: 1,
          timeElapsed: 10,
          response: 5,
        },
      ],
    };

    let expectedSessionData = mockSessionData;
    expectedSessionData._id = new mongoose.Types.ObjectId();
    expectedSessionData.responses[0]._id = new mongoose.Types.ObjectId();

    // Mock the `create` method of ExperimentSessionModel to return the mock session data
    mockingoose(ExperimentSessionModel).toReturn(mockSessionData, "save");

    const createdSession = await ExperimentSessionDAO.create(mockSessionData);

    expect(createdSession).toEqual(expectedSessionData);
  });
});
