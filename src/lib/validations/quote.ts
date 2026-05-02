import { z } from "zod";

export const quoteSchema = z.object({
  eventType: z.string().min(1, "Please select an event type"),
  eventDate: z.string().optional(),
  guestCount: z.string().optional(),
  venue: z.string().optional(),
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(10, "Please tell us a bit more"),
  referral: z.string().optional(),
});

export type QuoteFormData = z.infer<typeof quoteSchema>;
