import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import ComoDoar from "./pages/ComoDoar";
import SolicitarHardware from "./pages/SolicitarHardware";
import ImpactoODS from "./pages/ImpactoODS";
import SobreNos from "./pages/SobreNos";
import Auth from "./pages/Auth";
import DoarEquipamento from "./pages/DoarEquipamento";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/como-doar" element={<ComoDoar />} />
            <Route path="/solicitar" element={<SolicitarHardware />} />
            <Route path="/impacto" element={<ImpactoODS />} />
            <Route path="/sobre" element={<SobreNos />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/doar" element={<DoarEquipamento />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
