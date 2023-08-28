import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import bcrypt from "bcryptjs";
import * as supertest from "supertest";
import { MockMongoMemoryDb } from "../../mockDB.js";
import app from "../../../src/server.js";
import { User } from "../../../src/db/models/User/user.valSchemas.js";
import { httpStatusCodes } from "../../../src/middleware/errors.js";
import UserDAO from "../../../src/db/daos/UserDAO.js";
import { parseCookieHeader } from "../../../src/utils/parseCookieHeader.js";

vi.mock("../../../src/middleware/logger.ts", () => {
  return {
    default: {
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
  };
});

describe("User Routes Integration Tests", () => {
  const request = supertest.default(app);

  // Get the MockMongoMemoryDb Singleton instance
  let mockDB: MockMongoMemoryDb;

  let mockUserData: Required<
    Pick<User, "username" | "email" | "password" | "role">
  >;

  beforeAll(async () => {
    mockDB = await MockMongoMemoryDb.getInstance();
    await mockDB.start();
  });

  afterAll(async () => {
    await mockDB.stop();
  });

  afterEach(async () => {
    await mockDB.clearCollections();
  });

  describe("Register User Route", () => {
    const endpoint = "/api/users/signup";
    mockUserData = {
      username: "subject_user_1",
      email: "subject1@user.com",
      password: "1234567890",
      role: "subject",
    };

    it("should respond with 201 and return the created user", async () => {
      const response = await request
        /* @ts-ignore */
        .post(endpoint)
        .type("form")
        .send(mockUserData);
      // .set("Accept", "application/json")
      // .set("Content-Type", "application/json");
      // console.log("response: ", response.headers);

      expect(response.status).toBe(httpStatusCodes.CREATED);
      expect(response.body.msg).toMatch(/successfully/);
      expect(response.body.userData).toBeDefined();

      expect(response.body.userData).toHaveProperty("_id");
      expect(response.body.userData).toHaveProperty("username");
      expect(response.body.userData).toHaveProperty("email");
      expect(response.body.userData).toHaveProperty("role");

      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("should respond with 400 validation error if required fields are missing", async () => {
      const incompleteUserData = { ...mockUserData, role: undefined };
      const response = await request
        /* @ts-ignore */
        .post(endpoint)
        .type("form")
        .send(incompleteUserData);

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.name).toBe("ValidationError");
    });

    it("should respond with 400 validation error if validation fails", async () => {
      const invalidUserData = {
        ...mockUserData,
        email: "a-mail",
      };

      const response = await request
        /* @ts-ignore */
        .post(endpoint)
        .type("form")
        .send(invalidUserData);

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.name).toBe("ValidationError");
    });

    it("should respond with 400 bad request error if user already exists", async () => {
      const user = await UserDAO.create({
        username: "subject_user_1",
        email: "subject1@user.com",
        password: bcrypt.hashSync(mockUserData.password, 10),
        role: "subject",
        createdAt: new Date().toUTCString(),
        updatedAt: new Date().toUTCString(),
      } as User);

      const response = await request
        /* @ts-ignore */
        .post(endpoint)
        .type("form")
        .send(mockUserData);

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toMatch(/already exists/i);
    });
  });

  describe("Login User Route", () => {
    const endpoint = "/api/users/login";
    mockUserData = {
      username: "subject_user_1",
      email: "subject1@user.com",
      password: "1234567890",
      role: "subject",
    };

    it("should respond with 200, set user data & token in req.sessionData, and return the user data", async () => {
      const user = await UserDAO.create({
        username: mockUserData.username,
        email: mockUserData.email,
        password: bcrypt.hashSync(mockUserData.password, 10),
        role: mockUserData.role,
        createdAt: new Date().toUTCString(),
        updatedAt: new Date().toUTCString(),
      } as User);
      const response = await request
        /* @ts-ignore */
        .post(endpoint)
        .type("form")
        .send({
          email: mockUserData.email,
          password: mockUserData.password,
        });
      // .set("Accept", "application/json")
      // .set("Content-Type", "application/json");
      // console.log("response: ", response.body);
      // console.log("response cookie", response.headers["set-cookie"]);

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response.body.msg).toMatch(/successful/);
      expect(response.body.userData).toBeDefined();

      expect(response.body.userData).toHaveProperty("_id");
      expect(response.body.userData).toHaveProperty("username");
      expect(response.body.userData).toHaveProperty("email");
      expect(response.body.userData).toHaveProperty("role");

      expect(response.headers["set-cookie"]).toBeDefined();
      expect(response.headers["set-cookie"]).toMatch(/token/);
    });

    it("should respond with 404 if user does not exist for the email", async () => {
      const user = await UserDAO.create({
        username: mockUserData.username,
        email: mockUserData.email,
        password: bcrypt.hashSync(mockUserData.password, 10),
        role: mockUserData.role,
        createdAt: new Date().toUTCString(),
        updatedAt: new Date().toUTCString(),
      } as User);
      const response = await request
        /* @ts-ignore */
        .post(endpoint)
        .type("form")
        .send({
          email: "alpha@mail.com",
          password: mockUserData.password,
        });
      // .set("Accept", "application/json")
      // .set("Content-Type", "application/json");
      // console.log("response: ", response.body);

      expect(response.status).toBe(httpStatusCodes.NOT_FOUND);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toMatch(/not found/);
    });

    it("should respond with 401 if password is incorrect", async () => {
      const user = await UserDAO.create({
        username: mockUserData.username,
        email: mockUserData.email,
        password: bcrypt.hashSync(mockUserData.password, 10),
        role: mockUserData.role,
        createdAt: new Date().toUTCString(),
        updatedAt: new Date().toUTCString(),
      } as User);
      const response = await request
        /* @ts-ignore */
        .post(endpoint)
        .type("form")
        .send({
          email: mockUserData.email,
          password: "0987654321",
        });
      // .set("Accept", "application/json")
      // .set("Content-Type", "application/json");
      // console.log("response: ", response.body.error);

      expect(response.status).toBe(httpStatusCodes.UNAUTHORIZED);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toMatch(/invalid/i);
    });

    it("should respond with 400 if password is not valid format", async () => {
      const user = await UserDAO.create({
        username: mockUserData.username,
        email: mockUserData.email,
        password: bcrypt.hashSync(mockUserData.password, 10),
        role: mockUserData.role,
        createdAt: new Date().toUTCString(),
        updatedAt: new Date().toUTCString(),
      } as User);
      const response = await request
        /* @ts-ignore */
        .post(endpoint)
        .type("form")
        .send({
          email: mockUserData.email,
          password: "1234",
        });
      // .set("Accept", "application/json")
      // .set("Content-Type", "application/json");
      // console.log("response: ", response.body.error.details.errors);

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.details.errors[0].message).toMatch(
        /too short/i,
      );
    });

    it("should respond with 400 if email is not valid format", async () => {
      const user = await UserDAO.create({
        username: mockUserData.username,
        email: mockUserData.email,
        password: bcrypt.hashSync(mockUserData.password, 10),
        role: mockUserData.role,
        createdAt: new Date().toUTCString(),
        updatedAt: new Date().toUTCString(),
      } as User);
      const response = await request
        /* @ts-ignore */
        .post(endpoint)
        .type("form")
        .send({
          email: "alpha-mail",
          password: mockUserData.password,
        });
      // .set("Accept", "application/json")
      // .set("Content-Type", "application/json");
      // console.log("response: ", response.body.error.details.errors);

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.details.errors[0].message).toMatch(
        /not a valid email/i,
      );
    });

    it("should respond with 400 if email is not provided", async () => {
      const user = await UserDAO.create({
        username: mockUserData.username,
        email: mockUserData.email,
        password: bcrypt.hashSync(mockUserData.password, 10),
        role: mockUserData.role,
        createdAt: new Date().toUTCString(),
        updatedAt: new Date().toUTCString(),
      } as User);
      const response = await request
        /* @ts-ignore */
        .post(endpoint)
        .type("form")
        .send({
          password: mockUserData.password,
        });
      // .set("Accept", "application/json")
      // .set("Content-Type", "application/json");
      // console.log("response: ", response.body.error.details.errors);

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.details.errors[0].message).toMatch(
        /email is required/i,
      );
    });

    it("should respond with 400 if password is not provided", async () => {
      const user = await UserDAO.create({
        username: mockUserData.username,
        email: mockUserData.email,
        password: bcrypt.hashSync(mockUserData.password, 10),
        role: mockUserData.role,
        createdAt: new Date().toUTCString(),
        updatedAt: new Date().toUTCString(),
      } as User);
      const response = await request
        /* @ts-ignore */
        .post(endpoint)
        .type("form")
        .send({
          email: mockUserData.email,
        });
      // .set("Accept", "application/json")
      // .set("Content-Type", "application/json");
      // console.log("response: ", response.body.error.details.errors);

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.details.errors[0].message).toMatch(
        /password is required/i,
      );
    });
  });

  describe("Logout User Route", () => {
    const endpoint = "/api/users/logout";
    mockUserData = {
      username: "subject_user_1",
      email: "subject1@user.com",
      password: "1234567890",
      role: "subject",
    };

    it("should respond with 200, empty the sessionData and return a logout success message", async () => {
      const user = await UserDAO.create({
        username: mockUserData.username,
        email: mockUserData.email,
        password: bcrypt.hashSync(mockUserData.password, 10),
        role: mockUserData.role,
        createdAt: new Date().toUTCString(),
        updatedAt: new Date().toUTCString(),
      } as User);

      const initRes = await request
        /* @ts-ignore */
        .post("/api/users/login")
        .type("form")
        .send({
          email: mockUserData.email,
          password: mockUserData.password,
        });
      let cookieObj = parseCookieHeader(initRes.headers["set-cookie"][0]);
      // console.log("after login: ", initRes.headers["set-cookie"]);
      // console.log("after login: cookieObj=", cookieObj);

      expect(cookieObj["user.sess"]).toMatch(/token/i);

      const response = await request
        /* @ts-ignore */
        .post(endpoint);
      // console.log("After Logout: ", response.headers["set-cookie"]);

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response.body.msg).toBe("Logout successful");
      cookieObj = parseCookieHeader(response.headers["set-cookie"][0]);
      expect(cookieObj["user.sess"]).toBe("");
    });
  });

  describe("Get Profile Route", () => {
    const endpoint = "/api/users/profile";
    mockUserData = {
      username: "subject_user_1",
      email: "subject1@user.com",
      password: "1234567890",
      role: "subject",
    };

    it("should respond with 200 and return the user's profile data", async () => {
      const user = await UserDAO.create({
        username: mockUserData.username,
        email: mockUserData.email,
        password: bcrypt.hashSync(mockUserData.password, 10),
        role: mockUserData.role,
        createdAt: new Date().toUTCString(),
        updatedAt: new Date().toUTCString(),
      } as User);

      const agent = supertest.agent(app);

      // login to set the sessionData
      const response = await agent
        /* @ts-ignore */
        .post("/api/users/login")
        .type("form")
        .send({
          email: mockUserData.email,
          password: mockUserData.password,
        })
        .then(() => {
          return (
            agent
              /* @ts-ignore */
              .get(endpoint)
          );
        });

      // console.log(response.headers);
      // expect(response.headers["set-cookie"]).toBeDefined();

      // const response = await request
      //   /* @ts-ignore */
      //   .get(endpoint)
      //   .set("Content-Type", "application/json");

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response.body.msg).toBe("Profile fetched successfully");
      expect(response.body.userData).toBeDefined();

      expect(response.body.userData).toHaveProperty("_id");
      expect(response.body.userData).toHaveProperty("username");
      expect(response.body.userData).toHaveProperty("email");
      expect(response.body.userData).toHaveProperty("role");
    });
  });

  describe("Update Account Info Route", () => {
    const endpoint = "/api/users/account";
    const mockUpdatedUserData = {
      username: "updated_user",
      email: "updated_user@example.com",
      password: "newpassword",
    };

    it("should respond with 200 and return the updated user data", async () => {
      const user = await UserDAO.create({
        username: "user",
        email: "user@example.com",
        password: bcrypt.hashSync("password", 10),
        role: "subject",
        createdAt: new Date().toUTCString(),
        updatedAt: new Date().toUTCString(),
      } as User);

      const agent = supertest.agent(app);

      // Login to set the sessionData
      const response = await agent
        /* @ts-ignore */
        .post("/api/users/login")
        .type("form")
        .send({
          email: "user@example.com",
          password: "password",
        })
        .then(() => {
          return (
            agent
              /* @ts-ignore */
              .put(endpoint)
              .type("form")
              .send(mockUpdatedUserData)
          );
        });

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response.body.msg).toBe("Profile updated successfully");
      expect(response.body.userData).toBeDefined();

      // Verify the updated user data
      expect(response.body.userData).toHaveProperty("_id", user._id.toString());
      expect(response.body.userData).toHaveProperty(
        "username",
        mockUpdatedUserData.username,
      );
      expect(response.body.userData).toHaveProperty(
        "email",
        mockUpdatedUserData.email,
      );
      expect(response.body.userData).toHaveProperty("role", user.role);
    });

    it("should respond with 401 if user is not authenticated", async () => {
      const response = await request
        /* @ts-ignore */
        .put(endpoint)
        .type("form")
        .send(mockUpdatedUserData);

      expect(response.status).toBe(httpStatusCodes.UNAUTHORIZED);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toMatch(/Not Authorized/);
    });
  });

  describe("Delete Account Route", () => {
    const endpoint = "/api/users/account";

    it("should respond with 200 and return a success message when deleting the account", async () => {
      const user = await UserDAO.create({
        username: "user",
        email: "user@example.com",
        password: bcrypt.hashSync("password", 10),
        role: "subject",
        createdAt: new Date().toUTCString(),
        updatedAt: new Date().toUTCString(),
      } as User);

      const agent = supertest.agent(app);

      const response = await agent
        /* @ts-ignore */
        .post("/api/users/login")
        .type("form")
        .send({
          email: user.email,
          password: "password",
        })
        .then(() => {
          return (
            agent
              /* @ts-ignore */
              .delete(endpoint)
          );
        });
      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response.body.msg).toBe("Account deleted successfully");
    });
  });

  describe("Get users by role Route", () => {
    const endpoint = "/api/users/roles/:role";

    it("should respond with 200 and return users of specified role", async () => {
      const user1 = await UserDAO.create({
        username: "user1",
        email: "user1@example.com",
        password: bcrypt.hashSync("password1", 10),
        role: "experimenter",
        createdAt: new Date().toUTCString(),
        updatedAt: new Date().toUTCString(),
      } as User);

      const user2 = await UserDAO.create({
        username: "user2",
        email: "user2@example.com",
        password: bcrypt.hashSync("password2", 10),
        role: "experimenter",
        createdAt: new Date().toUTCString(),
        updatedAt: new Date().toUTCString(),
      } as User);

      const agent = supertest.agent(app);

      // Login and then query the other endpoint, in order to keep the login cookie
      const response = await agent
        /* @ts-ignore */
        .post("/api/users/login")
        .type("form")
        .send({
          email: "user1@example.com",
          password: "password1",
        })
        .then(() => {
          return (
            agent
              /* @ts-ignore */
              .get(endpoint.replace(":role", "experimenter"))
          );
        });

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response.body.msg).toMatch(/Fetched users by role/);
      expect(response.body.users).toBeDefined();
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThanOrEqual(2); // At least 2 users
    });

    it("should respond with 400 for invalid role", async () => {
      const user1 = await UserDAO.create({
        username: "user1",
        email: "user1@example.com",
        password: bcrypt.hashSync("password1", 10),
        role: "experimenter",
        createdAt: new Date().toUTCString(),
        updatedAt: new Date().toUTCString(),
      } as User);
      const agent = supertest.agent(app);

      // Login and then query the other endpoint, in order to keep the login cookie
      const response = await agent
        /* @ts-ignore */
        .post("/api/users/login")
        .type("form")
        .send({
          email: "user1@example.com",
          password: "password1",
        })
        .then(() => {
          return (
            agent
              /* @ts-ignore */
              .get(endpoint.replace(":role", "invalidRole"))
          );
        });

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toMatch(/Invalid role/);
    });
  });

  describe("Query users Route", () => {
    const endpoint = "/api/users";

    it("should respond with 200 and return users by query", async () => {
      const user1 = await UserDAO.create({
        username: "user1",
        email: "user1@example.com",
        password: bcrypt.hashSync("password1", 10),
        role: "subject",
        createdAt: new Date().toUTCString(),
        updatedAt: new Date().toUTCString(),
      } as User);

      const user2 = await UserDAO.create({
        username: "user2",
        email: "user2@example.com",
        password: bcrypt.hashSync("password2", 10),
        role: "experimenter",
        createdAt: new Date().toUTCString(),
        updatedAt: new Date().toUTCString(),
      } as User);

      const agent = supertest.agent(app);

      const response = await agent
        /* @ts-ignore */
        .post("/api/users/login")
        .type("form")
        .send({
          email: "user2@example.com",
          password: "password2",
        })
        .then(() => {
          return (
            agent
              /* @ts-ignore */
              .get(endpoint)
              .query({ role: "subject" })
          );
        });

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response.body.msg).toMatch(/Fetched users by query/);
      expect(response.body.users).toBeDefined();
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBe(1); // Only 1 subject user
      expect(response.body.users[0].username).toBe("user1");
    });

    it("should respond with 400 if query parameter is not valid", async () => {
      const user1 = await UserDAO.create({
        username: "user2",
        email: "user2@example.com",
        password: bcrypt.hashSync("password2", 10),
        role: "experimenter",
        createdAt: new Date().toUTCString(),
        updatedAt: new Date().toUTCString(),
      } as User);
      const agent = supertest.agent(app);

      const response = await agent
        /* @ts-ignore */
        .post("/api/users/login")
        .type("form")
        .send({
          email: "user2@example.com",
          password: "password2",
        })
        .then(() => {
          return (
            agent
              /* @ts-ignore */
              .get(endpoint)
              .query({ invalidParam: "value" })
          );
        });

      console.log(response.body.error.details.errors);

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.name).toMatch(/validationError/i);
      expect(response.body.error.details.errors[0].code).toBe(
        "unrecognized_keys",
      );
    });
  });
});
