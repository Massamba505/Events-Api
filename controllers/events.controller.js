const Event = require("../models/event.model")
const Category = require("../models/eventCategory.model");
const UserPreference = require("../models/userpreference.model");
const { uploadImage } = require("../utils/azureBlob");
const path = require('path');
const fs = require('fs');
const userModel = require("../models/user.model");


const parseTimeToDate = (date, time) => {
    // date format DD/MM/YYYY and time format HH:MM
    const [hours, minutes] = time.split(':').map(Number);
    const [DD, MM, YYYY] = date.split('/').map(Number);
    return new Date(YYYY, MM - 1, DD, hours, minutes);
};

// Helper function to map events to the required format
const mapEvents = (events) =>
    events.map((event) => ({
      event_id: event.event_id,
      eventAuthor: event.user_id.fullname,
      email: event.user_id.email,
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

// getEvents

const allEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 }).populate("user_id", "fullname email profile_picture").populate("category");

        const allevents = mapEvents(events)

        res.status(200).json({
            success: true,
            count: allevents.length,
            data: allevents
        });
    } catch (error) {
        console.error('Error in fetching events: ', error.message);
        res.status(500).json({error: 'Internal Server Error' });
    }
};

const allUpcomingEvents = async (req, res) => {
    try {
      const user_id = req.user ? req.user._id : null;
      let events = await Event.find({})
      .populate("user_id", "fullname email profile_picture").populate("category");
  
      if (user_id) {
        const userPreference = await UserPreference.findOne({ user_id });
        if (userPreference) {
          events = events.sort((a, b) => {
            const aInPreferredCategory = a.category.some(cat => userPreference.preferred_category.includes(cat));
            const bInPreferredCategory = b.category.some(cat => userPreference.preferred_category.includes(cat));
            if (aInPreferredCategory && !bInPreferredCategory) return -1;
            if (!aInPreferredCategory && bInPreferredCategory) return 1;
            return 0;
          });
        }
      }
  
      const now = new Date();
      events = events.filter(event => {
        const eventStartTime = parseTimeToDate(event.date, event.start_time);
        return eventStartTime >= now;
      });
  
      const allevents = mapEvents(events);
  
      res.status(200).json({
        success: true,
        count: allevents.length,
        data: allevents
      });
    } catch (error) {
      console.error('Error in fetching upcoming events: ', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
};

const allInProgressEvents = async (req, res) => {
    try {
        const user_id = req.user ? req.user._id : null;

        let events = await Event.find({}).populate("user_id", "fullname email profile_picture").populate("category");

        if (user_id) {
            const userPreference = await UserPreference.findOne({ user_id });

            if (userPreference) {
                events = events.sort((a, b) => {
                    const aInPreferredCategory = a.category.some(cat => userPreference.preferred_category.includes(cat));
                    const bInPreferredCategory = b.category.some(cat => userPreference.preferred_category.includes(cat));

                    if (aInPreferredCategory && !bInPreferredCategory) return -1;
                    if (!aInPreferredCategory && bInPreferredCategory) return 1;
                    return 0;
                });
            }
        }

        const now = new Date();
        events = events.filter(event => {
            const eventStartTime = parseTimeToDate(event.date,event.start_time);
            const eventEndTime = parseTimeToDate(event.date,event.end_time);
            return eventStartTime <= now && eventEndTime >= now;
        });

        const allevents = mapEvents(events);

        res.status(200).json({
            success: true,
            count: allevents.length,
            data: allevents
        });
    } catch (error) {
        console.error('Error in fetching events: ', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const allPastEvents = async (req, res) => {
    try {
        const user_id = req.user ? req.user._id : null;

        let events = await Event.find({}).populate("user_id", "fullname email profile_picture").populate("category");

        if (user_id) {
            const userPreference = await UserPreference.findOne({ user_id });

            if (userPreference) {
                events = events.sort((a, b) => {
                    const aInPreferredCategory = a.category.some(cat => userPreference.preferred_category.includes(cat));
                    const bInPreferredCategory = b.category.some(cat => userPreference.preferred_category.includes(cat));

                    if (aInPreferredCategory && !bInPreferredCategory) return -1;
                    if (!aInPreferredCategory && bInPreferredCategory) return 1;
                    return 0;
                });
            }
        }

        const now = new Date();
        events = events.filter(event => {
            const eventEndTime = parseTimeToDate(event.date,event.end_time);
            return eventEndTime < now;
        });

        const allevents = mapEvents(events);

        res.status(200).json({
            success: true,
            count: allevents.length,
            data: allevents
        });
    } catch (error) {
        console.error('Error in fetching events: ', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// ==================================================================================

const sort = async (req,res)=>{
    try {
        const { criteria = 'date', order = 'asc' } = req.query;

        const user_id = req.user ? req.user._id : null;

        let events = await Event.find({})
        .populate({
          path: 'user_id',
          select: 'fullname'
        });

        if (user_id) {
            const userPreference = await UserPreference.findOne({ user_id });

            if (userPreference) {
                events = events.sort((a, b) => {
                    const aInPreferredCategory = a.category.some(cat => userPreference.preferred_category.includes(cat));
                    const bInPreferredCategory = b.category.some(cat => userPreference.preferred_category.includes(cat));

                    if (aInPreferredCategory && !bInPreferredCategory) return -1;
                    if (!aInPreferredCategory && bInPreferredCategory) return 1;
                    return 0;
                });
            }
        }

        switch(criteria.toLowerCase()) {
            case 'title':
                events = events.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'ticketprice':
                events = events.sort((a, b) => a.ticket_price - b.ticket_price);
                break;
            case 'date':
            default:
                events = events.sort((a, b) => {
                    const dateA = parseTimeToDate(a.date, a.start_time);
                    const dateB = parseTimeToDate(b.date, b.start_time);
                    return dateA - dateB;
                });
                break;
        }

        if (order.toLowerCase() === 'desc') {
            events = events.reverse();
        }

        const allevents = mapEvents(events)

        res.status(200).json({
            success: true,
            count: allevents.length,
            data: allevents
        });
    } catch (error) {
        console.error('Error in sorting events: ', error.message);
        res.status(500).json({error: 'Internal Server Error' });
    }
}

// ===================================================================================

const EventDetails = async (req, res) => {
    try {
        const eventId = req.params.id;
    
        if (!eventId) {
          return res.status(400).json({ error: "Event ID is required" });
        }
    
        let event = [];
        
        try {
          event = await Event.findOne({ event_id: eventId }).populate("user_id", "fullname email profile_picture").populate("category");
        } catch (error) {
          event = await Event.findById(eventId).populate("user_id", "fullname email profile_picture").populate("category");
        }
    
        if (!event) {
          return res.status(404).json({ error: "Event not found" });
        }

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
                startTime: event.start_time,
                endTime: event.end_time,
                isPaid: event.is_paid,
                ticketPrice: event.ticket_price,
                maxAttendees: event.max_attendees,
                currentAttendees: event.current_attendees,
                category: event.category,
                email: event.user_id.email,
                images: event.images || []
            }
        });
    } catch (error) {
        console.error('Error in Event Details: ', error.message);
        res.status(500).json({error: 'Internal Server Error' });
    }
};

// ==================================================================================

const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const {
        title, description, location, date, startTime, endTime, isPaid, ticketPrice,
        maxAttendees, currentAttendees, category, images
        } = req.body;
    
        if (!title || !description || !location || !date || !startTime || !endTime || isPaid === undefined) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
        }
    
        const event = await Event.findByIdAndUpdate(id, {
        title, description, location, date, start_time: startTime, end_time: endTime,
        is_paid: isPaid, ticket_price: ticketPrice, max_attendees: maxAttendees,
        current_attendees: currentAttendees, category, images
        }, { new: true });
    
        if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found.' });
        }

        res.status(200).json({ success: true, data:
            {
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
            }
        });
    } catch (error) {
        console.error('Error inupdating an events: ', error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ===================================================================================

const cancelEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findByIdAndUpdate(id, { isCancelled: true }, { new: true });

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }

        res.status(200).json({ success: true, data: {
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
        } });
    } catch (error) {
        console.error('Error in cancelling an events: ', error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// =====================================================================================

const createEvent = async (req, res) => {
    try {
        const {
            title, description, location, date, startTime, endTime, isPaid, ticketPrice,
            maxAttendees = null, category,food_stalls = false
        } = req.body;
    
        const images = req.files; // Assuming you're using multer for file uploads
    
        // Validate required fields
        if (!title || !description || !location || !date || !startTime || !endTime || typeof isPaid === 'undefined') {
            return res.status(400).json({ error: 'Please fill in all required fields.' });
        }
  
        // Validate ticket price for paid events
        if (isPaid) {
            if (typeof ticketPrice !== 'number' || isNaN(ticketPrice) || ticketPrice < 0) {
            return res.status(400).json({ error: 'Please provide a valid ticket price for paid events.' });
            }
        }
  
        // Validate if images exist (only if you want to enforce image uploads)
        if (!images || images.length === 0) {
            return res.status(400).json({ error: 'Please upload at least one image.' });
        }
    
        // Generate a new event_id
        const lastEvent = await Event.findOne().sort({ event_id: -1 }).exec();
        const newEventId = lastEvent ? lastEvent.event_id + 1 : 1000;
    
        // Upload images and get their URLs
        let imageUrls = [];
        if (images && images.length > 0) {
            const uploadPromises = images.map(async (image) => {
            const imagePath = path.join(__dirname, '..', 'uploads', image.filename); // Path where multer temporarily stores images
    
            try {
                const imageUrl = await uploadImage(imagePath); // Assuming uploadImage uploads to cloud and returns the URL
    
                // Clean up temporary file asynchronously
                fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error(`Error deleting file: ${imagePath}`, err);
                }
                });
    
                return imageUrl;
            } catch (error) {
                console.error('Error uploading image:', error);
                throw new Error('Image upload failed');
            }
            });
    
            imageUrls = await Promise.all(uploadPromises);
        }
        // Ensure category is an array of ObjectId
        const categoryIds = Array.isArray(category) ? category : JSON.parse(category);
    
        // Create and save the new event
        const newEvent = new Event({
            user_id: req.user._id,
            event_id: newEventId,
            title,
            description,
            location,
            date,
            start_time: startTime,
            end_time: endTime,
            is_paid: isPaid,
            ticket_price: isPaid ? ticketPrice : 0,
            max_attendees: maxAttendees,
            images:imageUrls,
            category:categoryIds,
            food_stalls
        });
    
        await newEvent.save(); // Save to the database
    
        res.status(201).json({ message: 'Event created successfully', event:  {
                id: newEvent._id.toString(),
                event_id: newEvent.event_id,
                eventAuthor: newEvent.user_id.fullname,
                title: newEvent.title,
                description: newEvent.description,
                location: newEvent.location,
                date: newEvent.date,
                startTime: newEvent.start_time,
                endTime: newEvent.end_time,
                isPaid: newEvent.is_paid,
                ticketPrice: newEvent.ticket_price,
                maxAttendees: newEvent.max_attendees,
                currentAttendees: newEvent.current_attendees,
                category: newEvent.category,
                images: newEvent.images || []
            } });

    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ error: 'Server error' });
    }
};

const search = async (req, res) => {
    const { query } = req.query; // Extract the search query from the query parameters

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        // Disable caching for this response
        res.set('Cache-Control', 'no-store');

        const events = await Event.find({
            $or: [
                { title: { $regex: query, $options: 'i' } }, // Case-insensitive search for title
                { description: { $regex: query, $options: 'i' } } // Case-insensitive search for description
            ]
        });

        res.status(200).json({ data: mapEvents(events) }); // Send back the found events
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const search2 = async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }
    console.log(query)

    try {
        // Perform the aggregation to look up category details
        const events = await Event.aggregate([
            {
                $lookup: {
                    from: Category.collection.name, // Reference to the categories collection
                    localField: 'category', // Field from the events collection
                    foreignField: '_id', // Field from the categories collection
                    as: 'categoryDetails' // Name of the new array field to add to the output documents
                }
            },
            {
                $match: {
                    $or: [
                        { title: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } },
                        { 'categoryDetails.name': { $regex: query, $options: 'i' } } // Match category names
                    ]
                }
            }
        ]);

        if (events.length === 0) {
            return res.status(404).json({ error: 'No events found' });
        }

        // Map events to the desired format
        let mappedEvents = events;

        // Extract user IDs from the events
        const userIds = mappedEvents.map(event => event.user_id);

        // Fetch user details based on the user IDs
        const users = await userModel.find({ _id: { $in: userIds } }, 'fullname email profile_picture');

        // Create a lookup object for users for quick access
        const userMap = users.reduce((acc, user) => {
            acc[user._id] = user; // Create a map with user IDs as keys
            return acc;
        }, {});

        // Attach user details to the mapped events
        const eventsWithUserDetails = mappedEvents.map(event => {
            const user_id = userMap[event.user_id]; // Get user details from the map
            return { ...event, user_id }; // Attach user details to each event
        });
        res.status(200).json({ data: mapEvents(eventsWithUserDetails) });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


module.exports = {
    updateEvent,
    createEvent,
    allEvents,
    allUpcomingEvents,
    allInProgressEvents,
    allPastEvents,
    EventDetails,
    sort,
    cancelEvent,
    search2,
    search
}
