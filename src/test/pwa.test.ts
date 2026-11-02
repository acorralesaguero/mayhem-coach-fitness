import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync("public/manifest.webmanifest", "utf8"));

describe("Home-screen install support", () => {
  it("installs as its own app with a short name", () => {
    expect(manifest.display).toBe("standalone");
    expect(manifest.name).toBe("Forge");
    expect(manifest.short_name.length).toBeLessThanOrEqual(12);
  });
  it("keeps every screen inside the installed app", () => {
    expect(manifest.scope).toBe("/");
    expect(manifest.start_url.startsWith(manifest.scope)).toBe(true);
  });
  it("ships icons iPhone and Android both accept", () => {
    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toContain("180x180");
    expect(sizes).toContain("512x512");
    expect(manifest.icons.some((i: { purpose: string }) => i.purpose === "maskable")).toBe(true);
  });
});
