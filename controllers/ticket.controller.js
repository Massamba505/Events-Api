const TicketRegistration = require('../models/ticket.model');
const QRCode = require('qrcode');
const CryptoJS = require('crypto-js');
const User = require("../models/user.model");


const parseTimeToDate = (date, time) => {
    // date format DD/MM/YYYY and time format HH:MM
    const [hours, minutes] = time.split(':').map(Number);
    const [DD, MM, YYYY] = date.split('/').map(Number);
    return new Date(YYYY, MM - 1, DD, hours, minutes);
};

const TicketReg = async(req, res) => {
    try {
        const user_id = req.user._id;
        const { event_id, registration_type, ticket_type } = req.body;

        // Fetch event and user details
        const event = await Event.findById(event_id);
        const user = await User.findById(user_id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let ticketNumber = null;
        if (registration_type === 'ticket') {
            ticketNumber = CryptoJS.lib.WordArray.random(4).toString(CryptoJS.enc.Hex).toUpperCase();
        }

        let qrCode = null;
        if (ticketNumber) {
            qrCode = await QRCode.toDataURL(ticketNumber);
        }

        const registration = new TicketRegistration({
            event_id,
            user_id,
            registration_type,
            ticket_number: ticketNumber,
            status: 'issued',
            price: event.is_paid ? event.ticket_price : null,
            ticket_type: ticket_type || null,
            qr_code: qrCode,
            event_date: parseTimeToDate(event.date,event.start_time),
            expiration_date: parseTimeToDate(event.date,event.end_time)
        });

        await registration.save();

        event.current_attendees += 1;
        await event.save();

        const registrationDetails = await TicketRegistration.findById(registration._id)
            .populate('event_id')
            .populate({
              path: 'user_id',
              select: 'fullname'
            });

        return res.status(201).json({
            message: 'Registration successful',
            registration: registrationDetails
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}

const AllTicketAndRegistration = async(req,res)=>{
    try {
        const user_id = req.user._id;

        const registrations = await TicketRegistration.find({ user_id })
        .populate('event_id')
        .populate('user_id', 'fullname');

        if (registrations.length === 0) {
            return res.status(200).json({ message: "No events registered." });
        }

        const eventsSummary = registrations.map(reg => ({
            fullname:reg.user_id.fullname,
            eventTitle: reg.event_id.title,
            eventDescription: reg.event_id.description,
            eventLocation: reg.event_id.location,
            eventStartTime: reg.event_id.start_time,
            eventEndTime: reg.event_id.end_time,
            registrationType: reg.registration_type,
            ticketNumber:reg.ticket_number,
            status: reg.status,
            ticketType: reg.ticket_type,
            eventDate: reg.event_date,
            price: reg.price ? reg.price.toString() : 'Free',
            qrCode: reg.qr_code,
            refundStatus: reg.refund_status,
            expirationDate: reg.expiration_date,
            registrationTime: reg.registration_time
        }));

        res.status(200).json(eventsSummary);
    } catch (error) {
        console.error('Error in fetching registered events: ', error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    TicketReg,
    AllTicketAndRegistration
};