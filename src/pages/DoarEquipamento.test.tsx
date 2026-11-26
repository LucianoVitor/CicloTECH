import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/store/AppStore", () => ({ useAppStore: () => ({ addDonation: vi.fn() }), fileToDataURL: vi.fn() }));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: null }) }));
const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

import DoarEquipamento from "./DoarEquipamento";

let contador = 0;
const criar = vi.fn(() => `blob:http://localhost/foto-${++contador}`);
const revogar = vi.fn();

beforeEach(() => {
  contador = 0;
  criar.mockClear();
  revogar.mockClear();
  toast.error.mockClear();
  Object.assign(URL, { createObjectURL: criar, revokeObjectURL: revogar });
});

function escolher(container: HTMLElement, arquivos: File[]) {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: arquivos } });
}

describe("DoarEquipamento - pré-visualização das fotos", () => {
  it("mostra a miniatura com URL blob: criada uma única vez por arquivo", () => {
    const { container, rerender } = render(<MemoryRouter><DoarEquipamento /></MemoryRouter>);
    escolher(container, [new File(["a"], "placa.png", { type: "image/png" })]);
    const img = screen.getByAltText("placa.png") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("blob:http://localhost/foto-1");
    rerender(<MemoryRouter><DoarEquipamento /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText("Ex: Intel Core i5-12400"), { target: { value: "GPU" } });
    expect(criar).toHaveBeenCalledTimes(1);
  });

  it("recusa tipo não permitido com mensagem e sem criar URL", () => {
    const { container } = render(<MemoryRouter><DoarEquipamento /></MemoryRouter>);
    escolher(container, [new File(["<svg/>"], "x.svg", { type: "image/svg+xml" })]);
    expect(criar).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("não é uma imagem permitida"));
  });

  it("revoga a URL ao remover a foto e as restantes ao desmontar", () => {
    const { container, unmount } = render(<MemoryRouter><DoarEquipamento /></MemoryRouter>);
    escolher(container, [
      new File(["a"], "a.png", { type: "image/png" }),
      new File(["b"], "b.jpg", { type: "image/jpeg" }),
    ]);
    fireEvent.click(screen.getAllByLabelText("Remover")[0]);
    expect(revogar).toHaveBeenCalledWith("blob:http://localhost/foto-1");
    expect(screen.queryByAltText("a.png")).toBeNull();
    unmount();
    expect(revogar).toHaveBeenCalledWith("blob:http://localhost/foto-2");
  });
});
