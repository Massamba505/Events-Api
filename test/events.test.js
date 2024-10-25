const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const Event = require("../models/event.model");
const connectToDatabase = require("../config/dbconnect");
const getUserToken = require("./login");
const BASE = "/api/events";
let mockData = [];

const parseTimeToDate = (date, time) => {
  // date format DD/MM/YYYY and time format HH:MM
  const [hours, minutes] = time.split(":").map(Number);
  const [DD, MM, YYYY] = date.split("/").map(Number);
  return new Date(YYYY, MM - 1, DD, hours, minutes);
};

// Connect to the database before running tests
beforeAll(async () => {
    try {
        await connectToDatabase();
        const response = await request(app).get(`${BASE}/`);
        mockData = response.body.data;
    } catch (error) {
        console.error("Test database connection failed:", error);
    }
});

// Close the database connection after all tests
afterAll(async () => {
    await mongoose.connection.close();
});

describe("Event routes (unprotected)", () => {
  describe(`GET ${BASE}/ - All Events Route`, () => {
    test("should fetch all events", async () => {
        const response = await request(app).get(`${BASE}/`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeDefined();
        for(let i = 0; i < response.body.data.count; i++){
          expect(response.body.data[i].isCancelled).toBe(false);
          expect(response.body.data[i].status).toBe("approved");
        }
    });
    
    test("should return 500 if an error occurs", async () => {
        // Mock Event.find to simulate a server error
        jest.spyOn(Event, "find").mockImplementation(() => {
            throw new Error("Simulated server error");
        });

        const response = await request(app).get(`${BASE}/`);
        expect(response.statusCode).toBe(500); // Expecting a 500 status code
        expect(response.body).toHaveProperty("error", "Internal Server Error");

        // Restore the original implementation of Event.find
        Event.find.mockRestore();
    });
  });
  
  describe(`GET ${BASE}/upcoming-events - Upcoming Events Route`, () => {
    test("should only return upcoming events", async () => {
      const response = await request(app).get(`${BASE}/upcoming-events`);
  
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);

      const now = new Date();
      
      for(let i = 0; i < response.body.data.count; i++){
        const event = response.body.data[i];
        const eventStartTime = parseTimeToDate(event.date, event.start_time);
        expect(eventStartTime).toBeGreaterThanOrEqual(now);
        expect(event.status).toBe("approved");
      }
    });

    test("should return 500 if an error occurs", async () => {
      // Mock Event.find to simulate a server error
      jest.spyOn(Event, "find").mockImplementation(() => {
        throw new Error("Simulated server error");
      });

      const response = await request(app).get("/api/events/upcoming-events");

      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty("error", "Internal Server Error");

      // Restore the original implementation of Event.find
      Event.find.mockRestore();
    });
  });

  describe(`GET ${BASE}/inprogress-events - In progress Events Route`, () => {
    test("should only return In progress events", async () => {
      const response = await request(app).get(`${BASE}/inprogress-events`);
  
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);

      const now = new Date();
      
      for(let i = 0; i < response.body.data.count; i++){
        const event = response.body.data[i];
        const eventStartTime = parseTimeToDate(event.date, event.start_time);
        const eventEndTime = parseTimeToDate(event.date, event.end_time);
        expect(eventStartTime).toBeLessThanOrEqual(now);
        expect(eventEndTime).toBeGreaterThanOrEqual(now);
        expect(event.status).toBe("approved");
      }
    });

    test("should return 500 if an error occurs", async () => {
      // Mock Event.find to simulate a server error
      jest.spyOn(Event, "find").mockImplementation(() => {
        throw new Error("Simulated server error");
      });

      const response = await request(app).get("/api/events/inprogress-events");

      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty("error", "Internal Server Error");

      // Restore the original implementation of Event.find
      Event.find.mockRestore();
    });
  });

  describe(`GET ${BASE}/past-events - Past Events Route`, () => {
    test("should only return past events", async () => {
      const response = await request(app).get(`${BASE}/past-events`);
  
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);

      const now = new Date();
      
      for(let i = 0; i < response.body.data.count; i++){
        const event = response.body.data[i];
        const eventEndTime = parseTimeToDate(event.date, event.end_time);
        expect(eventEndTime).toBeLessThan(now);
        expect(event.status).toBe("approved");
      }
    });

    test("should return 500 if an error occurs", async () => {
      // Mock Event.find to simulate a server error
      jest.spyOn(Event, "find").mockImplementation(() => {
        throw new Error("Simulated server error");
      });

      const response = await request(app).get("/api/events/past-events");

      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty("error", "Internal Server Error");

      // Restore the original implementation of Event.find
      Event.find.mockRestore();
    });
  });
});

describe("Event routes (protected)", () => {
  describe(`POST ${BASE}/myEvents - My Events Events Route`, () => {
    test("should fetch my events", async () => {
      const loginResponce = await request(app).post(`/api/auth/login`).send({
        email:"abc123@gmail.com",
        password:"abc123"
      });
      expect(loginResponce.statusCode).toBe(201);
      const mockToken = loginResponce.body.token;
      const response = await request(app).get(`${BASE}/myevents`)
      .set("Authorization", `Bearer ${mockToken}`);
      expect(response.statusCode).toBe(200);
    });
    
    test("should return 500 if an error occurs", async () => {
        // Mock Event.find to simulate a server error
        jest.spyOn(Event, "find").mockImplementation(() => {
            throw new Error("Simulated server error");
        });
        const mockToken = await getUserToken();

        const response = await request(app).get(`${BASE}/myevents`)
        .set("Authorization", `Bearer ${mockToken}`);
        expect(response.statusCode).toBe(500); // Expecting a 500 status code
        expect(response.body).toHaveProperty("error", "Internal Server Error");

        // Restore the original implementation of Event.find
        Event.find.mockRestore();
    });
  });
});