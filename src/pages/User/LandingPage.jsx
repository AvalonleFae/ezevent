import React, { useEffect, useRef } from 'react';
import Topbar from '../../components/Topbar';
import emailIcon from '../../assets/icons/email.svg';
import phoneIcon from '../../assets/icons/phone.svg';
import aboutIllustration from '../../assets/about_illustration.png';
import '../../css/LandingPage.css';
import EventCard from '../../components/EventCard';

export default function LandingPage() {
    const observerRef = useRef(null);

    useEffect(() => {
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
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target); // Stop observing once visible to save resources
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
            <Topbar />

            <section className="lp-hero" id="home">
                <div className="lp-container">
                    <h1 className="tbhx-header">
                        EZEVENT
                    </h1>
                    <p className="hero-subtitle">EASY EVENT MANAGEMENT SYSTEM.</p>
                </div>
            </section>

            <section className="lp-features animate-on-scroll" id="features">
                <div className="lp-container">
                    <h2 className="tbhx-header">Core Features</h2>
                    <div className="features-grid">
                        {[
                            {
                                id: 'f1',
                                eventName: 'Explore',
                                universityId: 'DISCOVER',
                                description: 'Browse through a vast selection of upcoming university events.',
                                emoji: '🌎',
                            },
                            {
                                id: 'f2',
                                eventName: 'Register',
                                universityId: 'JOIN FAST',
                                description: 'Securing your spot is just a tap away with easy registration.',
                                emoji: '🎟️',
                            },
                            {
                                id: 'f3',
                                eventName: 'Connect',
                                universityId: 'NETWORK',
                                description: 'Bridge the gap between participants and organizers with messaging features.',
                                emoji: '🤝',
                            }
                        ].map((feature, idx) => (
                            <EventCard
                                event={feature}
                                onClick={() => { }}
                                index={idx + 1}
                                type="feature"
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="lp-about animate-on-scroll" id="about">
                <div className="lp-container">
                    <h2 className="tbhx-header">About EZEVENT</h2>
                    <div className="about-content">
                        <p>WE ARE THE FUTURE OF EVENT MANAGEMENT.</p>
                        <div className="about-ticket-container">
                            <div className="about-vintage-ticket">
                                <div className="about-ticket-image">
                                    <img
                                        src={aboutIllustration}
                                        alt="EZEVENT Platform"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="about-ticket-content">
                                    <div className="about-ticket-main">
                                        <span className="about-ticket-label">PREMIER PLATFORM</span>
                                        <h2 className="about-ticket-title">EZEVENT</h2>
                                        <span className="about-ticket-label">FUTURE EVENT TICKETING</span>
                                        <p className="about-ticket-description">
                                            EZEvent is the premier event management platform designed exclusively for university communities.
                                            We connect students, organizers, and institutions through seamless event discovery, fast registration,
                                            and messaging features.
                                        </p>
                                        <p className="about-ticket-slogan">Transforming university life, one event at a time.</p>
                                    </div>
                                    <div className="about-ticket-stub">
                                        <div className="about-ticket-barcode"></div>
                                        <div className="about-admit-text">EZEVENT</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="value-props animate-on-scroll">
                            <div className="value-item">
                                <div className="value-icon"></div>
                                <h4>Lightning Fast</h4>
                                <p>Register for events quickly with our streamlined interface</p>
                            </div>
                            <div className="value-item">
                                <div className="value-icon"></div>
                                <h4>Discover</h4>
                                <p>Find events of varying interests and categories</p>
                            </div>
                            <div className="value-item">
                                <div className="value-icon"></div>
                                <h4>Quick Attendance</h4>
                                <p>Your attendance is confirmed with a simple QR Scan</p>
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
                            <img src={emailIcon} alt="Email" width="20" height="20" loading="lazy" />
                            SUPPORT@EZEVENT.COM
                        </a>
                        <br />
                        <a href="tel:+60123456789">
                            <img src={phoneIcon} alt="Phone" width="20" height="20" loading="lazy" />
                            +60 123 456 789
                        </a>
                    </div>
                </div>
            </section>

            <footer className="lp-footer">
                <div className="lp-container">
                    <p>&copy; 2025 EZEvent. All rights reserved. | Privacy Policy | Terms of Service</p>
                </div>
            </footer>
        </div>
    );
}