import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { PasswordExpiryProvider } from "@/hooks/usePasswordExpiry";
import { ThemeProvider } from "@/hooks/useTheme";
import { AppStoreProvider } from "@/store/AppStore";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import ComoDoar from "./pages/ComoDoar";
import SolicitarHardware from "./pages/SolicitarHardware";
import ImpactoODS from "./pages/ImpactoODS";
import SobreNos from "./pages/SobreNos";
import Auth from "./pages/Auth";
import EsqueciSenha from "./pages/EsqueciSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import RedirecionarComHash from "./components/RedirecionarComHash";
import GuardaSenhaVencida from "./components/GuardaSenhaVencida";
import TrocarSenha from "./pages/TrocarSenha";
import DoarEquipamento from "./pages/DoarEquipamento";
import Perfil from "./pages/Perfil";
import Admin from "./pages/Admin";
import Trocas from "./pages/Trocas";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <PasswordExpiryProvider>
              <AppStoreProvider>
                <Layout>
                  <GuardaSenhaVencida>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/como-doar" element={<ComoDoar />} />
                      <Route
                        path="/solicitar"
                        element={<SolicitarHardware />}
                      />
                      <Route path="/doacoes" element={<SolicitarHardware />} />
                      <Route path="/impacto" element={<ImpactoODS />} />
                      <Route path="/sobre" element={<SobreNos />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/esqueci-senha" element={<EsqueciSenha />} />
                      <Route
                        path="/redefinir-senha"
                        element={<RedefinirSenha />}
                      />
                      <Route path="/trocar-senha" element={<TrocarSenha />} />
                      {/* Links de e-mail antigos apontavam para /reset-password. */}
                      <Route
                        path="/reset-password"
                        element={
                          <RedirecionarComHash para="/redefinir-senha" />
                        }
                      />
                      <Route path="/doar" element={<DoarEquipamento />} />
                      <Route path="/perfil" element={<Perfil />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/trocas" element={<Trocas />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </GuardaSenhaVencida>
                </Layout>
              </AppStoreProvider>
            </PasswordExpiryProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
