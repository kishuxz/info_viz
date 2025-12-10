import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

import useScrollReveal from "../hooks/useScrollReveal";
import useParallaxTilt from "../hooks/useParallaxTilt";

import initNetworkCanvas from "../utils/networkCanvas";
import initDotCanvas from "../utils/dotCanvas";
import Footer from "./Footer";

function HomePage() {
  useScrollReveal();
  useParallaxTilt(".showcase-frame", {
    maxTilt: 3,
    scale: 1.03,
    perspective: 900,
  });

  const networkCanvasRef = useRef(null);
  const dotCanvasRef = useRef(null);
  const videoRef = useRef(null);

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

  // Video playback handler
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = async () => {
      try {
        await video.play();
        console.log("Video playing successfully");
      } catch (error) {
        console.error("Video autoplay failed:", error);
        // If autoplay fails, the user can still use controls
      }
    };

    video.load(); // Ensure video is loaded
    playVideo();
  }, []);

  // Examples slider auto-scroll
  useEffect(() => {
    const slider = document.querySelector('.examples-slider');
    const indicators = document.querySelectorAll('.slider-indicators .indicator');
    const prevBtn = document.querySelector('.slider-arrow-prev');
    const nextBtn = document.querySelector('.slider-arrow-next');

    if (!slider || indicators.length === 0) return;

    let currentIndex = 0;
    let intervalId;
    let isPaused = false;

    const scrollToIndex = (index) => {
      const wrappers = slider.querySelectorAll('.example-card-wrapper');
      if (wrappers.length === 0) return;

      const wrapperWidth = wrappers[0].offsetWidth;
      const gap = 40;
      slider.scrollTo({
        left: (wrapperWidth + gap) * index,
        behavior: 'smooth'
      });

      indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
      });

      currentIndex = index;
    };

    const autoScroll = () => {
      if (!isPaused) {
        currentIndex = (currentIndex + 1) % 8; // Updated for 8 cards total
        scrollToIndex(currentIndex);
      }
    };

    const handlePrev = () => {
      const newIndex = (currentIndex - 1 + 8) % 8; // Updated for 8 cards
      scrollToIndex(newIndex);
    };

    const handleNext = () => {
      const newIndex = (currentIndex + 1) % 8; // Updated for 8 cards
      scrollToIndex(newIndex);
    };

    intervalId = setInterval(autoScroll, 5000);

    const handleMouseEnter = () => { isPaused = true; };
    const handleMouseLeave = () => { isPaused = false; };

    slider.addEventListener('mouseenter', handleMouseEnter);
    slider.addEventListener('mouseleave', handleMouseLeave);

    if (prevBtn) prevBtn.addEventListener('click', handlePrev);
    if (nextBtn) nextBtn.addEventListener('click', handleNext);

    return () => {
      clearInterval(intervalId);
      slider.removeEventListener('mouseenter', handleMouseEnter);
      slider.removeEventListener('mouseleave', handleMouseLeave);
      if (prevBtn) prevBtn.removeEventListener('click', handlePrev);
      if (nextBtn) nextBtn.removeEventListener('click', handleNext);
    };
  }, []);


  // Previously had a features array here that was unused

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

      {/* =============== VIDEO DEMO SECTION ================= */}
      <section id="workflow-demo" className="standalone-demo-section">
        <div className="demo-content-wrapper">
          <h2 className="demo-main-title">See It In Action</h2>
          <p className="demo-main-subtitle">
            Watch how the complete workflow transforms your data from forms to network visualizations
          </p>

          <div className="demo-video-container">
            <div className="video-wrapper">
              <video
                ref={videoRef}
                src="/assets/demo/workflow-demo.webm"
                className="demo-video"
                controls
                autoPlay
                loop
                muted
                playsInline
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          <div className="demo-actions">
            <button
              className="btn-view-examples"
              onClick={() => {
                const examplesSection = document.getElementById('network-examples');
                if (examplesSection) {
                  examplesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              View Network Examples
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ marginLeft: '8px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
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
              <button
                className="btn-primary"
                style={{ padding: '10px 24px', fontSize: '14px', marginTop: '16px', cursor: 'pointer' }}
                onClick={() => {
                  const isLoggedIn = localStorage.getItem('adminId');
                  if (isLoggedIn) {
                    window.location.href = '/forms/builder';
                  } else {
                    window.location.href = '/signup?returnTo=/forms/builder';
                  }
                }}
              >
                Go to Form Page →
              </button>
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

              <div className="analytics-cta">
                <Link to="/analytics" style={{ textDecoration: 'none' }}>
                  <button className="btn-analytics-primary">
                    View Analytics Dashboard
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ marginLeft: '8px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </Link>
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

        {/* =============== EXAMPLE NETWORK VISUALIZATIONS ================= */}
        <section className="how-it-works">
          <div id="network-examples" className="examples-section" data-reveal data-reveal-delay="200">
            <h3 className="examples-title">Example Network Visualizations</h3>
            <p className="examples-subtitle">
              See how your data looks when imported into Kumu and Gephi, or explore with our built-in analytics
            </p>

            <div className="examples-slider-container">
              <div className="examples-slider">
                {/* Kumu Example 1 - Full Network */}
                <div className="example-card-wrapper">
                  <div className="example-showcase-card">
                    <div className="example-showcase-image">
                      <img
                        src="/assets/examples/kumu-network-1.png"
                        alt="Kumu Event-Sector-Org Full Network"
                      />
                      <div className="example-overlay">
                        <h4 className="example-overlay-title">Full Network</h4>
                      </div>
                    </div>
                  </div>
                  <div className="example-card-details">
                    <h4 className="example-detail-title">Event→Sector→Org Network</h4>
                    <p className="example-detail-desc">
                      Complete 3-layer network showing how sectors connect different organizations at an event. Clean legend with distinct node types.
                    </p>
                    <Link to="/examples" className="example-link">
                      View All Examples →
                    </Link>
                  </div>
                </div>

                {/* Kumu Example 2 - Sector Focus */}
                <div className="example-card-wrapper">
                  <div className="example-showcase-card">
                    <div className="example-showcase-image">
                      <img
                        src="/assets/examples/kumu-network-2.png"
                        alt="Kumu Sector-Focused View"
                      />
                      <div className="example-overlay">
                        <h4 className="example-overlay-title">Sector View</h4>
                      </div>
                    </div>
                  </div>
                  <div className="example-card-details">
                    <h4 className="example-detail-title">Sector-Focused Network</h4>
                    <p className="example-detail-desc">
                      Zoom in on how Research Sectors (NLP, Robotics, Computer Vision) group organizations with clear sector nodes.
                    </p>
                    <Link to="/examples" className="example-link">
                      View All Examples →
                    </Link>
                  </div>
                </div>

                {/* Kumu Example 3 - Cross-Sector Connections */}
                <div className="example-card-wrapper">
                  <div className="example-showcase-card">
                    <div className="example-showcase-image">
                      <img
                        src="/assets/examples/kumu-network-3.png"
                        alt="Kumu Cross-Sector Connections"
                      />
                      <div className="example-overlay">
                        <h4 className="example-overlay-title">Cross-Sector</h4>
                      </div>
                    </div>
                  </div>
                  <div className="example-card-details">
                    <h4 className="example-detail-title">Cross-Sector Connections</h4>
                    <p className="example-detail-desc">
                      Detailed view showing organizations linked through multiple sectors with connection types and meeting frequency.
                    </p>
                    <Link to="/examples" className="example-link">
                      View All Examples →
                    </Link>
                  </div>
                </div>

                {/* Kumu Example 4 - Edge Types */}
                <div className="example-card-wrapper">
                  <div className="example-showcase-card">
                    <div className="example-showcase-image">
                      <img
                        src="/assets/examples/kumu-network-4.png"
                        alt="Kumu Edge Type Visualization"
                      />
                      <div className="example-overlay">
                        <h4 className="example-overlay-title">Edge Types</h4>
                      </div>
                    </div>
                  </div>
                  <div className="example-card-details">
                    <h4 className="example-detail-title">Multi-Edge Network</h4>
                    <p className="example-detail-desc">
                      Advanced legend showing Event↔Sector and Sector↔Org connection types with color-coded edge styles.
                    </p>
                    <Link to="/examples" className="example-link">
                      View All Examples →
                    </Link>
                  </div>
                </div>

                {/* Kumu Example 5 - Alternative Color Scheme */}
                <div className="example-card-wrapper">
                  <div className="example-showcase-card">
                    <div className="example-showcase-image">
                      <img
                        src="/assets/examples/kumu-network-5.png"
                        alt="Kumu Alternative Color Scheme"
                      />
                      <div className="example-overlay">
                        <h4 className="example-overlay-title">Custom Colors</h4>
                      </div>
                    </div>
                  </div>
                  <div className="example-card-details">
                    <h4 className="example-detail-title">Custom Styling</h4>
                    <p className="example-detail-desc">
                      Same network with alternative color palette showing customization options for different presentation needs.
                    </p>
                    <Link to="/examples" className="example-link">
                      View All Examples →
                    </Link>
                  </div>
                </div>


                {/* Gephi Card */}
                <div className="example-card-wrapper">
                  <div className="example-showcase-card">
                    <div className="example-showcase-image">
                      <img
                        src="/assets/examples/gephi-network-example.png"
                        alt="Gephi Network Visualization"
                      />
                      <div className="example-overlay">
                        <h4 className="example-overlay-title">Gephi</h4>
                      </div>
                    </div>
                  </div>
                  <div className="example-card-details">
                    <h4 className="example-detail-title">Gephi</h4>
                    <p className="example-detail-desc">
                      Force-directed layouts with advanced analytics. Ideal for academic research and deep network analysis with centrality measures.
                    </p>
                    <Link to="/examples" className="example-link">
                      View All Examples →
                    </Link>
                  </div>
                </div>

                {/* Analytics Card */}
                <div className="example-card-wrapper">
                  <div className="example-showcase-card">
                    <div className="example-showcase-image">
                      <img
                        src="/assets/analytics-preview.png"
                        alt="Analytics Dashboard"
                      />
                      <div className="example-overlay">
                        <h4 className="example-overlay-title">Analytics</h4>
                      </div>
                    </div>
                  </div>
                  <div className="example-card-details">
                    <h4 className="example-detail-title">Built-in Analytics</h4>
                    <p className="example-detail-desc">
                      Real-time network metrics and insights dashboard. Explore centrality measures, clustering, and community detection without leaving the platform.
                    </p>
                    <a href="/analytics" className="example-link">
                      View dashboard →
                    </a>
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="slider-controls">
                <button className="slider-arrow slider-arrow-prev" aria-label="Previous">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="slider-arrow slider-arrow-next" aria-label="Next">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="slider-indicators">
                <span className="indicator active"></span>
                <span className="indicator"></span>
                <span className="indicator"></span>
                <span className="indicator"></span>
                <span className="indicator"></span>
                <span className="indicator"></span>
                <span className="indicator"></span>
                <span className="indicator"></span>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="faq-section" style={{ marginTop: '80px' }}>
            <div className="section-header" data-reveal>
              <h2>Frequently Asked Questions</h2>
              <p>Everything you need to know to get started</p>
            </div>

            <div className="faq-grid">
              <div className="faq-card" data-reveal data-reveal-delay="100">
                <div className="faq-icon">
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3>Do I need coding skills?</h3>
                <p>
                  No! NetworkMap is designed for non-technical users. Simply upload your forms or spreadsheets, and we'll handle the rest.
                </p>
              </div>

              <div className="faq-card" data-reveal data-reveal-delay="200">
                <div className="faq-icon">
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3>What formats are supported?</h3>
                <p>
                  We support CSV, Excel (XLSX), and Google Sheets. You can also use our built-in form builder to collect data directly.
                </p>
              </div>

              <div className="faq-card" data-reveal data-reveal-delay="300">
                <div className="faq-icon">
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3>Is my data secure?</h3>
                <p>
                  Yes! All data is stored securely in your own database. This is an open-source tool you can self-host for complete control.
                </p>
              </div>

              <div className="faq-card" data-reveal data-reveal-delay="400">
                <div className="faq-icon">
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3>Can I export my visualizations?</h3>
                <p>
                  Absolutely! Export to Kumu and Gephi for advanced analysis, or download your processed nodes and edges as CSV files.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div >

      <Footer />
    </div >
  );
}

export default HomePage;
