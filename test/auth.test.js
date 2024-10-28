const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/user.model");
const connectToDatabase = require("../config/dbconnect");
const { logout } = require("../controllers/auth.controller");
const BASE = "/api/auth";

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

  describe(`POST ${BASE}/ - log In`, () => {
    const testData = [
        {   
            message:"should login successful",
            data:{
                email:"abc123@gmail.com",
                password:"abc123"
            },
            status:201
        },
        {
            message:"login should be unsuccessful",
            data:{
                email:"abc123@gmail.com",
                password:"wrong password"
            },
            status:400
        },
        {
            data:{
                email:"wrong email",
                password:"abc123"
            },
            status:400
        },
        {
            data:{
                email:"abc123@gmail.com",
            },
            status:400
        },
        {
            data:{
                password:"abc123"
            },
            status:400
        },
        {
            data:{},
            status:400
        }
    ];

    for(let i = 0; i < testData.length; i++){
        const {data,status,message} = testData[i];
        test(`${message}`, async () => {
            const loginResponce = await request(app).post(`${BASE}/login`).send(
                data
            );
            expect(loginResponce.statusCode).toBe(status);
        });
    }
    

    test("should return 500 if an error occurs", async () => {
        // Mock User.findOne to simulate a server error
        jest.spyOn(User, "findOne").mockImplementation(() => {
            throw new Error("Simulated server error");
        });
    
        // Make the request (assuming login is a POST request)
        const response = await request(app).post(`${BASE}/login`).send({
          email:"abc123@gmail.com",
          password:"abc123"
        });
    
        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty("error", "Internal Server Error");
    
        // Restore the original implementation of User.findOne
        User.findOne.mockRestore();
    });
  });
  
  describe(`POST ${BASE}/logout - log out`,()=>{

    test("should return 200 when logged out", async () => {
        const response = await request(app).post(`${BASE}/logout`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("message", "Logged out successfully");
        expect(response.headers['set-cookie']).toBeDefined();
        expect(response.headers['set-cookie'][0]).toContain('jwt=; Max-Age=0');
    });
    test("should return 500 if an error occurs", async () => {
        const res = {
            cookie: jest.fn().mockImplementation(() => {
                throw new Error("Simulated server error");
            }),
            status: jest.fn().mockReturnThis(), // Chainable
            json: jest.fn(),
        };

        const req = {};

        await logout(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });
  
});