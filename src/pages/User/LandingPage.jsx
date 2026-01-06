import React, { useEffect, useRef } from 'react';
import Topbar from '../../components/Topbar';
import emailIcon from '../../assets/icons/email.svg';
import instagramIcon from '../../assets/icons/instagram.svg';
import facebookIcon from '../../assets/icons/facebook.svg';
import aboutIllustration from '../../assets/about_illustration.png';
import '../../css/LandingPage.css';

export default function LandingPage() {
    const observerRef = useRef(null);

    useEffect(() => {
        // Smooth scroll for anchors
        const anchors = document.querySelectorAll('a[href^="#"]');
        const handler = function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        };
        anchors.forEach(a => a.addEventListener('click', handler));
        return () => anchors.forEach(a => a.removeEventListener('click', handler));
    }, []);

    useEffect(() => {
        // Intersection Observer for animations
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach((el) => observer.observe(el));

        observerRef.current = observer;

        return () => observer.disconnect();
    }, []);

    return (
        <div className="landing-page">
            <div className="halftone-bg"></div>
            <Topbar />

            <section className="lp-hero" id="home">
                <div className="hero-bg-text">EZEVENT</div>
                <div className="lp-container">
                    <h1 className="tbhx-header animate-on-scroll">
                        <span className="text-glow typing-effect">EZEvent</span>
                    </h1>
                    <p className="hero-subtitle animate-on-scroll">EVENT MANAGEMENT. FUTURISTIC COMMUNITY.</p>
                    <button className="tbhx-button animate-on-scroll">EXPLORE NOW</button>
                </div>
            </section>

            <section className="lp-features animate-on-scroll" id="features">
                <div className="lp-container">
                    <h2 className="tbhx-header">Core Features</h2>
                    <div className="features-grid">
                        <div className="tbhx-card feature-card animate-on-scroll">
                            <span className="card-num">01</span>
                            <h3>Explore</h3>
                            <p>Discover university events effortlessly with our high-speed interface.</p>
                        </div>
                        <div className="tbhx-card feature-card animate-on-scroll">
                            <span className="card-num">02</span>
                            <h3>Register</h3>
                            <p>One-click registration system with instantly generated QR codes.</p>
                        </div>
                        <div className="tbhx-card feature-card animate-on-scroll">
                            <span className="card-num">03</span>
                            <h3>Connect</h3>
                            <p>Engage with your campus community through our networking tools.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="lp-about animate-on-scroll" id="about">
                <div className="lp-container">
                    <h2 className="tbhx-header">About EZEVENT</h2>
                    <div className="about-content">
                        <div className="about-mission animate-on-scroll">
                            <div className="mission-content">
                                <p className="mission-statement">
                                    EZEvent is the premier event management platform designed exclusively for university communities.
                                    We connect students, organizers, and institutions through seamless event discovery,
                                    instant registration, and powerful networking tools.
                                </p>
                                <p className="mission-tagline">
                                    Transforming campus life, one event at a time.
                                </p>
                            </div>
                            <div className="mission-visual">
                                <img
                                    src={aboutIllustration}
                                    alt="Students collaborating on campus events"
                                    className="about-illustration"
                                />
                            </div>
                        </div>

                        <div className="value-props animate-on-scroll">
                            <div className="value-item">
                                <div className="value-icon">⚡</div>
                                <h4>Lightning Fast</h4>
                                <p>Register for events in seconds with our streamlined interface</p>
                            </div>
                            <div className="value-item">
                                <div className="value-icon">🎯</div>
                                <h4>Smart Discovery</h4>
                                <p>Find events tailored to your interests and campus community</p>
                            </div>
                            <div className="value-item">
                                <div className="value-icon">🔒</div>
                                <h4>Secure & Reliable</h4>
                                <p>Your data is protected with enterprise-grade security</p>
                            </div>
                            <div className="value-item">
                                <div className="value-icon">🌐</div>
                                <h4>Connected Community</h4>
                                <p>Build meaningful connections with peers across your campus</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="lp-contact animate-on-scroll" id="contact">
                <div className="lp-container">
                    <h2 className="tbhx-header">Contact Us</h2>
                    <div className="contact-links">
                        <a href="mailto:support@ezevent.com">
                            <img src={emailIcon} alt="Email" width="20" height="20" />
                            SUPPORT@EZEVENT.COM
                        </a>
                        <a href="tel:+60123456789">
                            <img src={instagramIcon} alt="Phone" width="20" height="20" /> {/* Using Instagram icon as placeholder for phone; replace if needed */}
                            +60 123 456 789
                        </a>
                    </div>
                </div>
            </section>

            <footer className="lp-footer">
                <div className="lp-container">
                    <p>&copy; 2023 EZEvent. All rights reserved. | Privacy Policy | Terms of Service</p>
                </div>
            </footer>
        </div>
    );
}