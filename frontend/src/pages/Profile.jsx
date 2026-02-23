import { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile = () => {
  const { token, backendUrl, navigate } = useContext(ShopContext);
  const [user, setUser] = useState({ name: '', email: '', profileImage: '' });
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', profession: '', bio: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [orders, setOrders] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchOrders();
  }, [token, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/user/profile`, {}, { headers: { token } });
      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        const nameParts = userData.name.split(' ');
        setFormData({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: userData.email,
          profession: userData.profession || '',
          bio: userData.bio || ''
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders with token:', token);
      console.log('Backend URL:', backendUrl);
      const response = await axios.post(`${backendUrl}/api/order/userorders`, {}, { headers: { token } });
      console.log('Orders response:', response.data);
      if (response.data.success) {
        console.log('Orders found:', response.data.orders);
        setOrders(response.data.orders);
      } else {
        console.log('No orders or error:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const response = await axios.post(`${backendUrl}/api/user/upload-profile-image`, formDataUpload, { headers: { token } });
      if (response.data.success) {
        toast.success('Profile image updated!');
        setUser({ ...user, profileImage: response.data.profileImage });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const response = await axios.post(`${backendUrl}/api/user/update-profile`, 
        { name: fullName, email: formData.email, profession: formData.profession, bio: formData.bio }, 
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Profile updated successfully');
        fetchProfile();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwords.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      const response = await axios.post(`${backendUrl}/api/user/change-password`,
        { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Password changed successfully');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      {/* Breadcrumb */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black">Profile</h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li><a className="font-medium" href="/">Dashboard /</a></li>
            <li className="font-medium text-primary">Profile</li>
          </ol>
        </nav>
      </div>

      <div className="grid grid-cols-5 gap-8">
        {/* Profile Card */}
        <div className="col-span-5 xl:col-span-3">
          <div className="rounded-sm border border-stroke bg-white shadow-default">
            <div className="border-b border-stroke py-4 px-7">
              <h3 className="font-medium text-black">Personal Information</h3>
            </div>
            <div className="p-7">
              <form onSubmit={handleUpdateProfile}>
                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black" htmlFor="firstName">First Name</label>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none"
                      type="text"
                      name="firstName"
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="w-full sm:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black" htmlFor="lastName">Last Name</label>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none"
                      type="text"
                      name="lastName"
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mb-5.5">
                  <label className="mb-3 block text-sm font-medium text-black" htmlFor="emailAddress">Email Address</label>
                  <div className="relative">
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none"
                      type="email"
                      name="emailAddress"
                      id="emailAddress"
                      placeholder="[email protected]"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mb-5.5">
                  <label className="mb-3 block text-sm font-medium text-black" htmlFor="phoneNumber">Phone Number</label>
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none"
                    type="text"
                    name="phoneNumber"
                    id="phoneNumber"
                    placeholder="+990 3343 7865"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="mb-5.5">
                  <label className="mb-3 block text-sm font-medium text-black" htmlFor="bio">Bio</label>
                  <textarea
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none"
                    name="bio"
                    id="bio"
                    rows={6}
                    placeholder="Write your bio here"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  ></textarea>
                </div>

                <div className="flex justify-end gap-4.5">
                  <button
                    className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1"
                    type="button"
                    onClick={() => navigate('/')}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                    type="submit"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Photo & Password */}
        <div className="col-span-5 xl:col-span-2">
          {/* Photo Upload */}
          <div className="rounded-sm border border-stroke bg-white shadow-default">
            <div className="border-b border-stroke py-4 px-7">
              <h3 className="font-medium text-black">Your Photo</h3>
            </div>
            <div className="p-7">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-14 w-14 rounded-full overflow-hidden">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="User" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-600">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                    </div>
                  )}
                </div>
                <div>
                  <span className="mb-1.5 text-black">Edit your photo</span>
                  <span className="flex gap-2.5">
                    <label htmlFor="profile-upload" className="text-sm hover:text-primary cursor-pointer">
                      {uploadingImage ? 'Uploading...' : 'Update'}
                      <input
                        type="file"
                        id="profile-upload"
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="rounded-sm border border-stroke bg-white shadow-default mt-7.5">
            <div className="border-b border-stroke py-4 px-7">
              <h3 className="font-medium text-black">Change Password</h3>
            </div>
            <div className="p-7">
              <form onSubmit={handleChangePassword}>
                <div className="mb-5.5">
                  <label className="mb-3 block text-sm font-medium text-black" htmlFor="currentPassword">Current Password</label>
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none"
                    type="password"
                    name="currentPassword"
                    id="currentPassword"
                    placeholder="Enter current password"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-5.5">
                  <label className="mb-3 block text-sm font-medium text-black" htmlFor="newPassword">New Password</label>
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none"
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    placeholder="Enter new password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    required
                    minLength={8}
                  />
                </div>

                <div className="mb-5.5">
                  <label className="mb-3 block text-sm font-medium text-black" htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none"
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder="Confirm new password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="flex justify-end gap-4.5">
                  <button
                    className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                    type="submit"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="mt-7.5">
        <div className="rounded-sm border border-stroke bg-white shadow-default">
          <div className="border-b border-stroke py-4 px-7">
            <h3 className="font-medium text-black">My Orders</h3>
          </div>
          <div className="p-7">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No orders yet</p>
                <button
                  onClick={() => navigate('/collection')}
                  className="inline-flex items-center justify-center rounded-md bg-primary py-3 px-10 text-center font-medium text-white hover:bg-opacity-90"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-2 text-left">
                      <th className="min-w-[220px] py-4 px-4 font-medium text-black">Order ID</th>
                      <th className="min-w-[150px] py-4 px-4 font-medium text-black">Date</th>
                      <th className="min-w-[120px] py-4 px-4 font-medium text-black">Amount</th>
                      <th className="min-w-[120px] py-4 px-4 font-medium text-black">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td className="border-b border-[#eee] py-5 px-4">
                          <p className="text-black">#{order._id.slice(-8).toUpperCase()}</p>
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4">
                          <p className="text-black">{new Date(order.date).toLocaleDateString()}</p>
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4">
                          <p className="text-black font-medium">${order.amount}</p>
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4">
                          <p className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                            order.status === 'Delivered' ? 'bg-success text-success' :
                            order.status === 'Shipped' ? 'bg-warning text-warning' :
                            'bg-danger text-danger'
                          }`}>
                            {order.status}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
