import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminLogin } from "@/pages/admin/AdminLogin";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminUsers } from "@/pages/admin/AdminUsers";
import { AdminPortfolio } from "@/pages/admin/AdminPortfolio";
import { AdminNews } from "@/pages/admin/AdminNews";
import { AdminTeam } from "@/pages/admin/AdminTeam";
import { AdminVideoSlides } from "@/pages/admin/AdminVideoSlides";
import { AdminHome } from "@/pages/admin/AdminHome";
import Home from "./pages/Home";
import Strategy from "./pages/Strategy";
import Sectors from "./pages/Sectors";
import Portfolio from "./pages/Portfolio";
import PortfolioDetail from "./pages/PortfolioDetail";
import Team from "./pages/Team";
import Insights from "./pages/Insights";
import InsightDetail from "./pages/InsightDetail";
import News from "./pages/News";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/strategy" element={<Layout><Strategy /></Layout>} />
            <Route path="/sectors" element={<Layout><Sectors /></Layout>} />
            <Route path="/portfolio" element={<Layout><Portfolio /></Layout>} />
            <Route path="/portfolio/:id" element={<Layout><PortfolioDetail /></Layout>} />
            <Route path="/team" element={<Layout><Team /></Layout>} />
            <Route path="/insights" element={<Layout><Insights /></Layout>} />
            <Route path="/insights/:slug" element={<Layout><InsightDetail /></Layout>} />
            <Route path="/news" element={<Layout><News /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="home" element={<AdminHome />} />
              <Route path="portfolio" element={<AdminPortfolio />} />
              <Route path="video" element={<AdminVideoSlides />} />
              <Route path="news" element={<AdminNews />} />
              <Route path="team" element={<AdminTeam />} />
            <Route
              path="users" 
              element={
                <ProtectedRoute requiredRole="super_admin">
                  <AdminUsers />
                </ProtectedRoute>
              } 
            />
            </Route>

            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
