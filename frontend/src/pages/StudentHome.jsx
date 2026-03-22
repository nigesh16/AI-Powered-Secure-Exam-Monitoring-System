import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { joinExam } from '../api';
import { FaUserCircle } from "react-icons/fa";

export default function StudentHome() {

  const [examId, setExamId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showProfile, setShowProfile] = useState(false);
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [updating, setUpdating] = useState(false);

  const { user, logout, updateUser } = useAuth();

  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {

      await joinExam(examId.trim(), password);

      navigate(`/student/exam/${examId.trim()}`);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleImageChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setProfilePic(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpdateProfile = async () => {

    try {

      setUpdating(true);

      const formData = new FormData();
      formData.append("username", username);

      if (profilePic) {
        formData.append("profilePic", profilePic);
      }

      const res = await fetch("http://localhost:5000/api/users/update-profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }

      alert("Profile updated successfully");

      if (data.user) {

        updateUser({
          username: data.user.username,
          profilePic: data.user.profilePic
        });

      }

      setPreview(null);
      setProfilePic(null);
      setShowProfile(false);

    } catch (err) {

      alert(err.message);

    } finally {

      setUpdating(false);

    }

  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900">

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 shadow-sm">

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <h1 className="text-lg sm:text-xl font-bold tracking-tight">
            Student Dashboard
          </h1>

          <div className="flex items-center gap-4">

            <span className="hidden sm:block text-sm font-medium text-slate-600">
              {user?.username}
            </span>

            {user?.profilePic ? (
              <img
                src={`http://localhost:5000${user.profilePic}`}
                className="w-9 h-9 rounded-full object-cover cursor-pointer border border-slate-200"
                onClick={() => {
                  setUsername(user.username);
                  setShowProfile(true);
                }}
                alt="profile"
              />
            ) : (
              <FaUserCircle
                className="text-3xl text-slate-600 cursor-pointer"
                onClick={() => {
                  setUsername(user?.username || "");
                  setShowProfile(true);
                }}
              />
            )}

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-100 transition"
            >
              Logout
            </button>

          </div>

        </div>

      </header>


      {/* PROFILE MODAL */}
      {showProfile && (

        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl">

            <h2 className="text-lg font-semibold mb-6 text-center">
              Update Profile
            </h2>

            <div className="flex flex-col items-center gap-4">

              {preview ? (

                <img
                  src={preview}
                  className="w-24 h-24 rounded-full object-cover"
                  alt="preview"
                />

              ) : user?.profilePic ? (

                <img
                  src={`http://localhost:5000${user.profilePic}`}
                  className="w-24 h-24 rounded-full object-cover"
                  alt="profile"
                />

              ) : (

                <FaUserCircle className="text-7xl text-slate-400" />

              )}

              <input
                type="file"
                onChange={handleImageChange}
                className="text-sm"
              />

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Username"
              />

              <div className="flex gap-3 w-full mt-2">

                <button
                  onClick={handleUpdateProfile}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  {updating ? "Updating..." : "Save"}
                </button>

                <button
                  onClick={() => setShowProfile(false)}
                  className="flex-1 bg-slate-200 py-2 rounded-lg font-medium hover:bg-slate-300 transition"
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* MAIN */}
      <main className="flex items-center justify-center px-6 py-20">

        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8">

          <h2 className="text-xl font-bold text-center mb-6">
            Join Exam
          </h2>

          <form onSubmit={handleJoin} className="space-y-5">

            <div>

              <label className="text-sm font-medium text-slate-600 block mb-1">
                Exam ID
              </label>

              <input
                type="text"
                value={examId}
                onChange={(e) => setExamId(e.target.value.toUpperCase())}
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="EXM-XXXXXX"
              />

            </div>

            <div>

              <label className="text-sm font-medium text-slate-600 block mb-1">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Exam password"
              />

            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? 'Joining...' : 'Join Exam'}
            </button>

          </form>

        </div>

      </main>

    </div>
  );
}