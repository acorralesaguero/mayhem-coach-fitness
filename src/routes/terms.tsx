// Draft, pending legal review.
import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";
import { pageHead } from "@/lib/brand";
export const Route=createFileRoute("/terms")({head:()=>pageHead("Terms of Service","Exercise safety, eligibility and service terms for Forge.","/terms"),component:()=> <PolicyPage kind="terms"/>});
