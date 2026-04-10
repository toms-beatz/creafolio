/**
 * Types pour les témoignages landing page.
 */
export interface Testimonial {
  id: string;
  user_id: string;
  content: string;
  rating: number;
  status: "pending" | "approved" | "rejected";
  display_name: string | null;
  display_role: string;
  admin_note: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestimonialWithProfile extends Testimonial {
  username: string;
  avatar_url: string | null;
}
