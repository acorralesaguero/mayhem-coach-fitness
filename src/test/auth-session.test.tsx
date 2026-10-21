import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth } }));
vi.mock("@/lib/i18n", () => ({ useTranslation: () => ({ t: (value: unknown) => value }) }));
vi.mock("@/components/LanguageSelector", () => ({ LanguageSelector: () => null }));
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...await importOriginal<typeof import("@tanstack/react-router")>(),
  Link: ({ to, children, ...props }: { to: string; children: ReactNode; search?: unknown }) => {
    const { search: _search, ...rest } = props;
    return <a href={to} {...rest}>{children}</a>;
  },
}));
import { useAuth } from "@/lib/use-auth";
import { Route } from "@/routes/index";

const savedSession = { user: { id: "returning-athlete" } } as Session;
let listener: (event: string, session: Session | null) => void;
beforeEach(() => {
  vi.clearAllMocks();
  auth.getSession.mockResolvedValue({ data: { session: savedSession } });
  auth.onAuthStateChange.mockImplementation((callback) => {
    listener = callback;
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });
});

describe("Returning athlete sign-in", () => {
  it("restores the persisted session on mount without requiring a new sign-in", async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user?.id).toBe("returning-athlete");
  });

  it("links a returning athlete directly to Today and changes back after sign-out", async () => {
    const Home = Route.options.component;
    if (!Home) throw new Error("Missing start page");
    render(<Home />);
    await waitFor(() => expect(screen.getAllByRole("link", { name: "Today" })).toHaveLength(2));
    for (const link of screen.getAllByRole("link", { name: "Today" })) {
      expect(link).toHaveAttribute("href", "/today");
    }
    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
    act(() => listener("SIGNED_OUT", null));
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/auth");
  });
});