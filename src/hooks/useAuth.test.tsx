import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const sb = vi.hoisted(() => ({
  rpc: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  signOut: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: sb.rpc, auth: { getSession: sb.getSession, onAuthStateChange: sb.onAuthStateChange, signOut: sb.signOut } },
}));

import { AuthProvider, useAuth } from "./useAuth";
import * as modulo from "./useAuth";

function Sonda() {
  const { loading, isAdmin } = useAuth();
  return <p>{loading ? "carregando" : isAdmin ? "admin" : "comum"}</p>;
}
const sessao = (email: string) => ({ data: { session: { user: { id: "u1", email } } } });

beforeEach(() => vi.clearAllMocks());

describe("useAuth: papel de administrador", () => {
  it("não existe mais lista de e-mails nem senha de admin no código", () => {
    expect(Object.keys(modulo)).not.toContain("DEV_ADMIN_EMAILS");
    expect(Object.keys(modulo)).not.toContain("DEV_ADMIN_PASSWORD");
  });

  it("e-mail 'de admin' SEM papel no banco é usuário comum", async () => {
    sb.getSession.mockResolvedValue(sessao("admin@ciclotech.com"));
    sb.rpc.mockResolvedValue({ data: false, error: null });
    render(<AuthProvider><Sonda /></AuthProvider>);
    await waitFor(() => expect(screen.getByText("comum")).toBeInTheDocument());
    expect(sb.rpc).toHaveBeenCalledWith("has_role", { _user_id: "u1", _role: "admin" });
  });

  it("usuário com papel admin em user_roles (has_role = true) é admin", async () => {
    sb.getSession.mockResolvedValue(sessao("qualquer@example.com"));
    sb.rpc.mockResolvedValue({ data: true, error: null });
    render(<AuthProvider><Sonda /></AuthProvider>);
    await waitFor(() => expect(screen.getByText("admin")).toBeInTheDocument());
  });

  it("erro na verificação nunca concede admin", async () => {
    sb.getSession.mockResolvedValue(sessao("qualquer@example.com"));
    sb.rpc.mockResolvedValue({ data: null, error: { message: "permission denied" } });
    render(<AuthProvider><Sonda /></AuthProvider>);
    await waitFor(() => expect(screen.getByText("comum")).toBeInTheDocument());
  });
});
