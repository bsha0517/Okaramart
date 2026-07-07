/**
 * Image upload abstraction for product photos.
 *
 * No storage provider is wired up yet. Until you configure one, the admin
 * product form falls back to pasting an image URL directly (e.g. an image
 * already hosted somewhere, or a temporary hotlink).
 *
 * To enable real uploads, pick one and implement uploadImage() below:
 *   - Cloudinary (easiest — generous free tier, simple API)
 *   - AWS S3 + CloudFront
 *   - Supabase Storage (since you already have a Supabase project — this is
 *     probably the least additional setup)
 *
 * Example for Supabase Storage (once you create a public bucket named "products"):
 *
 *   import { createClient } from "@supabase/supabase-js";
 *   const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
 *
 *   export async function uploadImage(file: Buffer, filename: string): Promise<string> {
 *     const { data, error } = await supabase.storage.from("products").upload(filename, file, { upsert: true });
 *     if (error) throw error;
 *     const { data: pub } = supabase.storage.from("products").getPublicUrl(filename);
 *     return pub.publicUrl;
 *   }
 */

export async function uploadImage(_file: Buffer, _filename: string): Promise<string> {
  throw new Error(
    "Image upload storage isn't configured yet — paste an image URL directly in the product form for now, or wire up a provider in lib/uploads.ts."
  );
}
