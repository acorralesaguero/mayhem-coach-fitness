export const BRAND = { name: "Forge", tagline: "Adaptive functional-fitness coaching", contactEmail: "" };
export const TERMS_VERSION = "2026-10-17";
export const SITE_URL = "https://mayhem-coach-fitness.lovable.app";
export function pageHead(title:string,description:string,path?:string){ const full=`${title} — ${BRAND.name}`; return {meta:[{title:full},{name:"description",content:description},{property:"og:title",content:full},{property:"og:description",content:description},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"},...(path?[{property:"og:url",content:SITE_URL+path}]:[])],...(path?{links:[{rel:"canonical",href:SITE_URL+path}]}:{})}; }
export function safeRedirect(path?:string){return path?.startsWith("/")&&!path.startsWith("//")&&!/[\\\r\n]/.test(path)?path:"/today";}
