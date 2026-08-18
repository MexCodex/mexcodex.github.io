import type { Metadata } from "next";
import { TermsContent } from "@/app/components/TermsContent";

export const metadata: Metadata = {
  title: "Términos y condiciones — MexCodex",
  description: "Condiciones generales para el uso del sitio web de MexCodex.",
};

export default function TermsPage() {
  return <TermsContent />;
}
