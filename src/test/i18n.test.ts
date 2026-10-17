import {describe,it,expect} from "vitest";
import {translate} from "@/lib/i18n";
import {buildSession} from "@/lib/program";
describe("language-independent training",()=>{
 it("preserves canonical program values when displaying Spanish",()=>{
 const plan=buildSession({date:new Date(2026,9,17),duration:60,groups:["Legs"],benchmarks:{back_squat:200,units:"kg"},readiness:{energy:5,sleep_hours:8,sleep_quality:5,stress:1,soreness:1,motivation:5},tier:"rx",equipment:["Full gym"],experience:"Intermediate"});
 const before=JSON.stringify(plan);for(const block of plan.blocks)for(const exercise of block.exercises)translate(exercise.prescription,"es");expect(JSON.stringify(plan)).toBe(before);expect(plan.blocks.reduce((sum,b)=>sum+b.minutes,0)).toBe(60);
 });
 it("keeps units, numeric loads and 30/60/90 minute choices unchanged",()=>{expect(translate("5 x 5 @ 200 kg","es")).toBe("5 x 5 @ 200 kg");expect([30,60,90].map(n=>translate(n,"es"))).toEqual([30,60,90]);});
});
