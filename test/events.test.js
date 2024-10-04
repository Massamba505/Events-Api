const request = require('supertest');
const app = require('../app'); // Main app file
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const Event = require('../models/Event');
const UserPreference = require('../models/UserPreference');

describe('Events API', function () {

    // Test for fetching all events
    describe('GET /api/events', function() {
      it('should fetch all events successfully', function(done) {
        request(app)
          .get('/api/events')
          .expect(200)  // Expect HTTP status 200
          .end((err, res) => {
            if (err) return done(err);
  
            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('count');
            expect(res.body).to.have.property('data').that.is.an('array');
            done();
          });
      });
    });
  
    // Test for fetching user-specific events with authentication
    describe('GET /api/events/myevents', function() {
      it('should return user-specific events when authenticated', function(done) {
        const fakeToken = 'Bearer some-jwt-token';  // Mock JWT token
  
        request(app)
          .get('/api/events/myevents')
          .set('Authorization', fakeToken)  // Set Authorization header
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
  
            expect(res.body).to.be.an('array');
            done();
          });
      });
    });
  

  // Test for fetching in-progress events
  describe('GET /api/events/inprogress', function () {
    it('should fetch all in-progress events and sort by user preference', async function () {
      const user_id = 'user123';
      const fakeEvents = [
        { title: 'Event 1', start_time: '10:00', end_time: '12:00', date: '2024-10-05', category: ['music'] },
        { title: 'Event 2', start_time: '11:00', end_time: '13:00', date: '2024-10-05', category: ['sports'] }
      ];

      sinon.stub(Event, 'find').resolves(fakeEvents);
      sinon.stub(UserPreference, 'findOne').resolves({ preferred_category: ['music'] });

      const res = await request(app)
        .get('/api/events/inprogress')
        .set('Authorization', `Bearer valid-token`)
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data[0].title).to.equal('Event 1'); // Sorted by preference
    });
  });

  // Test for fetching past events
  describe('GET /api/events/past', function () {
    it('should fetch all past events', async function () {
      const fakeEvents = [
        { title: 'Past Event 1', end_time: '14:00', date: '2023-10-04', category: ['conference'] }
      ];

      sinon.stub(Event, 'find').resolves(fakeEvents);

      const res = await request(app)
        .get('/api/events/past')
        .set('Authorization', `Bearer valid-token`)
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.be.an('array').with.lengthOf(1);
    });
  });

  // Test for fetching popular events
  describe('GET /api/events/popular', function () {
    it('should fetch top 8 popular events sorted by attendees', async function () {
      const fakeEvents = [
        { title: 'Popular Event 1', current_attendees: 50 },
        { title: 'Popular Event 2', current_attendees: 30 }
      ];

      sinon.stub(Event, 'find').resolves(fakeEvents);

      const res = await request(app)
        .get('/api/events/popular')
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data[0].title).to.equal('Popular Event 1'); // Sorted by attendees
    });
  });

  // Test for fetching recommended events
  describe('GET /api/events/recommended', function () {
    it('should return recommended events based on user preferences', async function () {
      const user_id = 'user123';
      const fakeEvents = [
        { title: 'Music Event', category: ['music'], date: '2024-10-05' },
        { title: 'Art Event', category: ['art'], date: '2024-10-06' }
      ];

      sinon.stub(UserPreference, 'findOne').resolves({ preferred_category: ['music', 'art'] });
      sinon.stub(Event, 'find').resolves(fakeEvents);

      const res = await request(app)
        .get('/api/events/recommended')
        .set('Authorization', `Bearer valid-token`)
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.be.an('array').with.lengthOf(2);
      expect(res.body.data[0].title).to.equal('Music Event'); // Matches preference
    });

    it('should return 401 if user is not authenticated', async function () {
      const res = await request(app)
        .get('/api/events/recommended')
        .expect(401);

      expect(res.body).to.have.property('error', 'User not authenticated');
    });
  });

  // Clean up mocks after each test
  afterEach(() => {
    sinon.restore();
  });
});
