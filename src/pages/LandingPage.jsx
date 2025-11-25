import React, { useEffect } from 'react';
import '../css/LandingPage.css'

export default function LandingPage() {
	useEffect(() => {
		const anchors = document.querySelectorAll('a[href^="#"]')
		const handler = function (e) {
			e.preventDefault()
			const target = document.querySelector(this.getAttribute('href'))
			if (target) target.scrollIntoView({ behavior: 'smooth' })
		}
		anchors.forEach(a => a.addEventListener('click', handler))
		return () => anchors.forEach(a => a.removeEventListener('click', handler))
	}, [])

    return (
        <div className="lp-root">
            <header className="lp-header">
                <div className="lp-container lp-flex lp-nav">
                    <div>
                        <img src="../src/assets/icons/ezevent_logo.png" alt="EZEvent Logo" />
                    </div>
                    <div>
                        <a href="/">Home</a>
                        <span>|</span>
                        <a href="#features">Event</a>
                        <span>|</span>
                        <a href="#about">About Us</a>
                        <span>|</span>
                        <a href="#contact">Contact Us</a>
                        <span>|</span>
                        <a href="#">Language</a>
                        <span>|</span>
                        <a href="/login">Log In/Sign Up</a>
                    </div>
                </div>
            </header>

            <section className="lp-hero">
                <div className="lp-container">
                    <h1>Welcome to EZEvent</h1>
                    <p>Discover, register, and attend university events effortlessly. Connect with your campus community!</p>
                </div>
            </section>

            <section id="features" className="lp-features">
                <div className="lp-container">
                    <h2>Why Choose EZEvent?</h2>
                    <div className="grid">
                        <div className="lp-card">
                            <img src="../src/assets/icons/test.jpg" alt="Discover Events" />
                            <h3>Discover Events</h3>
                            <p>Browse events by category, date, or university. Never miss out on fun or important gatherings.</p>
                        </div>
                        <div className="lp-card">
                            <img src="../src/assets/icons/test.jpg" alt="Easy Registration" />
                            <h3>Easy Registration</h3>
                            <p>One-tap sign-up with QR code check-ins.</p>
                        </div>
                        <div className="lp-card">
                            <img src="../src/assets/icons/test.jpg" alt="Organize Events" />
                            <h3>Organize Like a Pro</h3>
                            <p>Create and manage events with  analytics, and attendee tracking.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="about" className="lp-about">
                <div className="lp-container">
                    <h2>About EZEvent</h2>
                    <p>EZEvent is designed for university students by students. Whether you're attending a hackathon, joining a concert, or hosting a club event, our app makes it simple and fun. Join thousands of students already using EZEvent to stay connected on campus.</p>
                </div>
            </section>

            <section id="contact" className="lp-contact">
                <div className="lp-container">
                    <h2>Contact Us</h2>
                    <p>Have questions or feedback? We'd love to hear from you! Reach out to our support team.</p>
                    <div>
                        <a href="mailto:support@ezevent.com" aria-label="Email support" title="Email support">
                            <img src="../src/assets/icons/email.svg" alt="Email" style={{ width: 24, height: 24 }} />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram support" aria-label="Instagram">
                            <img src="../src/assets/icons/instagram.svg" alt="Instagram" style={{ width: 24, height: 24 }} />
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook support" aria-label="Facebook">
                            <img src="../src/assets/icons/facebook.svg" alt="Facebook" style={{ width: 24, height: 24 }} />
                        </a>
                    </div>
                </div>
            </section>

            <footer className="lp-footer">
                <div className="lp-container">
                    <p>© 2023 EZEvent. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
