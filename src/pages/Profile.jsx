import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { updateProfile, uploadAvatar, requestBusinessVerification } from "../services/profileService";
import { useToast } from "../components/common/ToastProvider";
import { isDemoMode } from "../data/demoData";
import "./Dashboard.css";

function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({ full_name: "", phone: "", company: "", avatar: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const toast = useToast();

  const [verifForm, setVerifForm] = useState({
    gst_number: "",
    pan_number: "",
    company_address: "",
    gst_certificate: null,
    pan_document: null,
  });
  const [verifSubmitting, setVerifSubmitting] = useState(false);
  const [verifError, setVerifError] = useState("");
  const [verifMessage, setVerifMessage] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (profile) {
        setForm({
          full_name: profile.full_name || "",
          phone: profile.phone || "",
          company: profile.company_name || "",
          avatar: null,
        });
        setAvatarPreview(profile.avatar_url || "");
        setLoadError("");
      } else if (user) {
        setLoadError("We could not load your profile details right now. Please try again.");
      }
      setLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [profile, user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");
    try {
      let avatarUrl = profile?.avatar_url || null;
      if (form.avatar) {
        avatarUrl = await uploadAvatar(form.avatar, user.id);
      }

      const payload = {
        full_name: form.full_name,
        phone: form.phone || null,
        company_name: form.company || null,
        avatar_url: avatarUrl,
      };

      await updateProfile(user.id, payload);
      await refreshProfile();
      setAvatarPreview(avatarUrl || profile?.avatar_url || "");
      window.dispatchEvent(new Event("profile:changed"));
      if (form.avatar) {
        toast.success("Avatar uploaded");
      }
      toast.success("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update profile.");
      toast.error("We could not update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, avatar: selectedFile }));

    if (selectedFile) {
      setAvatarPreview(URL.createObjectURL(selectedFile));
    } else {
      setAvatarPreview(profile?.avatar_url || "");
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const verificationStatus = profile?.verification_status;
    if (verificationStatus === "Pending" || verificationStatus === "Verified" || verificationStatus === "Rejected") {
      setVerifError("A verification request is already in progress or completed for this account.");
      return;
    }

    const documents = [verifForm.gst_certificate, verifForm.pan_document].filter(Boolean);
    if (!verifForm.gst_number.trim() || !verifForm.pan_number.trim() || !verifForm.company_address.trim() || documents.length < 2) {
      setVerifError("Please complete all fields and upload both the GST certificate and PAN document.");
      return;
    }

    setVerifSubmitting(true);
    setVerifError("");
    setVerifMessage("");
    try {
      await requestBusinessVerification(user.id, {
        gst_number: verifForm.gst_number,
        pan_number: verifForm.pan_number,
        company_address: verifForm.company_address,
        documents,
      });
      await refreshProfile();
      window.dispatchEvent(new Event("profile:changed"));
      setVerifMessage("Your business verification request has been submitted successfully.");
      setVerifForm({
        gst_number: "",
        pan_number: "",
        company_address: "",
        gst_certificate: null,
        pan_document: null,
      });
      toast.success("Verification request submitted");
    } catch (err) {
      console.error(err);
      setVerifError(err.message || "We could not submit your verification request. Please try again.");
      toast.error(err.message || "We could not submit your verification request. Please try again.");
    } finally {
      setVerifSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="content-card">
        <div style={{display:"flex",gap:20}}>
          <div className="skeleton" style={{width:120,height:120,borderRadius:8,flexShrink:0}} />
          <div style={{flex:1,display:"grid",gap:12}}>
            <div className="skeleton" style={{height:24,width:"40%",borderRadius:6}} />
            <div className="skeleton" style={{height:14,width:"60%",borderRadius:6}} />
            <div className="skeleton" style={{height:14,width:"80%",borderRadius:6}} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="content-card">
        <div style={{padding:"var(--sp-6)",color:"var(--text-muted)"}}>Please log in to manage your profile.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Profile</h1>
            <p>Manage your personal and company information</p>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card__header">
          <div>
            <div className="content-card__title">Your Profile</div>
            <div className="content-card__sub">Update details shown across the dashboard</div>
          </div>
        </div>

        <form onSubmit={handleSave} style={{display:"grid",gridTemplateColumns:"130px 1fr",gap:28,alignItems:"start"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                overflow: "hidden",
                background: "linear-gradient(135deg, rgba(2, 96, 198, 0.25) 0%, rgba(56, 189, 248, 0.15) 100%)",
                border: "2px solid rgba(56, 189, 248, 0.4)",
                boxShadow: "0 0 18px rgba(56, 189, 248, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt={`${profile?.full_name || "User"}'s profile photo`} style={{width:"100%",height:"100%",objectFit:"cover"}} />
              ) : (
                <div style={{fontSize:32,fontWeight:800,color:"#FFFFFF"}}>{(profile?.full_name||"?")[0]}</div>
              )}
            </div>

            <div style={{width:"100%",textAlign:"center"}}>
              <label
                htmlFor="avatar-file-input"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#E2E8F0",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.14)",
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  width: "100%",
                  boxSizing: "border-box",
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255, 87, 34, 0.15)"; e.currentTarget.style.borderColor = "#FF5722"; e.currentTarget.style.color = "#FF5722"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)"; e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.14)"; e.currentTarget.style.color = "#E2E8F0"; }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <span>{form.avatar ? "Change" : "Upload"}</span>
              </label>
              <input
                id="avatar-file-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
              <div style={{fontSize:10.5,color:"#64748B",marginTop:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {form.avatar ? form.avatar.name : "JPG or PNG"}
              </div>
            </div>
          </div>

          <div>
            {error && <div className="auth-error" style={{marginBottom:12}}>{error}</div>}
            {loadError && <div className="auth-error" style={{marginBottom:12}}>{loadError}</div>}
            <div style={{display:"grid",gap:12}}>
              <div className="auth-field">
                <label className="input-label">Full name</label>
                <input className="input" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required />
              </div>

              <div className="auth-field">
                <label className="input-label">{isDemoMode() ? "Account / Username" : "Email"}</label>
                <input className="input" value={isDemoMode() ? "demo" : (profile?.email || "")} disabled />
              </div>

              <div className="auth-field">
                <label className="input-label">Phone</label>
                <input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>

              <div className="auth-field">
                <label className="input-label">Company</label>
                <input className="input" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
              </div>

              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
                <div style={{marginLeft:"auto",color:"var(--text-muted)",display:'flex',flexDirection:'column',gap:6,alignItems:'flex-end'}}>
                  <div><strong>Account:</strong> {profile?.role}</div>
                  <div><strong>Verification:</strong> {profile?.verification_status || 'Not Verified'}</div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {profile?.role === 'business' && (
        <div className="content-card" style={{marginTop:"var(--sp-5)"}}>
          <div className="content-card__header">
            <div>
              <div className="content-card__title">Business Verification</div>
              <div className="content-card__sub">Submit your GST and PAN details for verification</div>
            </div>
            {profile?.verification_status && (
              <span className={`status-badge ${profile.verification_status === 'Verified' ? 'status-badge--verified' : profile.verification_status === 'Pending' ? 'status-badge--pending' : profile.verification_status === 'Rejected' ? 'status-badge--failed' : ''}`}>
                {profile.verification_status}
              </span>
            )}
          </div>

          {profile?.verification_status === 'Pending' ? (
            <div style={{color:"var(--text-muted)",paddingBottom:8}}>Your verification request is currently under review.</div>
          ) : profile?.verification_status === 'Verified' ? (
            <div style={{color:"var(--text-muted)",paddingBottom:8}}>Your business account has already been verified.</div>
          ) : profile?.verification_status === 'Rejected' ? (
            <div style={{color:"var(--text-muted)",paddingBottom:8}}>Your last verification request was rejected. Please contact support for next steps.</div>
          ) : (
            <form onSubmit={handleVerificationSubmit}>
              <div style={{display:'grid',gap:12}}>
                {verifError && <div className="auth-error">{verifError}</div>}
                {verifMessage && <div style={{padding:"10px 12px",borderRadius:8,background:"var(--green-light)",color:"var(--green)"}}>{verifMessage}</div>}
                <div className="auth-field">
                  <label className="input-label">GST Number</label>
                  <input className="input" value={verifForm.gst_number} onChange={e => setVerifForm({...verifForm, gst_number: e.target.value})} placeholder="GSTIN" />
                </div>
                <div className="auth-field">
                  <label className="input-label">PAN Number</label>
                  <input className="input" value={verifForm.pan_number} onChange={e => setVerifForm({...verifForm, pan_number: e.target.value})} placeholder="PAN" />
                </div>
                <div className="auth-field">
                  <label className="input-label">Company Address</label>
                  <textarea className="input" rows={3} value={verifForm.company_address} onChange={e => setVerifForm({...verifForm, company_address: e.target.value})} />
                </div>
                <div className="auth-field">
                  <label className="input-label">Upload GST Certificate</label>
                  <input type="file" accept="image/*,.pdf" onChange={e => setVerifForm({...verifForm, gst_certificate: e.target.files?.[0] || null})} />
                </div>
                <div className="auth-field">
                  <label className="input-label">Upload PAN Document</label>
                  <input type="file" accept="image/*,.pdf" onChange={e => setVerifForm({...verifForm, pan_document: e.target.files?.[0] || null})} />
                </div>
                <div style={{display:'flex',gap:12,alignItems:'center'}}>
                  <button className="btn btn-primary" type="submit" disabled={verifSubmitting}>{verifSubmitting ? 'Submitting...' : 'Submit for Verification'}</button>
                  <span style={{fontSize:12,color:"var(--text-muted)"}}>{verifSubmitting ? "Uploading and saving your documents..." : "Your details will be sent for review."}</span>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;
