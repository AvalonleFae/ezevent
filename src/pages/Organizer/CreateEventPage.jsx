import React, { useState, useEffect } from 'react';
import '../../css/CreateEvent.css';
import { db, storage, auth } from '../../firebase';
import {
    collection,
    addDoc,
    serverTimestamp,
    setDoc,
    updateDoc,
    doc,
    getDoc,
    getDocs
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import QRCodeGenerator from '../../components/QRCodeGenerator';

export default function CreateEvent() {
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [pendingQrId, setPendingQrId] = useState(null);
    const [pendingEventId, setPendingEventId] = useState(null);

    // Data State
    const [universities, setUniversities] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [categories, setCategories] = useState([]);

    const [form, setForm] = useState({
        eventName: '',
        date: '',
        university: '',
        faculty: '',
        address: '',
        category: '',
        description: '',
        afterRegistrationMessage: '',
        price: '',
        numOfParticipants: ''
    });

    // --- 1. Fetch Universities & Categories on Component Mount ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Universities
                const uniSnapshot = await getDocs(collection(db, 'universities'));
                const uniList = uniSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // UPDATE 1: Add "Other" option manually
                uniList.push({ id: 'Other', universityName: 'Other' });

                setUniversities(uniList);

                // Fetch Categories
                const catSnapshot = await getDocs(collection(db, 'eventCategories'));
                const catList = catSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCategories(catList);

            } catch (error) {
                console.error("Error fetching initial data:", error);
            }
        };
        fetchData();
    }, []);

    // --- 2. Fetch Faculties when 'form.university' changes ---
    useEffect(() => {
        const fetchFaculties = async () => {
            setFaculties([]);
            if (!form.university) return;

            // UPDATE 2: Do not fetch faculties if "Other" is selected
            if (form.university === 'Other') return;

            try {
                const facultiesRef = collection(db, 'universities', form.university, 'faculties');
                const querySnapshot = await getDocs(facultiesRef);

                const facultyList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setFaculties(facultyList);
            } catch (error) {
                console.error("Error fetching faculties:", error);
            }
        };

        fetchFaculties();
    }, [form.university]);

    function handleImageChange(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setImagePreview(url);
        setImageFile(file);
    }

    // UPDATE 3: Helper to get current time string for "min" attribute
    const getMinDateTime = () => {
        const now = new Date();
        // Adjust for timezone to match the input format
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const minDate = getMinDateTime();

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        const user = auth.currentUser;
        if (!user) {
            alert('You must be signed in to create an event.');
            setSubmitting(false);
            return;
        }

        // UPDATE 4: Validate that date is not in the past
        const selectedDate = new Date(form.date);
        const currentDate = new Date();
        if (selectedDate < currentDate) {
            alert('Please select a future date and time.');
            setSubmitting(false);
            return;
        }

        try {
            const eventData = {
                eventName: form.eventName,
                date: form.date ? new Date(form.date) : null,
                universityId: form.university,
                facultyId: form.faculty, // This will be empty string if "Other" was selected
                address: form.address,
                categoryId: form.category,
                status: 'pending',
                description: form.description,
                afterRegistrationMessage: form.afterRegistrationMessage,
                createdAt: serverTimestamp(),
                price: form.price,
                QR: '',
                numOfParticipants: form.numOfParticipants ? Number(form.numOfParticipants) : 0,
            };

            if (imageFile) {
                const filename = `${Date.now()}_${imageFile.name}`;
                const imgRef = storageRef(storage, `events/${user.uid}/${filename}`);
                await uploadBytes(imgRef, imageFile);
                const downloadURL = await getDownloadURL(imgRef);
                eventData.Image = downloadURL;
            }

            eventData.userId = user.uid;

            const docRef = await addDoc(collection(db, 'events'), eventData);

            const qrDocRef = doc(collection(db, 'QR'));
            const qrId = qrDocRef.id;

            await updateDoc(docRef, { QR: qrId });

            setPendingQrId(qrId);
            setPendingEventId(docRef.id);

            alert('Event created successfully');

            setForm({
                eventName: '',
                date: '',
                university: '',
                faculty: '',
                address: '',
                category: '',
                description: '',
                afterRegistrationMessage: '',
                price: '',
                numOfParticipants: ''
            });
            setImagePreview(null);
            setImageFile(null);
        } catch (err) {
            console.error('Failed to create event:', err);
            alert('Failed to create event: ' + (err.message || err));
        } finally {
            setSubmitting(false);
        }
    }

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

    async function handleQrDataUrl(dataUrl) {
        try {
            const user = auth.currentUser;
            if (!user || !pendingQrId || !pendingEventId) return;

            const eventSnap = await getDoc(doc(db, 'events', pendingEventId));
            if (!eventSnap.exists()) {
                alert('Related event not found.');
                setPendingQrId(null); setPendingEventId(null); return;
            }
            const eventData = eventSnap.data();
            if (eventData.userId !== user.uid) {
                alert('You are not the owner of this event. QR upload cancelled.');
                setPendingQrId(null); setPendingEventId(null); return;
            }

            const blob = dataURLtoBlob(dataUrl);
            const qrRef = storageRef(storage, `qrcodes/${user.uid}/${pendingQrId}.png`);
            await uploadBytes(qrRef, blob);
            const downloadURL = await getDownloadURL(qrRef);

            await setDoc(doc(db, 'QR', pendingQrId), {
                eventId: pendingEventId,
                userId: user.uid,
                imageQR: downloadURL,
                QRId: pendingQrId,
                createdAt: serverTimestamp(),
            });

            setQrData(downloadURL);
            setPendingQrId(null);
            setPendingEventId(null);
        } catch (e) {
            console.error('Failed uploading QR to storage:', e);
        }
    }

    return (
        <div className="ce-root">
            <div className="halftone-bg"></div>
            <header className="ce-header">
                <h1 className="tbhx-header">CREATE <span className="text-glow">EVENT</span></h1>
            </header>

            <form className="ce-form" onSubmit={handleSubmit}>
                <label className="ce-field">
                    <span className="ce-label">EVENT NAME</span>
                    <input
                        className="ce-input"
                        placeholder="ENTER EVENT NAME"
                        value={form.eventName}
                        onChange={(e) => setForm({ ...form, eventName: e.target.value })}
                        required
                    />
                </label>

                <label className="ce-field">
                    <span className="ce-label">EVENT DATE</span>
                    <input
                        className="ce-input"
                        type="datetime-local"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        min={minDate}
                        required
                    />
                </label>

                <div className="ce-select-grid">
                    <label className="ce-field">
                        <span className="ce-label">UNIVERSITY</span>
                        <select
                            className="ce-select"
                            value={form.university}
                            onChange={(e) => {
                                setForm({ ...form, university: e.target.value, faculty: '' });
                            }}
                            required
                        >
                            <option value="" disabled hidden>SELECT UNIVERSITY</option>
                            {universities.map((uni) => (
                                <option key={uni.id} value={uni.id}>
                                    {uni.universityName || uni.id}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="ce-field">
                        <span className="ce-label">FACULTY</span>
                        <select
                            className="ce-select"
                            value={form.faculty}
                            onChange={(e) => setForm({ ...form, faculty: e.target.value })}
                            disabled={!form.university || form.university === 'Other'}
                            required={form.university !== 'Other'}
                        >
                            <option value="" disabled hidden>SELECT FACULTY</option>
                            {faculties.map((fac) => (
                                <option key={fac.id} value={fac.id}>
                                    {fac.facultyName || fac.id}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <label className="ce-field">
                    <span className="ce-label">ADDRESS</span>
                    <input className="ce-input" placeholder="LOCATION DETAILS" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
                </label>

                <label className="ce-field">
                    <span className="ce-label">CATEGORY</span>
                    <select
                        className="ce-select"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        required
                    >
                        <option value="" disabled hidden >SELECT CATEGORY</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.categoryName || cat.id}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="ce-field">
                    <span className="ce-label">DESCRIPTION</span>
                    <textarea
                        className="ce-textarea"
                        placeholder="EVENT MISSION AND DETAILS"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        required
                    />
                </label>

                <label className="ce-field">
                    <span className="ce-label">AFTER REGISTRATION MESSAGE</span>
                    <textarea
                        className="ce-textarea"
                        placeholder="WHATSAPP LINK, TELEGRAM, ETC."
                        value={form.afterRegistrationMessage}
                        onChange={(e) => setForm({ ...form, afterRegistrationMessage: e.target.value })}
                        required
                    />
                </label>

                <div className="ce-select-grid">
                    <label className="ce-field">
                        <span className="ce-label">MAX PARTICIPANTS</span>
                        <input
                            className="ce-input"
                            type="number"
                            placeholder="0"
                            value={form.numOfParticipants}
                            onChange={(e) => setForm({ ...form, numOfParticipants: e.target.value })}
                            required
                        />
                    </label>

                    <label className="ce-field">
                        <span className="ce-label">PRICE (RM)</span>
                        <input className="ce-input" placeholder="FREE OR AMOUNT" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                    </label>
                </div>

                <div className="ce-field">
                    <span className="ce-label">EVENT COVER IMAGE</span>
                    <label className="ce-image-placeholder">
                        {imagePreview ? (
                            <img src={imagePreview} alt="preview" className="ce-image-preview" />
                        ) : (
                            <div className="ce-image-icon">🖼️</div>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageChange} required />
                    </label>
                </div>

                <div className="ce-actions">
                    <button type="submit" className="tbhx-button ce-submit" disabled={submitting}>
                        {submitting ? 'UPLOADING...' : 'CREATE EVENT'}
                    </button>
                </div>
            </form>
            {pendingQrId && (
                <div className="ce-qr tbhx-card">
                    <h3 className="tbhx-header">INITIALIZING QR ACCESS</h3>
                    <QRCodeGenerator value={pendingQrId} size={300} onDataUrl={handleQrDataUrl} />
                </div>
            )}
        </div>
    );
}