const Event = require("../models/event.model")
const UserPreference = require("../models/userpreference.model");


const parseTimeToDate = (date, time) => {
    // date format DD/MM/YYYY and time format HH:MM
    const [hours, minutes] = time.split(':').map(Number);
    const [DD, MM, YYYY] = date.split('/').map(Number);
    return new Date(YYYY, MM - 1, DD, hours, minutes);
};

// getEvents

const allEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 })
        .populate({
          path: 'user_id',
          select: 'fullname'
        });

        const allevents = events.map((event,id) => {
            return {
                id:event.id,
                eventAuthor:event.user_id.fullname,
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
                images: event.images,
            }
        });

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
        .populate({
          path: 'user_id',
          select: 'fullname'
        });
        
        if (user_id) {
            const userPreference = await UserPreference.findOne({ user_id });

            if (userPreference) {
                events = events.sort((a, b) => {
                    const aInPreferredCategory = userPreference.preferred_category.includes(a.category);
                    const bInPreferredCategory = userPreference.preferred_category.includes(b.category);

                    if (aInPreferredCategory && !bInPreferredCategory) return -1;
                    if (!aInPreferredCategory && bInPreferredCategory) return 1;
                    return 0;
                });
            }
        }

        const now = new Date();
        events = events.filter(event => {
            const eventStartTime = parseTimeToDate(event.date,event.start_time);
            return eventStartTime >= now;
        });

        const allevents = events.map((event,id) => {
            return {
                id:event.id,
                eventAuthor:event.user_id.fullname,
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
                images: event.images,
                // createdAt: event.createdAt,
                // updatedAt: event.updatedAt
            }
        });

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

const allInProgressEvents = async (req, res) => {
    try {
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
                    const aInPreferredCategory = userPreference.preferred_category.includes(a.category);
                    const bInPreferredCategory = userPreference.preferred_category.includes(b.category);

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

        const allevents = events.map((event,id) => {
            return {
                id:event.id,
                eventAuthor:event.user_id.fullname,
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
                images: event.images,
            }
        });

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

        let events = await Event.find({})
        .populate({
          path: 'user_id',
          select: 'fullname'
        });

        if (user_id) {
            const userPreference = await UserPreference.findOne({ user_id });

            if (userPreference) {
                events = events.sort((a, b) => {
                    const aInPreferredCategory = userPreference.preferred_category.includes(a.category);
                    const bInPreferredCategory = userPreference.preferred_category.includes(b.category);

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

        const allevents = events.map((event,id) => {
            return {
                id:event.id,
                eventAuthor:event.user_id.fullname,
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
                images: event.images,
                // createdAt: event.createdAt,
                // updatedAt: event.updatedAt
            }
        });

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

        let events = await Event.find({})
        .populate({
          path: 'user_id',
          select: 'fullname'
        });

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

        const allevents = events.map((event, id) => {
            return {
                id: event.id,
                eventAuthor:event.user_id.fullname,
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
                images: event.images
            };
        });

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
            return res.status(400).json({ error: 'Event ID is required' });
        }

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                id: event.id,
                eventAuthor:event.user_id.fullname,
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
                images: event.images
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
        const { eventAuthor, title, description, location, date, startTime, endTime, isPaid, ticketPrice, maxAttendees, currentAttendees, category, images } = req.body;

        if (!eventAuthor || !title || !description || !location || !date || !startTime || !endTime || typeof isPaid !== 'boolean' || typeof ticketPrice !== 'number' || typeof maxAttendees !== 'number' || typeof currentAttendees !== 'number' || !category || !Array.isArray(category) || !images || !Array.isArray(images)) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields with correct types.' });
        }

        const event = await Event.findByIdAndUpdate(id, { title, description, location, date, startTime, endTime, isPaid, ticketPrice, maxAttendees, currentAttendees, category, images}, { new: true });

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }

        res.status(200).json({ success: true, data:
            {
                id: event.id,
                eventAuthor:event.user_id.fullname,
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
                images: event.images
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

        res.status(200).json({ success: true, data: event });
    } catch (error) {
        console.error('Error in cancelling an events: ', error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// =====================================================================================


const createEvent = async (req, res) => {
    try {
      const {
        title,
        description,
        location,
        start_time,
        end_time,
        date, // DD/MM/YYYY
        is_paid,
        ticket_price,
        max_attendees,
        images,
        category,
      } = req.body;

      if (!title || !description || !location || !date  || !start_time || !end_time || is_paid === undefined) {
        return res.status(400).json({ message: 'Please fill in all required fields' });
      }
  
      const newEvent = new Event({
        user_id: req.user._id,
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
  
      // Save the event to the database
      await newEvent.save();
  
      res.status(201).json({ message: 'Event created successfully', event: newEvent });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ message: 'Server error' });
    }
};

// const updateEvent = async(req,res)=>{
//     try {
//         const { eventId } = req.params;
//         const eventUpdates = req.body;

//         // Find and update the event
//         const updatedEvent = await Event.findByIdAndUpdate(eventId, eventUpdates, { new: true });

//         if (!updatedEvent) {
//             return res.status(404).json({ error: 'Event not found' });
//         }

//         // Find all registrations for the event
//         const registrations = await TicketRegistration.find({ event_id: eventId }).populate('user_id');

//         const notifications = registrations.map(registration => ({
//             user_id: registration.user_id._id,
//             event_id: eventId,
//             message: `The event "${updatedEvent.title}" has been updated.`,
//             sent_at: new Date(),
//             is_read:false
//         }));

//         // Save all notifications
//         await Notification.insertMany(notifications);
        
//         // Send email notifications to users
//         const emailPromises = registrations.map(registration => {
//             const mailOptions = {
//                 to: registration.user_id.email,
//                 from: process.env.EMAIL_USER,
//                 subject: 'Event Update Notification',
//                 text: `Hello ${registration.user_id.fullname},\n\n` +
//                       `The event "${updatedEvent.title}" you are registered for has been updated.\n\n` +
//                       `Please visit the event page for the latest details.\n\n` +
//                       `Thank you,\nEvent Management Team`
//             };

//             return transporter.sendMail(mailOptions);
//         });

//         await Promise.all(emailPromises);

//         res.status(200).json({
//             message: 'Event updated and notifications sent successfully',
//             event: updatedEvent
//         });
//     } catch (error) {
//         console.error('Error updating event:', error.message);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// }


module.exports = {
    updateEvent,
    // AllTicketAndRegistration,
    createEvent,
    // TicketReg,

    allEvents,
    allUpcomingEvents,
    allInProgressEvents,
    allPastEvents,

    EventDetails,
    sort,
    cancelEvent
}