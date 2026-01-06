import React, { useEffect, useRef } from 'react';
import Topbar from '../../components/Topbar';
import emailIcon from '../../assets/icons/email.svg';
import instagramIcon from '../../assets/icons/instagram.svg';
import facebookIcon from '../../assets/icons/facebook.svg';
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
                        EZEVENT
                    </h1>
                    <p className="hero-subtitle animate-on-scroll">EVENT MANAGEMENT. FUTURISTIC COMMUNITY.</p>
                    <button className="tbhx-button animate-on-scroll">EXPLORE NOW</button>
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
                                description: 'Browse through a vast galaxy of upcoming campus events, talks, and workshops tailored to your interests.',
                                emoji: '🌎',
                            },
                            {
                                id: 'f2',
                                eventName: 'Register',
                                universityId: 'JOIN FAST',
                                description: 'Securing your spot is just a tap away with our seamless biometric-ready registration vault.',
                                emoji: '🎟️',
                            },
                            {
                                id: 'f3',
                                eventName: 'Connect',
                                universityId: 'NETWORK',
                                description: 'Bridge the gap between participants and organizers through integrated social networking tools.',
                                emoji: '🤝',
                            }
                        ].map((feature, idx) => (
                            <div className="animate-on-scroll" key={feature.id} style={{ display: 'flex', justifyContent: 'center' }}>
                                <EventCard
                                    event={feature}
                                    onClick={() => { }}
                                    index={idx + 1}
                                    type="feature"
                                />
                            </div>
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
                            <EventCard
                                event={{
                                    eventName: 'EZEVENT',
                                    universityId: 'PREMIER PLATFORM',
                                    description: 'EZEvent is the premier event management platform designed exclusively for university communities. We connect students, organizers, and institutions through seamless event discovery, instant registration, and powerful networking tools.',
                                    slogan: 'Transforming campus life, one event at a time.',
                                    emoji: '🚀',
                                }}
                                onClick={() => { }}
                                variant="vintage"
                                type="feature"
                                index={5}
                            />
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
                            <img src={instagramIcon} alt="Phone" width="20" height="20" />
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