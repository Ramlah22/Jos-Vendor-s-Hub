import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import AdminSidebar from '../src/components/AdminSidebar';
import { useAdminAuth } from '../src/context/AdminAuthContext';
import { User, Lock, Bell, Shield, Database, Mail, Globe, Save } from 'lucide-react';

const AdminSettings = () => {
    const { currentUser, isAdmin } = useAdminAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);

    const [profileData, setProfileData] = useState({
        name: currentUser?.displayName || 'Admin User',
        email: currentUser?.email || 'admin@josvendors.com',
        phone: '+234 123 456 7890',
        role: 'Super Admin'
    });

    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        orderNotifications: true,
        vendorNotifications: true,
        customerNotifications: false,
        securityAlerts: true
    });

    const [platformSettings, setPlatformSettings] = useState({
        siteName: 'Jos Vendors Hub',
        supportEmail: 'support@josvendors.com',
        currency: 'NGN',
        timezone: 'Africa/Lagos',
        maintenanceMode: false
    });

    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    const handleSave = async () => {
        setSaving(true);
        // Simulate save operation
        setTimeout(() => {
            setSaving(false);
            alert('Settings saved successfully!');
        }, 1000);
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'platform', label: 'Platform', icon: Globe }
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
      
            <div className="flex-1 lg:ml-64">
                <div className="p-6 lg:p-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
                        <p className="text-gray-600">Manage your admin account and platform settings</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar Tabs */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                <nav className="space-y-2">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                                                    activeTab === tab.id
                                                        ? 'bg-emerald-100 text-emerald-600 font-medium'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                            >
                                                <Icon size={20} />
                                                <span>{tab.label}</span>
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                {/* Profile Tab */}
                                {activeTab === 'profile' && (
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 mb-6">Profile Information</h2>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={profileData.name}
                                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={profileData.email}
                                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    value={profileData.phone}
                                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                                <input
                                                    type="text"
                                                    value={profileData.role}
                                                    disabled
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Security Tab */}
                                {activeTab === 'security' && (
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 mb-6">Security Settings</h2>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                                <input
                                                    type="password"
                                                    value={securityData.currentPassword}
                                                    onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                                <input
                                                    type="password"
                                                    value={securityData.newPassword}
                                                    onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    value={securityData.confirmPassword}
                                                    onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                            <div className="pt-4 border-t border-gray-200">
                                                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                                                    <Shield className="text-blue-600" size={20} />
                                                    <p className="text-sm text-gray-700">Two-factor authentication is enabled for your account</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Notifications Tab */}
                                {activeTab === 'notifications' && (
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 mb-6">Notification Preferences</h2>
                                        <div className="space-y-4">
                                            {Object.entries(notificationSettings).map(([key, value]) => (
                                                <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                                    <div>
                                                        <p className="font-medium text-gray-800 capitalize">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Receive notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                                        </p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={value}
                                                            onChange={(e) => setNotificationSettings({
                                                                ...notificationSettings,
                                                                [key]: e.target.checked
                                                            })}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Platform Tab */}
                                {activeTab === 'platform' && (
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 mb-6">Platform Settings</h2>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                                                <input
                                                    type="text"
                                                    value={platformSettings.siteName}
                                                    onChange={(e) => setPlatformSettings({ ...platformSettings, siteName: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                                                <input
                                                    type="email"
                                                    value={platformSettings.supportEmail}
                                                    onChange={(e) => setPlatformSettings({ ...platformSettings, supportEmail: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                                <select
                                                    value={platformSettings.currency}
                                                    onChange={(e) => setPlatformSettings({ ...platformSettings, currency: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                                >
                                                    <option value="NGN">Nigerian Naira (₦)</option>
                                                    <option value="USD">US Dollar ($)</option>
                                                    <option value="GBP">British Pound (£)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                                                <select
                                                    value={platformSettings.timezone}
                                                    onChange={(e) => setPlatformSettings({ ...platformSettings, timezone: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                                >
                                                    <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                                                    <option value="UTC">UTC</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center justify-between py-3 border-t border-gray-200">
                                                <div>
                                                    <p className="font-medium text-gray-800">Maintenance Mode</p>
                                                    <p className="text-sm text-gray-500">Temporarily disable public access to the platform</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={platformSettings.maintenanceMode}
                                                        onChange={(e) => setPlatformSettings({
                                                            ...platformSettings,
                                                            maintenanceMode: e.target.checked
                                                        })}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Save Button */}
                                <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold transition-all ${
                                            saving
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-emerald-600 hover:bg-emerald-700'
                                        }`}
                                    >
                                        <Save size={20} />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;