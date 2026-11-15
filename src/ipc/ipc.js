const { ipcRenderer } = require('electron');

// IPC module for abstracted communication between renderer and main processes
const ipc = {
  // Get activity data for a specific date
  getActivityData: async (date) => {
    return ipcRenderer.invoke('get-activity-data', date);
  },
  
  // Toggle tracking on/off
  toggleTracking: async (shouldTrack) => {
    return ipcRenderer.invoke('toggle-tracking', shouldTrack);
  },
  
  // Get current tracking status
  getTrackingStatus: async () => {
    return ipcRenderer.invoke('get-tracking-status');
  },
  
  // Update beta release setting
  updateBetaReleaseSetting: async (allowPrerelease) => {
    return ipcRenderer.invoke('update-beta-release-setting', allowPrerelease);
  },
  
  // Get current settings
  getSettings: async () => {
    return ipcRenderer.invoke('get-settings');
  },
  
  // Check if mock data is being used
  isUsingMockData: async () => {
    return ipcRenderer.invoke('is-using-mock-data');
  }
};

module.exports = ipc; 