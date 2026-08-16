/**
 * Single entry point for the database layer, so the rest of the app can
 * import the models and their TypeScript interfaces from one place:
 *
 *   import { Event, Booking } from "@/database";
 *   import type { IEvent, IBooking } from "@/database";
 */
export { default as Event, type IEvent } from "./event.model";
export { default as Booking, type IBooking } from "./booking.model";
