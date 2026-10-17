// Draft, pending legal review.
import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";
import { pageHead } from "@/lib/brand";
export const Route=createFileRoute("/privacy")({head:()=>pageHead("Privacy Policy","How Forge handles your account and training data.","/privacy"),component:()=> <PolicyPage kind="privacy"/>});
