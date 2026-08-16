import { Schema, model, models, Types, type Model } from "mongoose";
import Event from "./event.model";

/**
 * TypeScript interface describing the shape of a Booking document.
 * Mirrors the schema definition below so the model is strongly typed.
 */
export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Practical email pattern; also used as the schema validation regex. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, "Please provide a valid email address"],
    },
  },
  { timestamps: true } // automatically manage createdAt / updatedAt
);

/**
 * Prevent duplicate bookings: a user (email) can book a given event only
 * once. The compound index also speeds up queries filtered by event or email.
 */
bookingSchema.index({ eventId: 1, email: 1 }, { unique: true });

/**
 * Guard against orphan bookings by refusing to save a booking whose
 * referenced event no longer exists.
 */
bookingSchema.pre("save", async function () {
  const eventExists = await Event.exists({ _id: this.eventId });
  if (!eventExists) {
    throw new Error(`Event with id "${this.eventId}" does not exist`);
  }
});

/**
 * Reuse the already-compiled model if this module is reloaded during
 * development (HMR), instead of throwing "OverwriteModelError".
 */
const Booking: Model<IBooking> =
  models.Booking ?? model<IBooking>("Booking", bookingSchema);

export default Booking;
