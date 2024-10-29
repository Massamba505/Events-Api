const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/user.model");
const connectToDatabase = require("../config/dbconnect");
const { logout } = require("../controllers/auth.controller");
const getUserToken = require("./login");
const { getUserDetails, getAllUserDetails } = require("../controllers/users.controller");
const BASE = "/api/events";

// Connect to the database before running tests
beforeAll(async () => {
    try {
        await connectToDatabase();
    } catch (error) {
        console.error("Test database connection failed:", error);
    }
});

// Close the database connection after all tests
afterAll(async () => {
    await mongoose.connection.close();
});

describe("Database connection", () => {

    describe(`Testing connections to database`,()=>{
        test("should return 500 if an error occurs", async () => {
            // Mock mongoose.connect to simulate a server error
            jest.spyOn(mongoose, "connect").mockImplementation(({}) => {
                throw new Error("Simulated server error");
            });

            
            try {
                await connectToDatabase();
            } catch (error) {
                expect(error.message).toBe("Failed to connect to MongoDB");
            }

            // Restore the original implementation of mongoose.connect
            mongoose.connect.mockRestore();
        });
    });
});
describe("Testing Middleware", () => {
    describe(`Testing protection middleware`, () => {
        test("called with no token", async () => {
          const mockToken = null;
          const response = await request(app).get(`${BASE}/myevents`)
          expect(response.statusCode).toBe(401);
          expect(response.body).toHaveProperty("error", "Unauthorized - No Token Provided");
        });
        // test("called with invalid token", async () => {
        //   const mockToken = "invalid";
        //   const response = await request(app).get(`${BASE}/myevents`)
        //   .set("Authorization", `Bearer ${mockToken}`);
        //   expect(response.statusCode).toBe(401);
        //   expect(response.body).toHaveProperty("error", "Unauthorized - Invalid Tokend");
        // });
    })
});
