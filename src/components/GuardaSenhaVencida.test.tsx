import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const estado = vi.hoisted(() => ({ user: null as null | { id: string }, vencida: false }));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: estado.user }) }));
vi.mock("@/hooks/usePasswordExpiry", () => ({ usePasswordExpiry: () => ({ vencida: estado.vencida }) }));

import GuardaSenhaVencida from "./GuardaSenhaVencida";

function renderEm(rota: string) {
  render(
    <MemoryRouter initialEntries={[rota]}>
      <GuardaSenhaVencida>
        <Routes>
          <Route path="/perfil" element={<p>perfil</p>} />
          <Route path="/trocar-senha" element={<p>trocar senha</p>} />
        </Routes>
      </GuardaSenhaVencida>
    </MemoryRouter>,
  );
}

describe("GuardaSenhaVencida", () => {
  it("senha vencida: manda para /trocar-senha", () => {
    Object.assign(estado, { user: { id: "u1" }, vencida: true });
    renderEm("/perfil");
    expect(screen.getByText("trocar senha")).toBeInTheDocument();
  });

  it("senha válida: deixa acessar a página", () => {
    Object.assign(estado, { user: { id: "u1" }, vencida: false });
    renderEm("/perfil");
    expect(screen.getByText("perfil")).toBeInTheDocument();
  });

  it("visitante sem login não é redirecionado", () => {
    Object.assign(estado, { user: null, vencida: true });
    renderEm("/perfil");
    expect(screen.getByText("perfil")).toBeInTheDocument();
  });
});
