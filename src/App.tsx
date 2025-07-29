import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Event from "./pages/Event";
import Add from "./pages/Add";
import EditEvent from "./pages/EditEvent";
import Auth from "./pages/Auth";
import InternalExport from "./pages/InternalExport";
import InternalManage from "./pages/InternalManage";
import InternalAdd from "./pages/InternalAdd";
import InternalEditEvent from "./pages/InternalEditEvent";
import EmbedHighlightsToday from "./pages/EmbedHighlightsToday";
import NotFound from "./pages/NotFound";
import InternalNewsletter from "./pages/InternalNewsletter";
import InternalDocumentation from "./pages/InternalDocumentation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<Search />} />
            <Route path="/event/:id" element={<Event />} />
            <Route path="/add" element={<Add />} />
            <Route path="/edit-event/:id" element={<EditEvent />} />
            <Route path="/login" element={<Auth />} />
            {/* Protected internal routes */}
            <Route path="/internal/export" element={
              <ProtectedRoute>
                <InternalExport />
              </ProtectedRoute>
            } />
            <Route path="/internal/manage" element={
              <ProtectedRoute>
                <InternalManage />
              </ProtectedRoute>
            } />
            <Route path="/internal/manage/edit/:id" element={
              <ProtectedRoute>
                <InternalEditEvent />
              </ProtectedRoute>
            } />
            <Route path="/internal/add" element={
              <ProtectedRoute>
                <InternalAdd />
              </ProtectedRoute>
            } />
            <Route path="/internal/newsletter" element={
              <ProtectedRoute>
                <InternalNewsletter />
              </ProtectedRoute>
            } />
            <Route path="/internal/documentation" element={
              <ProtectedRoute>
                <InternalDocumentation />
              </ProtectedRoute>
            } />
            {/* Embed routes */}
            <Route path="/embed/highlights-today" element={<EmbedHighlightsToday />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
