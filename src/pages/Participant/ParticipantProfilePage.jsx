import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../components/AuthContext";

export default function ParticipantProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [universities, setUniversities] = useState([]);

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    phoneNumber: "",
    email: "",
    institution: "",
    matricNumber: "",
  });

  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const snap = await getDocs(collection(db, "universities"));
        const list = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() || {}),
        }));

        // Add "Other" option manually
        list.push({ id: 'Other', universityName: 'Other' });

        setUniversities(list);
      } catch (err) {
        console.error("Failed to load universities:", err);
      }
    };

    loadUniversities();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          setError("Profile not found.");
          return;
        }
        const data = snap.data();
        const participantInfo = data.participant || {};

        setForm({
          name: data.name || "",
          age: data.age || "",
          gender: data.gender || "",
          phoneNumber: data.phoneNumber || "",
          email: data.email || "",
          institution: participantInfo.institution || "",
          matricNumber: participantInfo.matricNumber || "",
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    setSuccess("");
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        name: form.name,
        age: form.age,
        gender: form.gender,
        phoneNumber: form.phoneNumber,
        "participant.institution": form.institution,
        "participant.matricNumber": form.matricNumber,
      });
      setSuccess("Profile updated successfully.");
      window.location.reload(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return <div className="participant-page-root">You must be signed in to view this page.</div>;
  }

  if (loading) {
    return <div className="participant-page-root">Loading profile...</div>;
  }

  return (
    <div className="participant-page-root">
      <div className="participant-header">
        <h1 className="tbhx-header">
          PROFILE <span className="text-glow">SETTINGS</span>
        </h1>
        <div className="header-accent"></div>
      </div>

      <div className="participant-main">
        <form className="profile-form" onSubmit={handleSubmit}>
          {error && <p className="profile-error">{error}</p>}
          {success && <p className="profile-success">{success}</p>}

          <div className="profile-grid">
            <div className="profile-section">
              <h3 className="profile-section-title">Personal Information</h3>

              <label className="profile-field">
                <span>Name</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <div className="profile-row">
                <label className="profile-field">
                  <span>Age</span>
                  <input
                    name="age"
                    type="number"
                    min="0"
                    value={form.age}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="profile-field">
                  <span>Gender</span>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </label>
              </div>

              <label className="profile-field">
                <span>Phone Number</span>
                <input
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="profile-field">
                <span>Email</span>
                <input
                  name="email"
                  value={form.email}
                  readOnly
                  disabled
                />
              </label>
            </div>

            <div className="profile-section">
              <h3 className="profile-section-title">Student Information</h3>

              <label className="profile-field">
                <span>Institution</span>
                <select
                  name="institution"
                  value={form.institution}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select University</option>
                  {universities.map((uni) => (
                    <option key={uni.id} value={uni.id}>
                      {uni.universityName || uni.id}
                    </option>
                  ))}
                </select>
              </label>

              <label className="profile-field">
                <span>Matric Number</span>
                <input
                  name="matricNumber"
                  value={form.matricNumber}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>
          </div>

          <div className="profile-actions">
            <button type="submit" className="tbhx-button" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


