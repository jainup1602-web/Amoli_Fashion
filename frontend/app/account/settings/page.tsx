'use client';

export default function AccountSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your preferences and security</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4">Notifications</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive order updates via email</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-blue-600" defaultChecked />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-600">Receive order updates via SMS</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-blue-600" defaultChecked />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Promotional Emails</p>
                  <p className="text-sm text-gray-600">Receive offers and deals</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-blue-600" />
              </label>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Privacy</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Profile Visibility</p>
                  <p className="text-sm text-gray-600">Make your profile visible to others</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-blue-600" />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Show Purchase History</p>
                  <p className="text-sm text-gray-600">Display your purchase history</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-blue-600" />
              </label>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Security</h2>
            <div className="space-y-4">
              <div>
                <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50">
                  <p className="font-medium text-gray-900">Change Password</p>
                  <p className="text-sm text-gray-600">Update your account password</p>
                </button>
              </div>
              <div>
                <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50">
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
            <div className="space-y-4">
              <button className="w-full text-left px-4 py-3 border border-red-300 rounded-md hover:bg-red-50">
                <p className="font-medium text-red-600">Delete Account</p>
                <p className="text-sm text-gray-600">Permanently delete your account and data</p>
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
