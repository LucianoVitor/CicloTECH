import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import ComoDoar from "./pages/ComoDoar";
import SolicitarHardware from "./pages/SolicitarHardware";
import ImpactoODS from "./pages/ImpactoODS";
import SobreNos from "./pages/SobreNos";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import DoarEquipamento from "./pages/DoarEquipamento";
import Perfil from "./pages/Perfil";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/como-doar" element={<ComoDoar />} />
              <Route path="/solicitar" element={<SolicitarHardware />} />
              <Route path="/impacto" element={<ImpactoODS />} />
              <Route path="/sobre" element={<SobreNos />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/doar" element={<DoarEquipamento />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
