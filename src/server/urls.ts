import "server-only";
import { site } from "@/config/site";

/** The HTTPS URL to write into a bracelet's NFC tag. Keep it stable forever. */
export const publicBase = () => (process.env.OZARA_PUBLIC_URL || site.url).replace(/\/$/, "");
export const tagUrl = (braceletId: string) => `${publicBase()}/b/${braceletId}`;
