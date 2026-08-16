import { Schema, model, models, type Model } from "mongoose";

/**
 * TypeScript interface describing the shape of an Event document.
 * Mirrors the schema definition below so the model is strongly typed.
 */
export interface IEvent {
  title: string;
  slug?: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: "online" | "offline" | "hybrid";
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Converts a title into a URL-friendly slug, e.g.
 * "React Conf 2026" -> "react-conf-2026".
 */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // drop anything that isn't a letter, digit, space or hyphen
    .replace(/[\s_-]+/g, "-") // collapse whitespace/underscores into a single hyphen
    .replace(/^-+|-+$/g, ""); // trim leading and trailing hyphens
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true },
    image: { type: String, required: true },
    venue: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    mode: {
      type: String,
      enum: ["online", "offline", "hybrid"],
      required: true,
    },
    audience: { type: String, required: true },
    agenda: { type: [String], required: true },
    organizer: { type: String, required: true },
    tags: { type: [String], required: true },
  },
  { timestamps: true } // automatically manage createdAt / updatedAt
);

/**
 * Auto-generate the slug from the title whenever the title changes
 * (including on document creation), or when the slug is missing.
 */
eventSchema.pre("save", function () {
  if (this.isModified("title") || !this.slug) {
    this.slug = slugify(this.title);
  }
});

/**
 * Reuse the already-compiled model if this module is reloaded during
 * development (HMR), instead of throwing "OverwriteModelError".
 */
const Event: Model<IEvent> = models.Event ?? model<IEvent>("Event", eventSchema);

export default Event;
