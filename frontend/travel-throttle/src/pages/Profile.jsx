/**
 * PROFILE PAGE
 * Enhanced user profile with verification, stats, activity, and settings
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { rideService } from '../services/rideService';
import { bikeService } from '../services/bikeService';
import { cn, formatDate, formatCurrency } from '../utils/helpers';
import { Card, Button, Input, Avatar, Badge, Modal } from '../components/common';
import { RideCard } from '../components/features';
import { 
  FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX, FiTool, FiStar,
  FiMapPin, FiCalendar, FiTrendingUp, FiDollarSign, FiUsers as FiUsersIcon,
  FiShield, FiCheckCircle, FiUpload, FiCamera, FiTrash2, 
  FiLogOut, FiLock, FiBell, FiGlobe, FiDownload, FiSettings,
  FiAlertCircle, FiCheck, FiCopy, FiShare2, FiEye, FiImage,
  FiChevronRight, FiMoon, FiHelpCircle, FiInfo, FiCreditCard,
  FiUserCheck, FiSmartphone, FiMail as FiMailIcon, FiKey
} from 'react-icons/fi';
import { FaMotorcycle, FaIdCard, FaUserShield } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';

export const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalRides: 0, totalDistance: 0, totalSaved: 0,
    createdRides: 0, joinedRides: 0, bikesOwned: 0,
    reviewsReceived: 0, averageRating: 0, memberSince: null,
    verificationStatus: 'unverified'
  });
  const [recentRides, setRecentRides] = useState([]);
  const [userBikes, setUserBikes] = useState([]);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', bio: '', address: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  // Verification State
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationStep, setVerificationStep] = useState(1);
  const [verificationData, setVerificationData] = useState({
    idType: 'aadhar',
    idNumber: '',
    documentFront: null,
    documentFrontPreview: null,
    documentBack: null,
    documentBackPreview: null,
    selfie: null,
    selfiePreview: null
  });
  
  // Settings Modals
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const fileInputRef = useRef(null);
  const frontDocRef = useRef(null);
  const backDocRef = useRef(null);
  const selfieRef = useRef(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

const fetchProfileData = async () => {
  setLoading(true);
  setErrorMessage('');
  
  try {
    console.log('=== FETCH PROFILE DATA ===');
    
    // Fetch user profile
    const profileRes = await userService.getCurrentUser();
    console.log('Profile response:', profileRes);
    
    if (profileRes.success && profileRes.data) {
      const userData = profileRes.data;
      console.log('User data loaded:', userData);
      
      setProfile(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        bio: userData.bio || '',
        address: userData.address || ''
      });
      
      setStats(prev => ({
        ...prev,
        totalRides: userData.totalRides || 0,
        totalDistance: userData.totalDistance || 0,
        totalSaved: userData.totalSaved || 0,
        averageRating: userData.rating || 0,
        memberSince: userData.createdAt,
        verificationStatus: userData.verified ? 'verified' : 'unverified',
        reviewsReceived: userData.reviewCount || 0,
        bikesOwned: userData.bikeCount || 0
      }));
    } else {
      console.error('Failed to load profile:', profileRes.error);
      setErrorMessage('Failed to load profile data');
    }

    // Fetch user's rides
    try {
      const ridesRes = await rideService.getMyRides();
      console.log('Rides response:', ridesRes);
      
      if (ridesRes.success) {
        const rides = ridesRes.data || [];
        const created = rides.filter(r => r.isOwner || r.owner?.id === user?.id);
        const joined = rides.filter(r => !r.isOwner && r.owner?.id !== user?.id);
        
        setStats(prev => ({ 
          ...prev, 
          createdRides: created.length, 
          joinedRides: joined.length 
        }));
        setRecentRides(rides.slice(0, 5));
      }
    } catch (rideError) {
      console.error('Failed to fetch rides:', rideError);
    }

    // Fetch user's bikes
    try {
      const bikesRes = await bikeService.getMyBikes();
      console.log('Bikes response:', bikesRes);
      
      if (bikesRes.success) {
        const bikes = bikesRes.data || [];
        setUserBikes(bikes);
        setStats(prev => ({ ...prev, bikesOwned: bikes.length }));
      }
    } catch (bikeError) {
      console.error('Failed to fetch bikes:', bikeError);
    }
    
  } catch (error) {
    console.error('Error fetching profile:', error);
    setErrorMessage('Failed to load profile data');
  } finally {
    setLoading(false);
  }
};

  const handleSaveProfile = async () => {
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const response = await userService.updateProfile(formData);
      if (response.success) {
        setProfile(response.data);
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.error || 'Failed to update profile');
      }
    } catch (error) {
      setErrorMessage('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    
    setSubmitting(true);
    try {
      const response = await userService.uploadAvatar(avatarFile);
      if (response.success) {
        setProfile(response.data);
        setAvatarFile(null);
        setAvatarPreview(null);
        setSuccessMessage('Avatar updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.error || 'Failed to upload avatar');
      }
    } catch (error) {
      setErrorMessage('Failed to upload avatar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm('Remove profile picture?')) return;
    
    setSubmitting(true);
    try {
      const response = await userService.deleteAvatar();
      if (response.success) {
        setProfile(prev => ({ ...prev, avatar: null }));
        setSuccessMessage('Avatar removed successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.error || 'Failed to remove avatar');
      }
    } catch (error) {
      setErrorMessage('Failed to remove avatar');
    } finally {
      setSubmitting(false);
    }
  };

  // Document Upload Handlers
  const handleDocumentUpload = (type, file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'front') {
        setVerificationData(prev => ({
          ...prev,
          documentFront: file,
          documentFrontPreview: reader.result
        }));
      } else if (type === 'back') {
        setVerificationData(prev => ({
          ...prev,
          documentBack: file,
          documentBackPreview: reader.result
        }));
      } else if (type === 'selfie') {
        setVerificationData(prev => ({
          ...prev,
          selfie: file,
          selfiePreview: reader.result
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVerificationSubmit = async () => {
    if (verificationStep === 1) {
      if (!verificationData.idNumber) {
        setErrorMessage('Please enter your ID number');
        return;
      }
      setVerificationStep(2);
      return;
    }
    
    if (verificationStep === 2) {
      if (!verificationData.documentFront || !verificationData.documentBack) {
        setErrorMessage('Please upload both front and back of your ID');
        return;
      }
      setVerificationStep(3);
      return;
    }
    
    setSubmitting(true);
    setErrorMessage('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowVerificationModal(false);
      setVerificationStep(1);
      setVerificationData({
        idType: 'aadhar', idNumber: '',
        documentFront: null, documentFrontPreview: null,
        documentBack: null, documentBackPreview: null,
        selfie: null, selfiePreview: null
      });
      setSuccessMessage('Verification request submitted! We will review your documents within 24-48 hours.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setErrorMessage('Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await userService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (response.success) {
        setShowChangePasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setSuccessMessage('Password changed successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.error || 'Failed to change password');
      }
    } catch (error) {
      setErrorMessage('Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCopyProfileLink = () => {
    const url = `${window.location.origin}/profile/${user?.id}`;
    navigator.clipboard?.writeText(url).then(() => {
      setSuccessMessage('Profile link copied!');
      setTimeout(() => setSuccessMessage(''), 2000);
    });
  };

  const StatCard = ({ icon: Icon, label, value, color = 'primary' }) => (
    <div className="bg-gradient-to-br from-dark-bg to-dark-bg/50 rounded-xl p-4 text-center border border-dark-border hover:border-primary/30 transition-all">
      <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-${color}/20 flex items-center justify-center`}>
        <Icon className={`w-5 h-5 text-${color}`} />
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );

  const SettingItem = ({ icon: Icon, title, description, onClick, variant = 'default' }) => (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left',
        variant === 'danger' 
          ? 'hover:bg-error/10 text-error' 
          : 'hover:bg-dark-bg/50 text-gray-300 hover:text-white'
      )}
    >
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center',
        variant === 'danger' ? 'bg-error/20' : 'bg-primary/20'
      )}>
        <Icon className={cn('w-5 h-5', variant === 'danger' ? 'text-error' : 'text-primary')} />
      </div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <FiChevronRight className="w-5 h-5 text-gray-500" />
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-4 bg-success/10 border border-success/30 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <FiCheckCircle className="w-5 h-5 text-success" />
          <p className="text-success">{successMessage}</p>
        </div>
      )}
      
      {errorMessage && (
        <div className="p-4 bg-error/10 border border-error/30 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <FiAlertCircle className="w-5 h-5 text-error" />
          <p className="text-error">{errorMessage}</p>
        </div>
      )}

      {/* Profile Header Card */}
      <Card className="overflow-hidden">
        {/* Cover Image Area */}
        <div className="h-24 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 -mx-6 -mt-6 mb-4" />
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar Section */}
          <div className="relative -mt-12">
            <Avatar 
              src={avatarPreview || profile?.avatar} 
              name={profile?.name} 
              size="3xl" 
              className="w-28 h-28 text-2xl ring-4 ring-dark-card"
            />
            {isEditing && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors shadow-lg"
                  title="Upload new photo"
                >
                  <FiUpload className="w-4 h-4" />
                </button>
                {profile?.avatar && (
                  <button
                    onClick={handleDeleteAvatar}
                    className="p-2 bg-error text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    title="Remove photo"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{profile?.name}</h1>
              {profile?.verified ? (
                <Badge variant="success" className="flex items-center gap-1">
                  <MdVerified className="w-3 h-3" /> Verified
                </Badge>
              ) : (
                <Badge variant="warning">Unverified</Badge>
              )}
            </div>
            <p className="text-gray-400 mb-2">{profile?.email} • {profile?.phone}</p>
            {profile?.bio && <p className="text-gray-300 text-sm mb-2">{profile.bio}</p>}
            {profile?.address && (
              <p className="text-gray-400 text-xs mb-2"><FiMapPin className="inline w-3 h-3 mr-1" />{profile.address}</p>
            )}
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <FiStar key={i} className={`w-4 h-4 ${i <= stats.averageRating ? 'text-yellow-500 fill-current' : 'text-gray-600'}`} />
                ))}
              </div>
              <span className="text-white font-semibold">{stats.averageRating.toFixed(1)}</span>
              <span className="text-gray-400 text-sm">({stats.reviewsReceived} reviews)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 min-w-[140px]">
            {!isEditing ? (
              <>
                <Button variant="outline" leftIcon={<FiEdit2 />} onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
                <Button variant="ghost" leftIcon={<FiShare2 />} onClick={handleCopyProfileLink}>
                  Share
                </Button>
                {!profile?.verified && (
                  <Button variant="primary" leftIcon={<FiShield />} onClick={() => setShowVerificationModal(true)}>
                    Get Verified
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="primary" leftIcon={<FiSave />} loading={submitting} onClick={handleSaveProfile}>
                  Save
                </Button>
                <Button variant="ghost" leftIcon={<FiX />} onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Avatar Upload Preview */}
        {avatarPreview && (
          <div className="mt-4 p-3 bg-dark-bg/50 rounded-xl flex items-center justify-between border border-dashed border-primary/30">
            <div className="flex items-center gap-3">
              <img src={avatarPreview} alt="Preview" className="w-10 h-10 rounded-full object-cover" />
              <span className="text-sm text-gray-300">New profile picture ready</span>
            </div>
            <Button size="sm" variant="primary" loading={submitting} onClick={handleAvatarUpload}>
              Upload
            </Button>
          </div>
        )}
      </Card>

      {/* Edit Form */}
      {isEditing && (
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Edit Profile Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="name" label="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} leftIcon={<FiUser />} />
            <Input name="email" label="Email Address" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} leftIcon={<FiMail />} disabled />
            <Input name="phone" label="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} leftIcon={<FiPhone />} />
            <Input name="address" label="Address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} leftIcon={<FiMapPin />} />
          </div>
          <Input name="bio" type="textarea" label="Bio" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} rows={3} className="mt-4" placeholder="Tell us about yourself..." />
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard icon={FaMotorcycle} label="Total Rides" value={stats.totalRides} color="primary" />
        <StatCard icon={FiTrendingUp} label="Distance" value={`${stats.totalDistance} km`} color="secondary" />
        <StatCard icon={FiDollarSign} label="Saved" value={formatCurrency.compact(stats.totalSaved)} color="accent" />
        <StatCard icon={FiUsersIcon} label="Created" value={stats.createdRides} color="primary" />
        <StatCard icon={FiUser} label="Joined" value={stats.joinedRides} color="secondary" />
        <StatCard icon={FaMotorcycle} label="Bikes" value={stats.bikesOwned} color="accent" />
        <StatCard icon={FiStar} label="Reviews" value={stats.reviewsReceived} color="warning" />
        <StatCard icon={FiCalendar} label="Member" value={formatDate.short(stats.memberSince)} color="info" />
      </div>

      {/* Tabs */}
      <Card>
        <div className="flex gap-1 border-b border-dark-border pb-2 mb-4">
          {[
            { id: 'overview', label: 'Overview', icon: FiEye },
            { id: 'rides', label: 'Rides', icon: FaMotorcycle },
            { id: 'garage', label: 'Garage', icon: FiTool },
            { id: 'settings', label: 'Settings', icon: FiSettings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm',
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-dark-bg'
              )}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h4 className="text-white font-medium flex items-center gap-2">
              <FiEye className="w-4 h-4 text-primary" />
              Recent Activity
            </h4>
            {recentRides.length > 0 ? (
              <div className="space-y-3">
                {recentRides.slice(0, 3).map(ride => <RideCard key={ride.id} ride={ride} variant="compact" />)}
              </div>
            ) : (
              <div className="text-center py-8 bg-dark-bg/30 rounded-xl">
                <FaMotorcycle className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400">No recent activity</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'rides' && (
          <div className="space-y-4">
            <div className="flex gap-4 mb-4">
              <Badge variant="primary" className="gap-1"><FaMotorcycle /> Created: {stats.createdRides}</Badge>
              <Badge variant="secondary" className="gap-1"><FiUser /> Joined: {stats.joinedRides}</Badge>
            </div>
            {recentRides.length > 0 ? (
              <div className="space-y-3">
                {recentRides.map(ride => <RideCard key={ride.id} ride={ride} variant="compact" />)}
              </div>
            ) : (
              <div className="text-center py-8 bg-dark-bg/30 rounded-xl">
                <FaMotorcycle className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400">No rides yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'garage' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium flex items-center gap-2">
                <FiTool className="w-4 h-4 text-primary" />
                My Bikes ({userBikes.length})
              </h4>
              <Button size="sm" variant="primary" leftIcon={<FaMotorcycle />} onClick={() => navigate('/garage')}>
                Manage Garage
              </Button>
            </div>
            {userBikes.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {userBikes.map(bike => (
                  <div key={bike.id} className="p-4 bg-gradient-to-r from-dark-bg/50 to-dark-bg/30 rounded-xl border border-dark-border hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <FaMotorcycle className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{bike.model}</p>
                        <p className="text-sm text-gray-400">{bike.registrationNumber} • {bike.color}</p>
                      </div>
                      <Badge variant={bike.verified ? 'success' : 'warning'} className="gap-1">
                        {bike.verified ? <><FiCheckCircle className="w-3 h-3" /> Verified</> : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-dark-bg/30 rounded-xl">
                <FaMotorcycle className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 mb-3">No bikes in your garage</p>
                <Button size="sm" variant="primary" onClick={() => navigate('/garage')}>
                  Add Your First Bike
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-2">
            <SettingItem icon={FiLock} title="Change Password" description="Update your account password" onClick={() => setShowChangePasswordModal(true)} />
            <SettingItem icon={FiBell} title="Notification Preferences" description="Manage how you receive notifications" onClick={() => setShowNotificationModal(true)} />
            <SettingItem icon={FiGlobe} title="Privacy Settings" description="Control your privacy and visibility" onClick={() => {}} />
            <SettingItem icon={FiMoon} title="Appearance" description="Choose between light and dark mode" onClick={() => {}} />
            <SettingItem icon={FiHelpCircle} title="Help & Support" description="Get help or contact support" onClick={() => {}} />
            <SettingItem icon={FiInfo} title="About" description="App version and information" onClick={() => {}} />
            <div className="pt-4 mt-4 border-t border-dark-border">
              <SettingItem icon={FiLogOut} title="Sign Out" description="Log out of your account" onClick={() => setShowLogoutModal(true)} variant="danger" />
            </div>
          </div>
        )}
      </Card>

      {/* Verification Modal */}
      <Modal isOpen={showVerificationModal} onClose={() => {
        setShowVerificationModal(false);
        setVerificationStep(1);
        setVerificationData({
          idType: 'aadhar', idNumber: '',
          documentFront: null, documentFrontPreview: null,
          documentBack: null, documentBackPreview: null,
          selfie: null, selfiePreview: null
        });
      }} title="Get Verified" size="lg">
        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[
              { step: 1, label: 'ID Details', icon: FaIdCard },
              { step: 2, label: 'Documents', icon: FiUpload },
              { step: 3, label: 'Selfie', icon: FiCamera }
            ].map((item, idx) => (
              <div key={item.step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                    verificationStep >= item.step 
                      ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                      : 'bg-dark-border text-gray-400'
                  )}>
                    {verificationStep > item.step ? <FiCheck className="w-5 h-5" /> : <item.icon className="w-5 h-5" />}
                  </div>
                  <span className={cn('text-xs mt-1', verificationStep >= item.step ? 'text-white' : 'text-gray-500')}>
                    {item.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={cn('w-16 h-0.5 mx-2', verificationStep > item.step ? 'bg-primary' : 'bg-dark-border')} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: ID Details */}
          {verificationStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h4 className="text-white font-medium">Select ID Type</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'aadhar', label: 'Aadhar Card', icon: FaIdCard },
                  { id: 'driving-license', label: 'Driving License', icon: FaIdCard },
                  { id: 'passport', label: 'Passport', icon: FaIdCard },
                  { id: 'voter-id', label: 'Voter ID', icon: FaIdCard }
                ].map(type => (
                  <label
                    key={type.id}
                    className={cn(
                      'p-4 border-2 rounded-xl cursor-pointer transition-all',
                      verificationData.idType === type.id 
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10' 
                        : 'border-dark-border hover:border-gray-500'
                    )}
                  >
                    <input type="radio" name="idType" value={type.id} checked={verificationData.idType === type.id} onChange={(e) => setVerificationData({...verificationData, idType: e.target.value})} className="hidden" />
                    <type.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-white text-center text-sm">{type.label}</p>
                  </label>
                ))}
              </div>
              <Input 
                name="idNumber" 
                label="ID Number" 
                placeholder="Enter your ID number"
                value={verificationData.idNumber} 
                onChange={(e) => setVerificationData({...verificationData, idNumber: e.target.value})}
                leftIcon={<FaIdCard />}
              />
            </div>
          )}

          {/* Step 2: Upload Documents */}
          {verificationStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h4 className="text-white font-medium">Upload ID Documents</h4>
              <div className="grid grid-cols-2 gap-4">
                {/* Front Document */}
                <div>
                  <p className="text-sm text-gray-400 mb-2">Front of ID</p>
                  <input
                    ref={frontDocRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleDocumentUpload('front', e.target.files[0])}
                    className="hidden"
                  />
                  <div
                    onClick={() => frontDocRef.current?.click()}
                    className={cn(
                      'aspect-[4/3] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all',
                      verificationData.documentFrontPreview 
                        ? 'border-success bg-success/5' 
                        : 'border-dark-border hover:border-primary hover:bg-primary/5'
                    )}
                  >
                    {verificationData.documentFrontPreview ? (
                      <img src={verificationData.documentFrontPreview} alt="Front" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <>
                        <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-400">Click to upload</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Back Document */}
                <div>
                  <p className="text-sm text-gray-400 mb-2">Back of ID</p>
                  <input
                    ref={backDocRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleDocumentUpload('back', e.target.files[0])}
                    className="hidden"
                  />
                  <div
                    onClick={() => backDocRef.current?.click()}
                    className={cn(
                      'aspect-[4/3] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all',
                      verificationData.documentBackPreview 
                        ? 'border-success bg-success/5' 
                        : 'border-dark-border hover:border-primary hover:bg-primary/5'
                    )}
                  >
                    {verificationData.documentBackPreview ? (
                      <img src={verificationData.documentBackPreview} alt="Back" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <>
                        <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-400">Click to upload</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500">Please upload clear, readable images of your ID document</p>
            </div>
          )}

          {/* Step 3: Selfie */}
          {verificationStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h4 className="text-white font-medium">Take a Selfie</h4>
              <input
                ref={selfieRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={(e) => handleDocumentUpload('selfie', e.target.files[0])}
                className="hidden"
              />
              <div
                onClick={() => selfieRef.current?.click()}
                className={cn(
                  'aspect-square max-w-[250px] mx-auto border-2 border-dashed rounded-full flex flex-col items-center justify-center cursor-pointer transition-all',
                  verificationData.selfiePreview 
                    ? 'border-success bg-success/5' 
                    : 'border-dark-border hover:border-primary hover:bg-primary/5'
                )}
              >
                {verificationData.selfiePreview ? (
                  <img src={verificationData.selfiePreview} alt="Selfie" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <>
                    <FiCamera className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-400">Click to take a selfie</p>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 text-center">Please take a clear photo of your face</p>
            </div>
          )}

          {/* Error Message in Modal */}
          {errorMessage && (
            <div className="p-3 bg-error/10 border border-error/30 rounded-lg flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 text-error" />
              <p className="text-sm text-error">{errorMessage}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4 border-t border-dark-border">
            {verificationStep > 1 && (
              <Button variant="outline" onClick={() => setVerificationStep(verificationStep - 1)}>
                Back
              </Button>
            )}
            <Button 
              variant="primary" 
              fullWidth={verificationStep === 1} 
              className={verificationStep > 1 ? 'flex-1' : ''}
              loading={submitting} 
              onClick={handleVerificationSubmit}
            >
              {verificationStep === 3 ? 'Submit for Verification' : 'Continue'}
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center">
            <FiShield className="inline w-3 h-3 mr-1" />
            Your information is secure and encrypted
          </p>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)} title="Change Password" size="sm">
        <div className="space-y-4">
          <Input
            name="currentPassword"
            type="password"
            label="Current Password"
            placeholder="Enter current password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
            leftIcon={<FiLock />}
          />
          <Input
            name="newPassword"
            type="password"
            label="New Password"
            placeholder="Enter new password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
            leftIcon={<FiKey />}
            helperText="At least 8 characters"
          />
          <Input
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="Confirm new password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
            leftIcon={<FiCheck />}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowChangePasswordModal(false)}>Cancel</Button>
            <Button variant="primary" fullWidth loading={submitting} onClick={handleChangePassword}>
              Change Password
            </Button>
          </div>
        </div>
      </Modal>

      {/* Notification Settings Modal */}
      <Modal isOpen={showNotificationModal} onClose={() => setShowNotificationModal(false)} title="Notification Preferences" size="sm">
        <div className="space-y-4">
          {[
            { id: 'ride', label: 'Ride Updates', description: 'Notifications about your rides', icon: FaMotorcycle },
            { id: 'message', label: 'Messages', description: 'Chat messages and requests', icon: FiMailIcon },
            { id: 'promo', label: 'Promotions', description: 'Special offers and updates', icon: FiInfo },
          ].map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-dark-bg/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-white font-medium">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-dark-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
          <div className="flex gap-3 pt-4">
            <Button variant="primary" fullWidth onClick={() => setShowNotificationModal(false)}>
              Save Preferences
            </Button>
          </div>
        </div>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Sign Out" size="sm">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-error/20 flex items-center justify-center">
            <FiLogOut className="w-8 h-8 text-error" />
          </div>
          <h3 className="text-xl font-semibold text-white">Sign Out?</h3>
          <p className="text-gray-400">Are you sure you want to sign out of your account?</p>
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowLogoutModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleLogout} fullWidth className="bg-error hover:bg-error-dark">
              Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;