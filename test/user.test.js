const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/user.model");
const connectToDatabase = require("../config/dbconnect");
const { logout } = require("../controllers/auth.controller");
const getUserToken = require("./login");
const { getUserDetails, getAllUserDetails } = require("../controllers/users.controller");
const BASE = "/api/user";

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

describe("User Routes", () => {
  
    describe(`GET ${BASE}/ - logged in user details`,()=>{
        test("should return 200 when logged in", async () => {
            const mockToken = await getUserToken();
            const response = await request(app).get(`${BASE}/`)
            .set("Authorization", `Bearer ${mockToken}`);
            expect(response.statusCode).toBe(200);
        });
        test("should return 500 if an error occurs", async () => {
            const res = {
                status: jest.fn().mockReturnThis(), // Chainable
                json: jest.fn(),
            };
    
            const req = {
                user: null
            };
    
            await getUserDetails(req, res);
    
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
        });
    });

    describe(`GET ${BASE}/all - all users details`,()=>{
        test("should return 200 when logged in", async () => {
            const mockToken = await getUserToken();
            const response = await request(app).get(`${BASE}/all`)
            .set("Authorization", `Bearer ${mockToken}`);
            expect(response.statusCode).toBe(200);
        });
        test("should return 500 if an error occurs", async () => {
            // Mock User.find to simulate a server error
            jest.spyOn(User, "find").mockImplementation(({}) => {
                throw new Error("Simulated server error");
            });

            const mockToken = await getUserToken();
            const response = await request(app).get(`${BASE}/all`)
            .set("Authorization", `Bearer ${mockToken}`);
            expect(response.statusCode).toBe(500); // Expecting a 500 status code
            expect(response.body).toHaveProperty("error", "Internal Server Error");

            // Restore the original implementation of User.find
            User.find.mockRestore();
        });
    });
  
});