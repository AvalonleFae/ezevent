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
    const [imagePreviews, setImagePreviews] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [pendingQrId, setPendingQrId] = useState(null);
    const [pendingEventId, setPendingEventId] = useState(null);
    const [organizerStatus, setOrganizerStatus] = useState(null);
    const [loadingStatus, setLoadingStatus] = useState(true);

    // Data State
    const [universities, setUniversities] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [categories, setCategories] = useState([]);

    const [form, setForm] = useState({
        eventName: '',
        startDate: '',
        endDate: '',
        university: '',
        faculty: '',
        address: '',
        category: '',
        description: '',
        afterRegistrationMessage: '',
        price: '',
        numOfParticipants: ''
    });

    // --- 0. Check Organizer Verification Status ---
    useEffect(() => {
        const checkOrganizerStatus = async () => {
            try {
                const user = auth.currentUser;
                if (!user) {
                    setLoadingStatus(false);
                    return;
                }

                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const verifiedStatus = userData.organizer?.verified || userData.organizer?.status || 'Pending';
                    setOrganizerStatus(verifiedStatus);
                } else {
                    setOrganizerStatus('Pending');
                }
            } catch (error) {
                console.error("Error checking organizer status:", error);
                setOrganizerStatus('Pending');
            } finally {
                setLoadingStatus(false);
            }
        };
        checkOrganizerStatus();
    }, []);

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
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const newFiles = [...imageFiles, ...files];
        setImageFiles(newFiles);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    }

    function removeImage(index) {
        const newFiles = [...imageFiles];
        newFiles.splice(index, 1);
        setImageFiles(newFiles);

        const newPreviews = [...imagePreviews];
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);
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

        if (Number(form.numOfParticipants) <= 0) {
            alert('Max participants must be at least 1.');
            setSubmitting(false);
            return;
        }

        if (!form.startDate || !form.endDate) {
            alert('Please select both start and end dates.');
            setSubmitting(false);
            return;
        }

        const start = new Date(form.startDate);
        const end = new Date(form.endDate);
        const now = new Date();

        if (start < now) {
            alert('Start date cannot be in the past.');
            setSubmitting(false);
            return;
        }

        if (end <= start) {
            alert('End date must be after the start date.');
            setSubmitting(false);
            return;
        }

        try {
            const eventData = {
                eventName: form.eventName,
                date: new Date(form.startDate), // For backward compatibility
                startDate: new Date(form.startDate),
                endDate: new Date(form.endDate),
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

            const imageUrls = [];
            if (imageFiles.length > 0) {
                for (const file of imageFiles) {
                    const filename = `${Date.now()}_${file.name}`;
                    const imgRef = storageRef(storage, `events/${user.uid}/${filename}`);
                    await uploadBytes(imgRef, file);
                    const downloadURL = await getDownloadURL(imgRef);
                    imageUrls.push(downloadURL);
                }
                eventData.images = imageUrls;
                eventData.Image = imageUrls[0]; // Primary image for compatibility
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
                startDate: '',
                endDate: '',
                university: '',
                faculty: '',
                address: '',
                category: '',
                description: '',
                afterRegistrationMessage: '',
                price: '',
                numOfParticipants: ''
            });
            setImagePreviews([]);
            setImageFiles([]);
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

    // Show loading state while checking status
    if (loadingStatus) {
        return (
            <div className="ce-root">
                <div className="halftone-bg"></div>
                <div style={{ textAlign: 'center', padding: '3rem', color: 'white' }}>
                    <h2>Loading...</h2>
                </div>
            </div>
        );
    }

    // Show message if organizer status is Pending or Declined
    if (organizerStatus === 'Pending' || organizerStatus === 'Declined') {
        return (
            <div className="ce-root">
                <div className="halftone-bg"></div>
                <header className="ce-header">
                    <h1 className="tbhx-header">CREATE <span className="text-glow-org">EVENT</span></h1>
                </header>
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'white',
                    maxWidth: '600px',
                    margin: '2rem auto',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 64, 64, 0.3)',
                    borderRadius: '8px'
                }}>
                    <h2 style={{ color: 'var(--primary-red)', marginBottom: '1rem' }}>
                        {organizerStatus === 'Pending' ? 'Verification Pending' : 'Access Denied'}
                    </h2>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                        {organizerStatus === 'Pending'
                            ? 'Your organizer account is currently pending verification. Please wait for admin approval before creating events.'
                            : 'Your organizer account has been declined. Please contact the administrator for more information.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="ce-root">
            <div className="halftone-bg"></div>
            <header className="ce-header">
                <h1 className="tbhx-header-org">CREATE <span className="text-glow-org">EVENT</span></h1>
            </header>

            <div className="ce-form-wrap">
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

                    <div className="ce-select-grid">
                        <label className="ce-field">
                            <span className="ce-label">EVENT FROM</span>
                            <input
                                className="ce-input"
                                type="datetime-local"
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                min={minDate}
                                required
                            />
                        </label>

                        <label className="ce-field">
                            <span className="ce-label">EVENT UNTIL</span>
                            <input
                                className="ce-input"
                                type="datetime-local"
                                value={form.endDate}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                min={form.startDate || minDate}
                                required
                            />
                        </label>
                    </div>

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
                            placeholder="EVENT DESCRIPTION AND DETAILS"
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
                                min="1"
                                placeholder="1"
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
                        <span className="ce-label">EVENT IMAGES (SWIPE SUPPORTED)</span>
                        <div className="ce-images-grid">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="ce-image-preview-wrapper">
                                    <img src={preview} alt="preview" className="ce-image-preview" />
                                    <button type="button" className="ce-remove-img" onClick={() => removeImage(index)}>×</button>
                                </div>
                            ))}
                            <label className="ce-image-placeholder add-more">
                                <div className="ce-image-icon-small">+</div>
                                <input type="file" accept="image/*" onChange={handleImageChange} multiple />
                            </label>
                        </div>
                    </div>

                    <div className="ce-actions">
                        <button type="submit" className="tbhx-button ce-submit" disabled={submitting}>
                            {submitting ? 'UPLOADING...' : 'CREATE EVENT'}
                        </button>
                    </div>
                </form>
            </div>
            {pendingQrId && (
                <div className="ce-qr tbhx-card">
                    <h3 className="tbhx-header">INITIALIZING QR ACCESS</h3>
                    <QRCodeGenerator value={pendingQrId} size={300} onDataUrl={handleQrDataUrl} />
                </div>
            )}
        </div>
    );
}