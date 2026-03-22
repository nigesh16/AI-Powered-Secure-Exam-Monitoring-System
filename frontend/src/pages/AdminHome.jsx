import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getExams } from '../api';
import { FaUserCircle } from "react-icons/fa";

export default function AdminHome() {

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showProfile, setShowProfile] = useState(false);
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [currentProfilePic, setCurrentProfilePic] = useState(null);
  const [updating, setUpdating] = useState(false);

  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await getExams();
        if (mounted) setExams(data.exams || []);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    setUsername(user?.username || "");
    setCurrentProfilePic(user?.profilePic || null);

    return () => { mounted = false };
  }, [user]);

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

        setCurrentProfilePic(data.user.profilePic);

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

  const statusColor = {
    UPCOMING: 'bg-amber-100 text-amber-700',
    LIVE: 'bg-emerald-100 text-emerald-700',
    COMPLETED: 'bg-slate-200 text-slate-700',
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900">

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 shadow-sm">

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <h1 className="text-lg sm:text-xl font-bold tracking-tight">
            Admin Dashboard
          </h1>

          <div className="flex items-center gap-4">

            <span className="hidden sm:block text-sm font-medium text-slate-600">
              {username}
            </span>

            {currentProfilePic ? (
              <img
                src={`http://localhost:5000${currentProfilePic}`}
                className="w-9 h-9 rounded-full object-cover cursor-pointer border border-slate-200"
                onClick={() => setShowProfile(true)}
                alt="profile"
              />
            ) : (
              <FaUserCircle
                className="text-3xl text-slate-600 cursor-pointer hover:text-slate-800"
                onClick={() => setShowProfile(true)}
              />
            )}

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-100 transition"
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
                  alt="preview"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : currentProfilePic ? (
                <img
                  src={`http://localhost:5000${currentProfilePic}`}
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
      <main className="max-w-7xl mx-auto px-6 py-10">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">

          <h2 className="text-2xl font-semibold">
            Your Exams
          </h2>

          <Link
            to="/admin/exams/create"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Create Exam
          </Link>

        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-600 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : exams.length === 0 ? (

          <div className="bg-white rounded-2xl border border-slate-200 p-14 text-center text-slate-600">

            <p className="mb-4">No exams created yet.</p>

            <Link
              to="/admin/exams/create"
              className="text-blue-600 font-medium hover:underline"
            >
              Create your first exam
            </Link>

          </div>

        ) : (

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {exams.map((exam) => (

              <Link
                key={exam._id}
                to={`/admin/exams/${exam.examId}`}
                className="block bg-white rounded-2xl border border-slate-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all"
              >

                <h3 className="font-semibold text-lg text-slate-800 mb-2">
                  {exam.title}
                </h3>

                <p className="text-sm text-slate-500 mb-4">
                  ID: {exam.examId}
                </p>

                <div className="flex items-center justify-between">

                  <span className="text-sm text-slate-600">
                    {exam.students?.length || 0} students
                  </span>

                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      statusColor[exam.status] || 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {exam.status}
                  </span>

                </div>

              </Link>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}