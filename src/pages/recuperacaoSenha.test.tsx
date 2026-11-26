import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const auth = vi.hoisted(() => ({
  resetPasswordForEmail: vi.fn(),
  getSession: vi.fn(),
  updateUser: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth, rpc: vi.fn().mockResolvedValue({ error: null }) } }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import EsqueciSenha, { MENSAGEM_ENVIO } from "./EsqueciSenha";
import RedefinirSenha from "./RedefinirSenha";

function renderEm(rota: string) {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <Routes>
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        <Route path="/auth" element={<p>tela de login</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => vi.clearAllMocks());

describe("/esqueci-senha", () => {
  it("envia o link com redirectTo para /redefinir-senha", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
    renderEm("/esqueci-senha");
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "aluno@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar link/i }));
    expect(await screen.findByRole("status")).toHaveTextContent(MENSAGEM_ENVIO);
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith("aluno@example.com", {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
  });

  it("mostra a MESMA mensagem quando o e-mail não existe ou dá erro", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ data: null, error: { message: "User not found" } });
    renderEm("/esqueci-senha");
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "naoexiste@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar link/i }));
    expect(await screen.findByRole("status")).toHaveTextContent(MENSAGEM_ENVIO);
  });

  it("valida o formato do e-mail antes de chamar o Supabase", async () => {
    renderEm("/esqueci-senha");
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "invalido" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar link/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Email inválido");
    expect(auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });
});

describe("/redefinir-senha", () => {
  beforeEach(() => auth.getSession.mockResolvedValue({ data: { session: { user: { id: "u1" } } } }));

  it("recusa senha fraca", async () => {
    renderEm("/redefinir-senha");
    fireEvent.change(await screen.findByLabelText("Nova senha"), { target: { value: "fraca123" } });
    fireEvent.change(screen.getByLabelText("Confirmar senha"), { target: { value: "fraca123" } });
    fireEvent.click(screen.getByRole("button", { name: /atualizar senha/i }));
    expect(await screen.findByText("A senha deve ter pelo menos uma letra maiúscula")).toBeInTheDocument();
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  it("atualiza a senha forte, encerra a sessão e volta ao login", async () => {
    auth.updateUser.mockResolvedValue({ data: {}, error: null });
    auth.signOut.mockResolvedValue({ error: null });
    renderEm("/redefinir-senha");
    fireEvent.change(await screen.findByLabelText("Nova senha"), { target: { value: "Ciclo@2026" } });
    fireEvent.change(screen.getByLabelText("Confirmar senha"), { target: { value: "Ciclo@2026" } });
    fireEvent.click(screen.getByRole("button", { name: /atualizar senha/i }));
    await waitFor(() => expect(screen.getByText("tela de login")).toBeInTheDocument());
    expect(auth.updateUser).toHaveBeenCalledWith({ password: "Ciclo@2026" });
    expect(auth.signOut).toHaveBeenCalled();
  });
});
