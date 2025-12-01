import React, { useState } from 'react';
import '../css/CreateEvent.css';

export default function CreateEvent() {
    const [imagePreview, setImagePreview] = useState(null);

    function handleImageChange(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setImagePreview(url);
    }
    // Generate correct local datetime without blocking the calendar
    const now = new Date();
    const offset = now.getTimezoneOffset();

    // Local time in correct YYYY-MM-DDTHH:MM format
    const localNow = new Date(now.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 16);

    // Min value (1 minute earlier so the calendar opens normally)
    const minDate = new Date(now.getTime() - offset * 60000 - 60000)
    .toISOString()
    .slice(0, 16);


    return (
        <div className="ce-root">
            <header className="ce-header">
                <button type="button" className="ce-back" aria-label="Back">←</button>
                <h1>Create A Event</h1>
            </header>

            <form className="ce-form" onSubmit={(e) => { e.preventDefault(); alert('Submitted (demo)'); }}>
                <label className="ce-field">
                    <span className="ce-label">Event Name</span>
                    <input className="ce-input" placeholder="Input" />
                </label>

            <label className="ce-field">
                <span className="ce-label">Date</span>
                <input
                className="ce-input"
                type="datetime-local"
                defaultValue={localNow}
                min={minDate}
                />
                <small className="ce-hint">DD/MM/YYYY</small>
            </label>

                <div className="ce-field ce-select-grid">
                    <div>
                        <span className="ce-label">Location</span>
                        <select className="ce-select" defaultValue="">
                            <option value="" disabled className="placeholder-option" hidden >Select University</option>
                            <option>UKM</option>
                            <option>UPM</option>
                            <option>UTM</option>
                            <option>UM</option>
                        </select>
                    </div>
                    <div>
                        <span className="ce-label">Faculty</span>
                        <select className="ce-select" defaultValue="">
                            <option value="" disabled className="placeholder-option" hidden >Select Faculty</option>
                            <option>FTSM</option>
                            <option>FST</option>
                            <option>FPI</option>
                        </select>
                    </div>
                </div>

                <label className="ce-field">
                    <span className="ce-label">Address</span>
                    <input className="ce-input" placeholder="Input" />
                </label>

                <label className="ce-field">
                    <span className="ce-label">Category</span>
                    <select className="ce-select" defaultValue="">
                        <option value="" disabled className="placeholder-option" hidden >Select Category</option>
                        <option>Sport</option>
                        <option>Academic</option>
                        <option>Cultural</option>
                        <option>Others</option>
                    </select>
                </label>

                <label className="ce-field">
                    <span className="ce-label">Description</span>
                    <textarea className="ce-textarea" placeholder="Value" />
                </label>

                <div className="ce-field">
                    <span className="ce-label">Image</span>
                    <label className="ce-image-placeholder">
                        {imagePreview ? (
                            <img src={imagePreview} alt="preview" className="ce-image-preview" />
                        ) : (
                            <div className="ce-image-icon">🖼️</div>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                    </label>
                </div>

                <div className="ce-actions">
                    <button type="submit" className="ce-submit">Submit</button>
                </div>
            </form>
        </div>
    );
}