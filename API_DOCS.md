# API Documentation

This document provides an overview of the API routes available in the project. It describes the endpoints, their purposes, and any relevant information.

## Table of Contents

- [Users](#users)
- [Homepage](#homepage)
- [Dashboard](#dashboard)

## Users

### Register User

- **URL**: `/api/users/register`
- **Method**: `POST`
- **Description**: Registers a new user.
- **Request Body**:
  - `username` (string): The username of the user.
  - `email` (string): The email of the user.
  - `password` (string): The password of the user. Minimum of 6 characters.
  - `role` (string/enum): The role of the user. Roles-enum: `subject` | `experimenter`
- **Response**:
  - `user` (object): The registered user's details.
- **Error Responses**:
  - `400 Bad Request`: User already exists | Invalid input data.


### Login User

- **URL**: `/api/users/login`
- **Method**: `POST`
- **Description**: Logs in a user.
- **Request Body**:
  - `username` (string): The username of the user.
  - `password` (string): The password of the user.
- **Response**:
  - setSessionData: sets the user's details(minus password) in sessionData, as well as the generated JWT token
  - `user` (string): The user's details.
- **Error Responses**:
  - `401 Unauthorized`: Invalid credentials.

### Logout User

- **URL**: `/api/users/logout`
- **Method**: `POST`
- **Description**: Logs out a user and removes token.
- **Response**:
  - `message` (string): Logout confirmation message.
- **Error Responses**:
  - `500 Internal Server Error`: Server error occurred.

### Get User Profile

- **URL**: `/api/users/profile`
- **Method**: `GET`
- **Description**: Retrieves the user's profile (Role=Subject).
- **Response**:
  - `profile` (object): The user's profile data.
- **Error Responses**:
  - `401 Unauthorized`: User not authenticated.

### Update User Account

- **URL**: `/api/users/account`
- **Method**: `PUT`
- **Description**: Updates the user's account information.
- **Request Body**:
  - `username` (string): The updated username of the user.
  - `email` (string): The updated email of the user.
  - `password` (string): The updated password of the user.
- **Response**:
  - `message` (string): Update confirmation message.
- **Error Responses**:
  - `401 Unauthorized`: User not authenticated.
  - `500 Internal Server Error`: Server error occurred.

### Delete User Account

- **URL**: `/api/users/account`
- **Method**: `DELETE`
- **Description**: Deletes the user's account.
- **Response**:
  - `message` (string): Deletion confirmation message.
- **Error Responses**:
  - `401 Unauthorized`: User not authenticated.
  - `500 Internal Server Error`: Server error occurred.

### Get Users by Role

- **URL**: `/api/users/roles/:role`
- **Method**: `GET`
- **Description**: Retrieves users by role.
- **Response**:
  - `users` (array): List of users with the specified role.
- **Error Responses**:
  - `401 Unauthorized`: User not authenticated.
  - `403 Forbidden`: Insufficient permissions.

### Get Users by Query

- **URL**: `/api/users`
- **Method**: `GET`
- **Description**: Retrieves users based on query parameters.
- **Response**:
  - `users` (array): List of users based on query.
- **Error Responses**:
  - `401 Unauthorized`: User not authenticated.
  - `403 Forbidden`: Insufficient permissions.

## Homepage

### List Active Experiments

- **URL**: `/api/homepage/active_experiments`
- **Method**: `GET`
- **Description**: Lists all active experiments for the authenticated subject's homepage.
- **Response**:
  - `activeExperiments` (array): List of active experiments.
    - `experimentId` (string): ID of the experiment.
    - `name` (string): Name of the experiment.
    - ... (Additional experiment properties)
- **Error Responses**:
  - `401 Unauthorized`: User not authenticated as a subject.

### List Experiment Sessions

- **URL**: `/api/homepage/experiment_sessions`
- **Method**: `GET`
- **Description**: Lists all experiment sessions for the authenticated subject.
- **Response**:
  - `experimentSessions` (array): List of experiment sessions.
    - `sessionId` (string): ID of the experiment session.
    - `experimentId` (string): ID of the associated experiment.
    - ... (Additional session properties)
- **Error Responses**:
  - `401 Unauthorized`: User not authenticated as a subject.

### Start New Experiment Session

- **URL**: `/api/homepage/experiment_sessions`
- **Method**: `POST`
- **Description**: Starts a new experiment session for the specified experiment.
- **Request Body**:
  - `experimentId` (string): ID of the experiment.
- **Response**:
  - `session` (object): New experiment session details.
    - `sessionId` (string): ID of the experiment session.
    - `experimentId` (string): ID of the associated experiment.
    - ... (Additional session properties)
- **Error Responses**:
  - `400 Bad Request`: Invalid input data.
  - `401 Unauthorized`: User not authenticated as a subject.

### Post Single Response

- **URL**: `/api/homepage/experiment_sessions/respond_single`
- **Method**: `POST`
- **Description**: Posts a single response for the specified experiment session.
- **Request Body**:
  - `responseVal` (string): Response value.
  - `responseMode` (string): Response mode.
  - `playCount` (number): Play count.
  - `timeElapsed` (number): Time elapsed.
  - `perceptualDimId` (string): Perceptual dimension ID.
- **Response**:
  - `response` (object): Posted response details.
    - `responseId` (string): ID of the posted response.
    - `experimentSessionId` (string): ID of the associated experiment session.
    - ... (Additional response properties)
- **Error Responses**:
  - `400 Bad Request`: Invalid input data.
  - `401 Unauthorized`: User not authenticated as a subject.

## Dashboard Routes

### List Experiments

- **URL**: `/api/dashboard/experiments`
- **Method**: `GET`
- **Description**: Get the list of experiments for the authenticated experimenter.
- **Access**: Private (requires authentication as an experimenter).
- **Response**:
  - `experiments` (array): List of experiments.
    - `experimentId` (string): ID of the experiment.
    - `title` (string): Title of the experiment.
    - ... (Additional experiment properties)
- **Error Responses**:
  - `401 Unauthorized`: User not authenticated as an experimenter.

### Get Experiment by ID

- **URL**: `/api/dashboard/experiments/:experimentId`
- **Method**: `GET`
- **Description**: Get the experiment specified by ID.
- **Access**: Private (requires authentication as an experimenter).
- **Response**:
  - `experiment` (object): Experiment details.
    - `experimentId` (string): ID of the experiment.
    - `title` (string): Title of the experiment.
    - ... (Additional experiment properties)
- **Error Responses**:
  - `400 Bad Request`: Invalid experiment ID.
  - `401 Unauthorized`: User not authenticated as an experimenter.

### Post New Experiment

- **URL**: `/api/dashboard/experiments`
- **Method**: `POST`
- **Description**: Create a new experiment.
- **Access**: Private (requires authentication as an experimenter).
- **Request Body**:
  - Experiment details (varies based on schema).
- **Response**:
  - `experiment` (object): New experiment details.
    - `experimentId` (string): ID of the experiment.
    - `title` (string): Title of the experiment.
    - ... (Additional experiment properties)
- **Error Responses**:
  - `400 Bad Request`: Invalid input data.
  - `401 Unauthorized`: User not authenticated as an experimenter.

### Update Experiment

- **URL**: `/api/dashboard/experiments/:experimentId`
- **Method**: `PATCH`
- **Description**: Update the experiment specified by ID.
- **Access**: Private (requires authentication as an experimenter).
- **Request Body**:
  - Experiment details to update (varies based on schema).
- **Response**:
  - `experiment` (object): Updated experiment details.
    - `experimentId` (string): ID of the experiment.
    - `title` (string): Updated title of the experiment.
    - ... (Additional updated experiment properties)
- **Error Responses**:
  - `400 Bad Request`: Invalid input data or experiment ID.
  - `401 Unauthorized`: User not authenticated as an experimenter.

### Delete Experiment

- **URL**: `/api/dashboard/experiments/:experimentId`
- **Method**: `DELETE`
- **Description**: Delete the experiment specified by ID.
- **Access**: Private (requires authentication as an experimenter).
- **Response**:
  - `message` (string): Success message indicating experiment deletion.
- **Error Responses**:
  - `400 Bad Request`: Invalid experiment ID.
  - `401 Unauthorized`: User not authenticated as an experimenter.

### List Experiment Responses

- **URL**: `/api/dashboard/experiments/:experimentId/responses`
- **Method**: `GET`
- **Description**: Get responses associated with the specified experiment.
- **Access**: Private (requires authentication as an experimenter).
- **Response**:
  - `responses` (array of objects): List of responses for the experiment.
    - `responseId` (string): ID of the response.
    - `experimentId` (string): ID of the associated experiment.
    - ... (Additional response properties)
- **Error Responses**:
  - `400 Bad Request`: Invalid experiment ID.
  - `401 Unauthorized`: User not authenticated as an experimenter.

### List Responses for Subject and Experiment

- **URL**: `/api/dashboard/experiments/:experimentId/subject/:subjectId`
- **Method**: `GET`
- **Description**: Get responses from a specified subject for a specific experiment.
- **Access**: Private (requires authentication as an experimenter).
- **Response**:
  - `responses` (array of objects): List of responses for the subject and experiment.
    - `responseId` (string): ID of the response.
    - `experimentId` (string): ID of the associated experiment.
    - `subjectId` (string): ID of the associated subject.
    - ... (Additional response properties)
- **Error Responses**:
  - `400 Bad Request`: Invalid experiment or subject ID.
  - `401 Unauthorized`: User not authenticated as an experimenter.

### List Experiment Stimuli

- **URL**: `/api/dashboard/experiments/:experimentId/stimuli`
- **Method**: `GET`
- **Description**: Get all stimuli associated with the specified experiment.
- **Access**: Private (requires authentication as an experimenter).
- **Response**:
  - `stimuli` (array of objects): List of stimuli for the experiment.
    - `stimulusId` (string): ID of the stimulus.
    - `experimentId` (string): ID of the associated experiment.
    - ... (Additional stimulus properties)
- **Error Responses**:
  - `400 Bad Request`: Invalid experiment ID.
  - `401 Unauthorized`: User not authenticated as an experimenter.

### List Experiment Perceptual Dimensions

- **URL**: `/api/dashboard/experiments/:experimentId/perceptualDimensions`
- **Method**: `GET`
- **Description**: Get all perceptual dimensions associated with the specified experiment.
- **Access**: Private (requires authentication as an experimenter).
- **Response**:
  - `perceptualDimensions` (array of objects): List of perceptual dimensions for the experiment.
    - `perceptualDimensionId` (string): ID of the perceptual dimension.
    - `experimentId` (string): ID of the associated experiment.
    - ... (Additional perceptual dimension properties)
- **Error Responses**:
  - `400 Bad Request`: Invalid experiment ID.
  - `401 Unauthorized`: User not authenticated as an experimenter.

### List All Stimuli of a Specific Type

- **URL**: `/api/dashboard/stimuli/types/:type`
- **Method**: `GET`
- **Description**: Get all stimuli of the specified type.
- **Access**: Private (requires authentication as an experimenter).
- **Response**:
  - `stimuli` (array of objects): List of stimuli of the specified type.
    - `stimulusId` (string): ID of the stimulus.
    - `type` (string): Type of the stimulus (e.g., "text", "img", "audio").
    - ... (Additional stimulus properties)
- **Error Responses**:
  - `400 Bad Request`: Invalid stimulus type.
  - `401 Unauthorized`: User not authenticated as an experimenter.

### Query Stimuli

- **URL**: `/api/dashboard/stimuli`
- **Method**: `GET`
- **Description**: Query stimuli based on specific criteria.
- **Access**: Private (requires authentication as an experimenter).
- **Query Parameters**:
  - `type` (string, required): Type of the stimulus (e.g., "text", "img", "audio").
  - `mediaAssetId` (string, required): ID of the associated media asset.
  - `experimentId` (string, required): ID of the associated experiment.
- **Response**:
  - `stimuli` (array of objects): List of stimuli matching the query criteria.
    - `stimulusId` (string): ID of the stimulus.
    - `type` (string): Type of the stimulus.
    - ... (Additional stimulus properties)
- **Error Responses**:
  - `400 Bad Request`: Invalid query parameters.
  - `401 Unauthorized`: User not authenticated as an experimenter.

### Get Stimulus by ID

- **URL**: `/api/dashboard/stimuli/:stimulusId`
- **Method**: `GET`
- **Description**: Get the specified stimulus by ID.
- **Access**: Private (requires authentication as an experimenter).
- **Response**:
  - `stimulusId` (string): ID of the stimulus.
  - `type` (string): Type of the stimulus.
  - ... (Additional stimulus properties)
- **Error Responses**:
  - `400 Bad Request`: Invalid stimulus ID.
  - `401 Unauthorized`: User not authenticated as an experimenter.

### Update Stimulus

- **URL**: `/api/dashboard/stimuli/:stimulusId`
- **Method**: `PATCH`
- **Description**: Update the specified stimulus by ID.
- **Access**: Private (requires authentication as an experimenter).
- **Request Body**:
  - `title` (string): New title for the stimulus.
  - `type` (string): New type for the stimulus.
  - ... (Additional stimulus properties to update)
- **Response**:
  - `stimulusId` (string): ID of the updated stimulus.
  - `type` (string): Updated type of the stimulus.
  - ... (Additional updated stimulus properties)
- **Error Responses**:
  - `400 Bad Request`: Invalid stimulus ID or request body.
  - `401 Unauthorized`: User not authenticated as an experimenter.

### Delete Stimulus

- **URL**: `/api/dashboard/stimuli/:stimulusId`
- **Method**: `DELETE`
- **Description**: Delete the specified stimulus by ID.
- **Access**: Private (requires authentication as an experimenter).
- **Response**:
  - `message` (string): Confirmation message.
- **Error Responses**:
  - `400 Bad Request`: Invalid stimulus ID.
  - `401 Unauthorized`: User not authenticated as an experimenter.

### List Perceptual Dimensions of a Specific Type

- **URL**: `/api/dashboard/perceptualDimensions/types/:type`
- **Method**: `GET`
- **Description**: Get all perceptual dimensions of the specified type.
- **Access**: Private (requires authentication as an experimenter).
- **Response**:
  - `perceptualDimensions` (array of objects): List of perceptual dimensions of the specified type.
    - `perceptualDimensionId` (string): ID of the perceptual dimension.
    - `type` (string): Type of the perceptual dimension.
    - ... (Additional perceptual dimension properties)
- **Error Responses**:
  - `400 Bad Request`: Invalid perceptual dimension type.
  - `401 Unauthorized`: User not authenticated as an experimenter.

### Query Perceptual Dimensions

- **URL**: `/api/dashboard/perceptualDimensions`
- **Method**: `GET`
- **Description**: Get perceptual dimensions based on query parameters.
- **Access**: Private (requires authentication as an experimenter).
- **Query Parameters**:
  - `type` (string): Type of the perceptual dimension.
  - `mediaAssetId` (string): ID of the associated media asset.
  - `experimentId` (string): ID of the associated experiment.
- **Response**:
  - `perceptualDimensions` (array of objects): List of perceptual dimensions matching the query.
    - `perceptualDimensionId` (string): ID of the perceptual dimension.
    - `type` (string): Type of the perceptual dimension.
    - ... (Additional perceptual dimension properties)
- **Error Responses**:
  - `400 Bad Request`: Invalid query parameters.
  - `401 Unauthorized`: User not authenticated as an experimenter.

### Create New Perceptual Dimension

- **URL**: `/api/dashboard/perceptualDimensions`
- **Method**: `POST`
- **Description**: Create a new perceptual dimension.
- **Access**: Private (requires authentication as an experimenter).
- **Request Body**:
  - `title` (string): Title of the perceptual dimension.
  - `type` (string): Type of the perceptual dimension.
  - ... (Additional perceptual dimension properties)
- **Response**:
  - `perceptualDimensionId` (string): ID of the created perceptual dimension.
  - `type` (string): Type of the created perceptual dimension.
  - ... (Additional created perceptual dimension properties)
- **Error Responses**:
  - `400 Bad Request`: Invalid request body.
  - `401 Unauthorized`: User not authenticated as an experimenter.

### Update Perceptual Dimension

- **URL**: `/api/dashboard/perceptualDimensions/:perceptualDimensionId`
- **Method**: `PATCH`
- **Description**: Update the specified perceptual dimension by ID.
- **Access**: Private (requires authentication as an experimenter).
- **Request Body**:
  - `title` (string): New title for the perceptual dimension.
  - `type` (string): New type for the perceptual dimension.
  - ... (Additional perceptual dimension properties to update)
- **Response**:
  - `perceptualDimensionId` (string): ID of the updated perceptual dimension.
  - `type` (string): Updated type of the perceptual dimension.
  - ... (Additional updated perceptual dimension properties)
- **Error Responses**:
  - `400 Bad Request`: Invalid perceptual dimension ID or request body.
  - `401 Unauthorized`: User not authenticated as an experimenter.

### Delete Perceptual Dimension

- **URL**: `/api/dashboard/perceptualDimensions/:perceptualDimensionId`
- **Method**: `DELETE`
- **Description**: Delete the specified perceptual dimension by ID.
- **Access**: Private (requires authentication as an experimenter).
- **Response**:
  - `message` (string): Confirmation message.
- **Error Responses**:
  - `400 Bad Request`: Invalid perceptual dimension ID.
  - `401 Unauthorized`: User not authenticated as an experimenter.

### List Media Assets by Query

- **URL**: `/api/dashboard/media_assets`
- **Method**: `GET`
- **Description**: List media assets based on query parameters.
- **Access**: Private (requires authentication as an experimenter).
- **Query Parameters**:
  - `mimetype` (string): Mimetype of the media asset.
  - `perceptualDimensionId` (string): ID of the associated perceptual dimension.
- **Response**:
  - `mediaAssets` (array of objects): List of media assets matching the query.
    - `mediaAssetId` (string): ID of the media asset.
    - `mimetype` (string): Mimetype of the media asset.
    - ... (Additional media asset properties)
- **Error Responses**:
  - `400 Bad Request`: Invalid query parameters.
  - `401 Unauthorized`: User not authenticated as an experimenter.

 ### List Stimuli Associated with a Media Asset

- **URL**: `/api/dashboard/media_assets/:mediaAssetId/stimuli`
- **Method**: `GET`
- **Description**: List all stimuli associated with the specified media asset.
- **Access**: Private (requires authentication as an experimenter).
- **URL Parameters**:
  - `mediaAssetId` (string): ID of the media asset.
- **Response**:
  - `stimuli` (array of objects): List of stimuli associated with the media asset.
    - `stimulusId` (string): ID of the stimulus.
    - `title` (string): Title of the stimulus.
    - ... (Additional stimulus properties)
- **Error Responses**:
  - `400 Bad Request`: Invalid media asset ID.
  - `401 Unauthorized`: User not authenticated as an experimenter.

### Create New Media Asset

- **URL**: `/api/dashboard/media_assets`
- **Method**: `POST`
- **Description**: Create a new media asset.
- **Access**: Private (requires authentication as an experimenter).
- **Request Body**:
  - `mimetype` (string): Mimetype of the media asset.
  - `filename` (string): Filename of the media asset.
- **Response**:
  - `mediaAssetId` (string): ID of the created media asset.
  - `mimetype` (string): Mimetype of the created media asset.
  - ... (Additional created media asset properties)
- **Error Responses**:
  - `400 Bad Request`: Invalid request body.
  - `401 Unauthorized`: User not authenticated as an experimenter.

### Update Media Asset

- **URL**: `/api/dashboard/media_assets/:mediaAssetId`
- **Method**: `PATCH`
- **Description**: Update the specified media asset by ID.
- **Access**: Private (requires authentication as an experimenter).
- **Request Body**:
  - `mimetype` (string): New mimetype for the media asset.
  - `filename` (string): New filename for the media asset.
- **Response**:
  - `mediaAssetId` (string): ID of the updated media asset.
  - `mimetype` (string): Updated mimetype of the media asset.
  - ... (Additional updated media asset properties)
- **Error Responses**:
  - `400 Bad Request`: Invalid media asset ID or request body.
  - `401 Unauthorized`: User not authenticated as an experimenter.

### Download Media Asset

- **URL**: `/api/dashboard/media_assets/:mediaAssetId/download`
- **Method**: `GET`
- **Description**: Download the specified media asset.
- **Access**: Private (requires authentication as an experimenter).
- **URL Parameters**:
  - `mediaAssetId` (string): ID of the media asset.
- **Response**: The media asset file.
- **Error Responses**:
  - `400 Bad Request`: Invalid media asset ID.
  - `401 Unauthorized`: User not authenticated as an experimenter.

### Delete Media Asset

- **URL**: `/api/dashboard/media_assets/:mediaAssetId`
- **Method**: `DELETE`
- **Description**: Delete the specified media asset by ID.
- **Access**: Private (requires authentication as an experimenter).
- **Response**:
  - `message` (string): Confirmation message.
- **Error Responses**:
  - `400 Bad Request`: Invalid media asset ID.
  - `401 Unauthorized`: User not authenticated as an experimenter.
 
