import { describe,it,expect } from "vitest";
import { buildSession } from "@/lib/program";
import { METCONS,equipmentFor } from "@/lib/library";
import { epley,streak,sleepPattern,suggestedWeek,parseNumeric } from "@/lib/progress";
import { safeRedirect } from "@/lib/brand";
const readiness={energy:5,sleep_hours:8,sleep_quality:5,stress:1,soreness:1,motivation:5};
describe("Forge rules",()=>{
 it("bodyweight only needs no equipment in any focus or duration",()=>{for(const groups of [["Legs"],["Shoulders"],["Engine / cardio"],["Olympic lifts"],["Full body"],["Mobility"]])for(const duration of [30,60,90] as const){const p=buildSession({date:new Date(2026,9,17),duration,groups,readiness,benchmarks:{},tier:"scaled",equipment:["Bodyweight only"],experience:"Intermediate"});for(const b of p.blocks)for(const e of b.exercises)expect(equipmentFor(e.name)).toBe("Bodyweight only");}});
 it("beginners never get advanced movements",()=>{for(const groups of [["Olympic lifts"],["Shoulders"],["Full body"],["Engine / cardio"]])for(let i=0;i<16;i++){const p=buildSession({date:new Date(2026,0,5+i*7),duration:60,groups,readiness,benchmarks:{},tier:"scaled",equipment:["Full gym"],experience:"Beginner"});for(const b of p.blocks)for(const e of b.exercises)expect(e.name).not.toMatch(/snatch|clean.?&.?jerk|power cleans|toes.to.bar|double.under/i);}});
 it("uses all six metcons before repeating across 8 weeks",()=>{let recent:string[]=[];for(let i=0;i<32;i++){const p=buildSession({date:new Date(2026,0,5+Math.floor(i/4)*7),duration:60,groups:["Legs"],readiness,benchmarks:{},tier:"rx",recentTitles:recent});const met=METCONS.lower.find(m=>p.title.includes(m.name));expect(met).toBeDefined();const last=recent.slice(0,5);expect(last.some(t=>t.includes(met?.name??"missing"))).toBe(false);recent=[p.title,...recent].slice(0,20);}});
 it("uses Epley for 1-10 reps only",()=>{expect(epley(100,6)).toBe(120);expect(epley(100,11)).toBeNull();expect(epley(100,0)).toBeNull();});
 it("parses decimal commas and ignores invalid input",()=>{expect(parseNumeric("82,5")).toBe(82.5);expect(parseNumeric("abc")).toBeUndefined();});
 it("requires 14 checks and at least five per bucket",()=>{expect(sleepPattern(Array.from({length:13},(_,i)=>({energy:3,sleep_hours:i%2?8:6})))).toBeNull();expect(sleepPattern(Array.from({length:14},(_,i)=>({energy:3,sleep_hours:i<4?6:8})))).toBeNull();expect(sleepPattern(Array.from({length:14},(_,i)=>({energy:3,sleep_hours:i<7?6:8})))).toContain("n=7 vs n=7");});
 it("counts Mon-Sun successful weeks",()=>{const plan={title:"x",coach_note:"",intensity:"moderate" as const,blocks:[],cooldown:""};const works=["2026-10-12","2026-10-13","2026-10-05","2026-10-06"].map(workout_date=>({workout_date,title:"x",duration:60,completed:true,plan}));expect(streak(works,2,new Date(2026,9,17))).toBe(2);expect(streak(works,3,new Date(2026,9,17))).toBe(0);});
 it.each([2,3,4,5,6])("creates %i suggested training days",n=>expect(suggestedWeek(n,"General health","Beginner",60).filter(d=>d.is_training)).toHaveLength(n));
 it("keeps redirect on this site",()=>{expect(safeRedirect("//evil.test")).toBe("/today");expect(safeRedirect("/week")).toBe("/week");});
});
