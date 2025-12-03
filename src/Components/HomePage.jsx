import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

import useScrollReveal from "../hooks/useScrollReveal";
import useParallaxTilt from "../hooks/useParallaxTilt";

import initNetworkCanvas from "../utils/networkCanvas";
import initDotCanvas from "../utils/dotCanvas";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

function HomePage() {
  useScrollReveal();
  useParallaxTilt(".showcase-frame", {
    maxTilt: 3,
    scale: 1.03,
    perspective: 900,
  });

  const networkCanvasRef = useRef(null);
  const dotCanvasRef = useRef(null);

  useEffect(() => {
    if (!networkCanvasRef.current) return;
    const cleanup = initNetworkCanvas(networkCanvasRef.current);
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  useEffect(() => {
    if (!dotCanvasRef.current) return;
    const cleanup = initDotCanvas(dotCanvasRef.current);
    return () => {
      if (cleanup) cleanup();
    };
  }, []);




  const features = [
    {
      label: "Nature",
      title: "Organic Growth",
      description: "Visualize the organic growth of your community network.",
      list: ["Natural patterns", "Growth visualization"],
      image: "/assets/slider-leaf.png"
    },
    {
      label: "Community Intelligence",
      title: "Visualize Your Network",
      description: "Transform raw survey data into interactive graphs. Identify key influencers, bridges, and clusters within your community instantly.",
      list: ["Real-time rendering", "Interactive node exploration", "Cluster identification"],
      image: "/assets/slider-graph.png"
    },
    {
      label: "Data Driven",
      title: "Deep Analytics",
      description: "Go beyond simple visualization. Our analytics engine calculates centrality measures, density, and other key metrics to give you actionable insights.",
      list: ["Degree & Betweenness Centrality", "Community Detection", "Exportable Reports"],
      image: "/assets/analytics-preview.png"
    },
    {
      label: "Context Aware",
      title: "Rich Metadata",
      description: "Overlay rich metadata on your network. Filter by attributes, color-code by category, and explore the hidden structure of your data.",
      list: ["Attribute filtering", "Dynamic coloring", "Metadata tooltips"],
      image: "/assets/hero-preview.png"
    }
  ];

  // Sticky scroll logic removed for static layout

  return (
    <div className="home-page">
      {/* =============== HERO SECTION (2-Column) ================= */}
      <section className="hero">
        {/* Background Canvas for Network Animation */}
        <canvas ref={networkCanvasRef} className="network-canvas" />

        <div className="hero-inner flex flex-col items-center max-w-4xl mx-auto px-6">

          {/* LEFT COLUMN: Text Content */}
          <div className="hero-left w-full text-center" data-reveal>
            <h1 className="hero-title text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 leading-tight" data-reveal data-reveal-delay="80">
              Open Source Network Mapping
            </h1>

            <p className="hero-subtitle text-lg text-slate-600 mb-8 max-w-xl mx-auto" data-reveal data-reveal-delay="140">
              Transform your Google Forms and spreadsheets into powerful network graphs.
              Export directly to <strong>Kumu</strong> and <strong>Gephi</strong> for deep analysis.
            </p>

            <div className="hero-buttons flex gap-4 justify-center" data-reveal data-reveal-delay="200">
              <a href="#three-steps" style={{ textDecoration: 'none' }}>
                <button className="btn-primary">Start Mapping</button>
              </a>
              <button className="btn-secondary">View on GitHub</button>
            </div>
          </div>

        </div>
      </section>

      {/* =============== SLIDER SECTION ================= */}
      <section className="slider-section py-20 bg-white" style={{ marginTop: '150px' }}>
        <div style={{ display: 'grid', placeItems: 'center', width: '100%' }}>
          <div style={{ width: '100%', maxWidth: '1024px', padding: '0 24px' }}>
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              pagination={{ clickable: true }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              loop={true}
              className="w-full rounded-xl overflow-hidden shadow-xl"
            >
              {features.map((feature, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-auto"
                    style={{ display: 'block', maxHeight: '600px', objectFit: 'cover' }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* =============== MAIN CONTENT SHEET (Light) ================= */}
      <div className="main-content-sheet">
        {/* =============== STEPS SECTION ================= */}
        <section id="three-steps" className="steps">
          {/* Interactive Dot Canvas */}
          <canvas ref={dotCanvasRef} className="steps-canvas" />

          <div className="section-header">
            <h2>From Form to Graph</h2>
            <p>A streamlined open source workflow for community data.</p>
          </div>

          <div className="steps-grid">
            <div className="step-card" data-reveal data-reveal-delay="100">
              <div className="step-number">01</div>
              <h3>Collect Data</h3>
              <p>
                Use standard Google Forms or Excel templates to gather participant
                and event data from your community.
              </p>
              <Link to="/form" style={{ marginTop: '16px', display: 'inline-block' }}>
                <button className="btn-primary" style={{ padding: '10px 24px', fontSize: '14px' }}>
                  Go to Form Page →
                </button>
              </Link>
            </div>

            <div className="step-card" data-reveal data-reveal-delay="200">
              <div className="step-number">02</div>
              <h3>Process Nodes</h3>
              <p>
                Automatically convert raw rows into structured <strong>Nodes</strong> and <strong>Edges</strong> ready for
                network analysis.
              </p>
              <Link to="/split" style={{ marginTop: '16px', display: 'inline-block' }}>
                <button className="btn-primary" style={{ padding: '10px 24px', fontSize: '14px' }}>
                  Go to Split Page →
                </button>
              </Link>
            </div>

            <div className="step-card" data-reveal data-reveal-delay="300">
              <div className="step-number">03</div>
              <h3>Analyze & Export</h3>
              <p>
                Visualize immediately or export to <strong>Kumu</strong> and <strong>Gephi</strong> for advanced centrality and
                cluster analysis.
              </p>
              <Link to="/analytics" style={{ marginTop: '16px', display: 'inline-block' }}>
                <button className="btn-primary" style={{ padding: '10px 24px', fontSize: '14px' }}>
                  Go to Analytics →
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* =============== ANALYTICS SECTION (Dark Contrast) ================= */}
        <section className="analytics">
          <div className="analytics-inner">
            <div className="analytics-left" data-reveal>
              <h2 className="analytics-title">
                Online Data Analytics For Community Insights
              </h2>
              <p className="analytics-desc">
                To stay competitive, organizations must leverage their data to better understand
                participation patterns and uncover key relationships across events and time.
              </p>

              <div className="analytics-buttons">
                <button className="circle-btn" aria-label="Charts">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </button>
                <button className="circle-btn" aria-label="Data">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </button>
                <button className="circle-btn" aria-label="Export">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="analytics-right" data-reveal data-reveal-delay="200">
              <div className="analytics-graph">
                <img src="/assets/analytics-preview.png" alt="Analytics Graph" />

                {/* Floating Badge */}
                <div className="analytics-badge">
                  <div className="badge-price">2,847</div>
                  <div className="badge-info">
                    <div className="badge-label">Active Connections</div>
                    <div className="badge-growth">↑ 37.8% this week</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =============== HOW IT WORKS SECTION ================= */}
        <section className="how-it-works">
          <div className="section-header" data-reveal>
            <h2>How It Works</h2>
            <p>A streamlined workflow for community data.</p>
          </div>

          <div className="how-grid">
            <div className="how-card" data-reveal data-reveal-delay="100">
              <div className="how-icon">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3>What is Tutor/Mentor Mapping?</h3>
              <p>
                A structured way to track who participates in tutoring and mentoring events, and how
                people and organizations connect across time.
              </p>
            </div>

            <div className="how-card" data-reveal data-reveal-delay="200">
              <div className="how-icon">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3>Who Will Use This?</h3>
              <p>
                Nonprofits, researchers, educators, and coordinators looking for clarity on
                community engagement.
              </p>
            </div>

            <div className="how-card" data-reveal data-reveal-delay="300">
              <div className="how-icon">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3>What Will They Get?</h3>
              <p>
                Clean datasets, visual dashboards, and exportable files for tools like Gephi or
                Kumu.
              </p>
            </div>

            <div className="how-card" data-reveal data-reveal-delay="400">
              <div className="how-icon">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3>How It Works</h3>
              <p>
                Upload files → transform to nodes/edges → explore interactive visualizations and
                analytics.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
