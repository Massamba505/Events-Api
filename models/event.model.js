const mongoose = require("mongoose");
const { Schema } = mongoose;

const eventSchema = new Schema(
  {
    status: {
      type: Number,
      default: 1,
    },

    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    event_id: {
      type: Number,
      unique: true,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    start_time: {
      type: String,
      required: true,
    },

    end_time: {
      type: String,
      required: true,
    },

    is_paid: {
      type: Boolean,
      required: true,
    },

    food_stalls: {
      type: Boolean,
      default: false,
    },

    ticket_price: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    max_attendees: {
      type: Number,
    },

    current_attendees: {
      type: Number,
      default: 0,
    },

    current_attendee_list: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },

    images: [
      {
        type: String,
      },
    ],

    isCancelled: {
      type: Boolean,
      default: false,
    },

    category: [
      {
        type: Schema.Types.ObjectId,
        ref: "EventCategory",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
