const request = require("supertest");
const app = require("../app");
async function getUserToken(){
    const loginResponce = await request(app).post(`/api/auth/login`).send({
      email:"abc123@gmail.com",
      password:"abc123"
    });
    return loginResponce.body.token;
}

module.exports = getUserToken