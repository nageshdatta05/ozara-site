/* ==========================================================================
   PAGE COMPOSITION — reorder, remove or add homepage sections here.

   The home page tells one story, in order:
   DESIRE (the hero) → UNDERSTANDING (your OZARA ID, the card, straight
   after the hero) → CURIOSITY (the OZARA Eye) → WHAT IS IT (Wear · Tap · Unlock) →
   VALUE (your access: OZARA Exclusive / Approved) → BELONGING (status,
   reusable, the few) → DESIRE TO OWN (the two pieces, set with stones,
   pre-order).
   ========================================================================== */

import type { ComponentType } from "react";
import { Opening } from "@/components/home/Opening";
import { Statement } from "@/components/home/Statement";
import { PreorderBand } from "@/components/home/PreorderBand";
import { Signature } from "@/components/home/Signature";
import { Expressions } from "@/components/home/Expressions";
import { TheEye } from "@/components/home/TheEye";
import { Identity } from "@/components/home/Identity";
import { Worn } from "@/components/home/Worn";
import { Closing } from "@/components/home/Closing";
import { Access } from "@/components/home/Access";
import { Proof } from "@/components/sections/Proof";

export const homeSections: { id: string; component: ComponentType; enabled: boolean }[] = [
  { id: "opening", component: Opening, enabled: true },
  { id: "identity", component: Identity, enabled: true },
  { id: "eye", component: TheEye, enabled: true },
  { id: "statement", component: Statement, enabled: true },
  { id: "preorder", component: PreorderBand, enabled: true },
  { id: "access", component: Access, enabled: false }, // events: on hold while the offer is reshaped
  { id: "signature", component: Signature, enabled: true },
  { id: "expressions", component: Expressions, enabled: true },
  { id: "worn", component: Worn, enabled: true },
  { id: "proof", component: Proof, enabled: true },
  { id: "closing", component: Closing, enabled: true },
];
