const Event = require("../models/event.model");
const UserPreference = require("../models/userpreference.model");

const parseTimeToDate = (date, time) => {
  const [hours, minutes] = time.split(":").map(Number);
  const [DD, MM, YYYY] = date.split("/").map(Number);
  return new Date(YYYY, MM - 1, DD, hours, minutes);
};

// Helper function to map events to the required format
const mapEvents = (events) =>
  events.map((event) => ({
    id: event._id.toString(),
    event_id: event.event_id,
    eventAuthor: event.user_id.fullname,
    title: event.title,
    description: event.description,
    location: event.location,
    date: event.date,
    startTime: event.start_time,
    endTime: event.end_time,
    isPaid: event.is_paid,
    ticketPrice: event.ticket_price,
    maxAttendees: event.max_attendees,
    currentAttendees: event.current_attendees,
    category: event.category,
    images: event.images || []
}));


// Get all events
const allEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 }).populate("user_id", "fullname email");
    res.status(200).json({ success: true, count: events.length, data: mapEvents(events) });
  } catch (error) {
    console.error("Error fetching events:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get upcoming events
const allUpcomingEvents = async (req, res) => {
  try {
    const user_id = req.user ? req.user._id : null;
    let events = await Event.find().populate("user_id", "fullname email");

    if (user_id) {
      const userPreference = await UserPreference.findOne({ user_id });
      if (userPreference) {
        events = events.sort((a, b) => {
          const aInPreferredCategory = userPreference.preferred_category.includes(a.category);
          const bInPreferredCategory = userPreference.preferred_category.includes(b.category);
          return aInPreferredCategory === bInPreferredCategory ? 0 : aInPreferredCategory ? -1 : 1;
        });
      }
    }

    const now = new Date();
    events = events.filter((event) => parseTimeToDate(event.date, event.start_time) >= now);

    res.status(200).json({ success: true, count: events.length, data: mapEvents(events) });
  } catch (error) {
    console.error("Error fetching upcoming events:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get in-progress events
const allInProgressEvents = async (req, res) => {
  try {
    const user_id = req.user ? req.user._id : null;
    let events = await Event.find().populate("user_id", "fullname");

    if (user_id) {
      const userPreference = await UserPreference.findOne({ user_id });
      if (userPreference) {
        events = events.sort((a, b) => {
          const aInPreferredCategory = userPreference.preferred_category.includes(a.category);
          const bInPreferredCategory = userPreference.preferred_category.includes(b.category);
          return aInPreferredCategory === bInPreferredCategory ? 0 : aInPreferredCategory ? -1 : 1;
        });
      }
    }

    const now = new Date();
    events = events.filter((event) => {
      const eventStartTime = parseTimeToDate(event.date, event.start_time);
      const eventEndTime = parseTimeToDate(event.date, event.end_time);
      return eventStartTime <= now && eventEndTime >= now;
    });

    res.status(200).json({ success: true, count: events.length, data: mapEvents(events) });
  } catch (error) {
    console.error("Error fetching in-progress events:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get past events
const allPastEvents = async (req, res) => {
  try {
    const user_id = req.user ? req.user._id : null;
    let events = await Event.find().populate("user_id", "fullname");

    if (user_id) {
      const userPreference = await UserPreference.findOne({ user_id });
      if (userPreference) {
        events = events.sort((a, b) => {
          const aInPreferredCategory = userPreference.preferred_category.includes(a.category);
          const bInPreferredCategory = userPreference.preferred_category.includes(b.category);
          return aInPreferredCategory === bInPreferredCategory ? 0 : aInPreferredCategory ? -1 : 1;
        });
      }
    }

    const now = new Date();
    events = events.filter((event) => parseTimeToDate(event.date, event.end_time) < now);

    res.status(200).json({ success: true, count: events.length, data: mapEvents(events) });
  } catch (error) {
    console.error("Error fetching past events:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Sort events by criteria
const sort = async (req, res) => {
  try {
    const { criteria = "date", order = "asc" } = req.query;
    let events = await Event.find().populate("user_id", "fullname email");

    switch (criteria.toLowerCase()) {
      case "title":
        events.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "ticketprice":
        events.sort((a, b) => a.ticket_price - b.ticket_price);
        break;
      case "date":
      default:
        events.sort((a, b) => parseTimeToDate(a.date, a.start_time) - parseTimeToDate(b.date, b.start_time));
        break;
    }

    if (order.toLowerCase() === "desc") {
      events.reverse();
    }

    res.status(200).json({ success: true, count: events.length, data: mapEvents(events) });
  } catch (error) {
    console.error("Error sorting events:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get event details
const EventDetails = async (req, res) => {
  try {
    const eventId = req.params.id;

    if (!eventId) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    let event = [];
    
    try {
      event = await Event.findOne({ event_id: eventId }).populate("user_id", "fullname email");
    } catch (error) {
      event = await Event.findById(eventId).populate("user_id", "fullname email");
    }

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Return event details
    res.status(200).json({
      success: true,
      data: {
        id: event._id.toString(),
        event_id: event.event_id,
        eventAuthor: event.user_id.fullname,
        title: event.title,
        description: event.description,
        location: event.location,
        date: event.date,
        startTime: event.start_time, // Ensure that this matches your schema
        endTime: event.end_time,     // Ensure that this matches your schema
        isPaid: event.is_paid,       // Ensure that this matches your schema
        ticketPrice: event.ticket_price,
        maxAttendees: event.max_attendees,
        currentAttendees: event.current_attendees,
        category: event.category,
        images: event.images || []
      },
    });

  } catch (error) {
    console.error("Error fetching event details:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Create event
const createEvent = async (req, res) => {
  try {
    const { title, description, location, start_time, end_time, date, is_paid, ticket_price, max_attendees, images, category } = req.body;

    if (!title || !description || !location || !date || !start_time || !end_time || is_paid === undefined) {
      return res.status(400).json({ error: "Please fill in all required fields" });
    }

    // Generate a new event_id (you can customize this logic as needed)
    const lastEvent = await Event.findOne().sort({ event_id: -1 }).exec();
    const newEventId = lastEvent ? lastEvent.event_id + 1 : 1000; // Start with 1000 if no events exist

    const newEvent = new Event({
      user_id: req.user._id,
      event_id: newEventId,
      title,
      description,
      location,
      start_time,
      end_time,
      date,
      is_paid,
      ticket_price: is_paid ? ticket_price : 0,
      max_attendees,
      images,
      category,
    });

    await newEvent.save();
    res.status(201).json({ message: "Event created successfully", event: newEvent });
  } catch (error) {
    console.error("Error creating event:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};


// Update event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const eventUpdates = req.body;

    const event = await Event.findByIdAndUpdate(id, eventUpdates, { new: true }).populate("user_id", "fullname email");

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    res.status(200).json({ success: true, data: mapEvents([event])[0] });
  } catch (error) {
    console.error("Error updating event:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Cancel event
const cancelEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    event.isCancelled = true;
    await event.save();

    res.status(200).json({ success: true, message: "Event cancelled successfully." });
  } catch (error) {
    console.error("Error cancelling event:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  allEvents,
  allUpcomingEvents,
  allInProgressEvents,
  allPastEvents,
  sort,
  EventDetails,
  createEvent,
  updateEvent,
  cancelEvent,
};
