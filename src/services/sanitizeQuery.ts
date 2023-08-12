import { UserQueryOptions } from "../db/daos/UserDAO.js";
import { API_ERROR_TYPES, ApiError } from "../middleware/errors.js";
import { z } from "zod";

// Define a schema for the query parameters
const querySchema = z.object({
  username: z.string().min(3).optional(),
  role: z.enum(["subject", "experimenter"]).optional(),
});

// Define a sanitizeQuery service function
export const sanitizeUserQuery = (query: any): UserQueryOptions => {
  try {
    // Validate and sanitize the query parameters
    const sanitizedQuery = querySchema.parse(query);
    return sanitizedQuery;
  } catch (error) {
    // Handle validation errors here (e.g., log, throw an error, etc.)
    throw new ApiError(
      API_ERROR_TYPES.ZOD_VALIDATION_ERROR,
      "Invalid query parameters",
    );
  }
};
