import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ResumePage from "./pages/ResumePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          } />
          <Route path="/resume" element={
            <AppLayout>
              <ResumePage />
            </AppLayout>
          } />
          <Route path="/jobs" element={
            <AppLayout>
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">Job Discovery</h1>
                <p className="text-muted-foreground">Job discovery features coming soon...</p>
              </div>
            </AppLayout>
          } />
          <Route path="/applications" element={
            <AppLayout>
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">Applications</h1>
                <p className="text-muted-foreground">Application tracking features coming soon...</p>
              </div>
            </AppLayout>
          } />
          <Route path="/analytics" element={
            <AppLayout>
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">Analytics</h1>
                <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
              </div>
            </AppLayout>
          } />
          <Route path="/profile" element={
            <AppLayout>
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">Profile</h1>
                <p className="text-muted-foreground">Profile management coming soon...</p>
              </div>
            </AppLayout>
          } />
          <Route path="/settings" element={
            <AppLayout>
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">Settings</h1>
                <p className="text-muted-foreground">Settings page coming soon...</p>
              </div>
            </AppLayout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
