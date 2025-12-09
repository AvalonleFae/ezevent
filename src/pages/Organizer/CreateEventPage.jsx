import React, { useState } from 'react';
import '../../css/CreateEvent.css';
import { db, storage, auth } from '../../firebase';
import { collection, addDoc, serverTimestamp, setDoc, updateDoc, doc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import QRCodeGenerator from '../../components/QRCodeGenerator';

export default function CreateEvent() {
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [pendingQrId, setPendingQrId] = useState(null);
    const [form, setForm] = useState({
        eventName: '',
        date: '',
        university: '',
        faculty: '',
        address: '',
        category: '',
        description: ''
    });

    function handleImageChange(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setImagePreview(url);
        setImageFile(file);
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


    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        // Require authentication to create/upload events
        const user = auth.currentUser;
        if (!user) {
            alert('You must be signed in to create an event.');
            setSubmitting(false);
            return;
        }
        try {
            const eventData = {
                eventName: form.eventName,
                date: form.date ? new Date(form.date) : null,
                universityid: form.university,
                facultyid: form.faculty,
                address: form.address,
                categoryid: form.category,
                status: 'pending',
                description: form.description,
                QR: '',
                noparticipants: 0,
                createdAt: serverTimestamp()
            };

            // If an image file was selected, upload it to Firebase Storage
            if (imageFile) {
                const filename = `${Date.now()}_${imageFile.name}`;
                // Store images under a user-scoped folder to match typical storage rules
                const imgRef = storageRef(storage, `events/${user.uid}/${filename}`);
                await uploadBytes(imgRef, imageFile);
                const downloadURL = await getDownloadURL(imgRef);
                eventData.Image = downloadURL;
            }

            // include owner id so you can enforce rules and query by owner
            eventData.userid = user.uid;

            // Write to Firestore 'events' collection
            const docRef = await addDoc(collection(db, 'events'), eventData);
            // eslint-disable-next-line no-console
            console.log('Event created with ID:', docRef.id);

            // Generate Unique QR ID
            const qrDocRef = doc(collection(db, 'QR'));
            const qrId = qrDocRef.id;
            
            // Update the event to reference this QR ID
            try {
                await updateDoc(docRef, { QR: qrId });
            } catch (e) {
                console.error('Failed to set event QR ref:', e);
            }

            setPendingQrId(qrId);

            alert('Event created successfully');

            // Optionally reset form
            setForm({ eventName: '', date: '', university: '', faculty: '', address: '', category: '', description: '' });
            setImagePreview(null);
            setImageFile(null);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to create event:', err);
            alert('Failed to create event: ' + (err.message || err));
        } finally {
            setSubmitting(false);
        }
    }

    // helper to convert dataURL to Blob
    function dataURLtoBlob(dataurl) {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    //Upload QR Image to Firebase Storage
    async function handleQrDataUrl(dataUrl) {
        try {
            const user = auth.currentUser;
            if (!user || !pendingQrId) return;
            const blob = dataURLtoBlob(dataUrl);
            // Upload QR image to Storage with QR ID as filename
            const qrRef = storageRef(storage, `qrcodes/${user.uid}/${pendingQrId}.png`);
            await uploadBytes(qrRef, blob);
            const downloadURL = await getDownloadURL(qrRef);
            // Save QR document with its own ID to firestore
            await setDoc(doc(db, 'QR', pendingQrId), {
                image: downloadURL,
                eventId: pendingQrId,
                createdAt: serverTimestamp(),
            });
            setQrData(downloadURL);
            setPendingQrId(null);
        } catch (e) {
            console.error('Failed uploading QR to storage:', e);
        }
    }

    return (
        <div className="ce-root">
            <header className="ce-header">
                <button type="button" className="ce-back" aria-label="Back">←</button>
                <h1>Create A Event</h1>
            </header>

            <form className="ce-form" onSubmit={handleSubmit}>
                <label className="ce-field">
                    <span className="ce-label">Event Name</span>
                    <input
                        className="ce-input"
                        placeholder="Input"
                        value={form.eventName}
                        onChange={(e) => setForm({ ...form, eventName: e.target.value })}
                        required
                    />
                </label>

            <label className="ce-field">
                <span className="ce-label">Date</span>
                <input
                className="ce-input"
                type="datetime-local"
                value={form.date || localNow}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                min={minDate}
                required
                />
                <small className="ce-hint">DD/MM/YYYY</small>
            </label>

                <div className="ce-field ce-select-grid">
                    <div>
                        <span className="ce-label">Location</span>
                        <select className="ce-select" value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} required>
                            <option value="" disabled className="placeholder-option" hidden >Select University</option>
                            <option>UKM</option>
                            <option>UPM</option>
                            <option>UTM</option>
                            <option>UM</option>
                            required
                        </select>
                    </div>
                    <div>
                        <span className="ce-label">Faculty</span>
                        <select className="ce-select" value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} required>
                            <option value="" disabled className="placeholder-option" hidden >Select Faculty</option>
                            <option>FTSM</option>
                            <option>FST</option>
                            <option>FPI</option>
                            required
                        </select>
                    </div>
                </div>

                <label className="ce-field">
                    <span className="ce-label">Address</span>
                    <input className="ce-input" placeholder="Input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
                </label>

                <label className="ce-field">
                    <span className="ce-label">Category</span>
                    <select className="ce-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                        <option value="" disabled className="placeholder-option" hidden >Select Category</option>
                        <option>Sport</option>
                        <option>Academic</option>
                        <option>Cultural</option>
                        <option>Others</option>
                    </select>
                </label>

                <label className="ce-field">
                    <span className="ce-label">Description</span>
                    <textarea className="ce-textarea" placeholder="Value" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </label>

                <div className="ce-field">
                    <span className="ce-label">Image</span>
                    <label className="ce-image-placeholder">
                        {imagePreview ? (
                            <img src={imagePreview} alt="preview" className="ce-image-preview" />
                        ) : (
                            <div className="ce-image-icon">🖼️</div>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageChange} required/>
                    </label>
                </div>

                <div className="ce-actions">
                    <button type="submit" className="ce-submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
                </div>
            </form>
            {pendingQrId && (
                <div className="ce-qr">
                    <h3>Generating QR…</h3>
                    <QRCodeGenerator value={pendingQrId} size={300} onDataUrl={handleQrDataUrl} />
                </div>
            )}
            {qrData && (
                <div className="ce-qr">
                    <h3>Event QR</h3>
                    <img src={qrData} alt="Event QR" style={{ width: 300, height: 300 }} />
                </div>
            )}
        </div>
    );
}