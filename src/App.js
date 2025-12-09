import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import HomePage from "./Components/HomePage";
import FormPage from "./Components/FormPage";
import AnalyticsPage from "./Components/AnalyticsPage";
import AdminDashboard from "./Components/AdminDashboard";
import FormBuilderPage from "./Components/FormBuilderPage";
import AdminOnlyMessage from "./Components/AdminOnlyMessage";
import LoginPage from "./Components/LoginPage";
import SignupPage from "./Components/SignupPage";
import UploadPanel from "./Components/UploadPanel";
import ThankYouPage from "./Components/ThankYouPage";

// Learning Hub Components
import LearnLayout from "./Components/Learn/LearnLayout";
import GettingStarted from "./Components/Learn/GettingStarted";
import FormCreation from "./Components/Learn/FormCreation";
import NodesEdges from "./Components/Learn/NodesEdges";
import { ExportGuide, UseCases, FAQ } from "./Components/Learn/PlaceholderPages";

// Import Bootstrap CSS first to prevent HomePage conflicts
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/form" element={<FormPage />} />
            <Route path="/form/:id" element={<FormPage />} />
            <Route path="/split" element={<UploadPanel />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/forms/builder" element={<FormBuilderPage />} />
            <Route path="/upload" element={<UploadPanel />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
            <Route path="/admin-only" element={<AdminOnlyMessage />} />

            {/* Learning Hub Routes */}
            <Route path="/learn" element={<LearnLayout />}>
              <Route path="getting-started" element={<GettingStarted />} />
              <Route path="form-creation" element={<FormCreation />} />
              <Route path="nodes-edges" element={<NodesEdges />} />
              <Route path="export" element={<ExportGuide />} />
              <Route path="examples" element={<UseCases />} />
              <Route path="faq" element={<FAQ />} />
            </Route>
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
