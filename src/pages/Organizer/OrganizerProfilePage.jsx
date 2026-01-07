import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../components/AuthContext";

export default function OrganizerProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    phoneNumber: "",
    email: "",
    companyName: "",
    position: "",
    address: "",
  });

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
        const organizerInfo = data.organizer || {};

        setForm({
          name: data.name || "",
          age: data.age || "",
          gender: data.gender || "",
          phoneNumber: data.phoneNumber || "",
          email: data.email || "",
          companyName: organizerInfo.companyName || "",
          position: organizerInfo.position || "",
          address: organizerInfo.companyAddress || organizerInfo.address || "",
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
        // Email typically controlled by auth; keep read-only in UI
        "organizer.companyName": form.companyName,
        "organizer.position": form.position,
        "organizer.companyAddress": form.address,
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
    return <div className="organizer-page-root">You must be signed in to view this page.</div>;
  }

  if (loading) {
    return <div className="organizer-page-root">Loading profile...</div>;
  }

  return (
    <div className="organizer-page-root">
      <div className="organizer-header-section">
        <h1 className="tbhx-header">
          Organizer <span className="text-glow-org">Profile</span>
        </h1>
        <div className="header-accent"></div>
      </div>

      <div className="organizer-main">
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
              <h3 className="profile-section-title">Company Information</h3>

              <label className="profile-field">
                <span>Company Name</span>
                <input
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  required
                />
              </label>

              <div className="profile-row">
                <label className="profile-field">
                  <span>Position</span>
                  <input
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <label className="profile-field">
                <span>Office Address</span>
                <input
                  name="address"
                  value={form.address}
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


