import React, { useEffect } from 'react';
import Topbar from '../../components/Topbar';
import testImage from '../../assets/icons/test.jpg';
import emailIcon from '../../assets/icons/email.svg';
import instagramIcon from '../../assets/icons/instagram.svg';
import facebookIcon from '../../assets/icons/facebook.svg';
import '../../css/LandingPage.css'

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
            <Topbar />

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
                            <img src={testImage} alt="Discover Events" />
                            <h3>Discover Events</h3>
                            <p>Browse events by category, date, or university. Never miss out on fun or important gatherings.</p>
                        </div>
                        <div className="lp-card">
                            <img src={testImage} alt="Easy Registration" />
                            <h3>Easy Registration</h3>
                            <p>One-tap sign-up with QR code check-ins.</p>
                        </div>
                        <div className="lp-card">
                            <img src={testImage} alt="Organize Events" />
                            <h3>Organize Like a Pro</h3>
                            <p>Create and manage events with analytics, and attendee tracking.</p>
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
                    <div className="lp-contact-links">
                        <a href="mailto:support@ezevent.com" className="lp-contact-link" aria-label="Email support" title="Email support">
                            <img src={emailIcon} alt="Email" />
                            <span>Email</span>
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="lp-contact-link" title="Instagram support" aria-label="Instagram">
                            <img src={instagramIcon} alt="Instagram" />
                            <span>Instagram</span>
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="lp-contact-link" title="Facebook support" aria-label="Facebook">
                            <img src={facebookIcon} alt="Facebook" />
                            <span>Facebook</span>
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
