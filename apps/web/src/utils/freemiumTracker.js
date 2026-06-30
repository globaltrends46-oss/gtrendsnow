const FREEMIUM_KEY = 'gtrends_freemium_usage';

const getUsageData = () => {
  try {
    const data = localStorage.getItem(FREEMIUM_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
};

const setUsageData = (data) => {
  localStorage.setItem(FREEMIUM_KEY, JSON.stringify(data));
};

export const canUseFreeTool = (toolId) => {
  const data = getUsageData();
  const toolData = data[toolId];

  if (!toolData) return true;

  const now = new Date().getTime();
  if (now > toolData.expiryDate) {
    return true; // Expired, they get another free use
  }

  return false; // Still within the 30-day window limit
};

export const markToolUsed = (toolId) => {
  const data = getUsageData();
  const now = new Date().getTime();
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

  data[toolId] = {
    timestamp: now,
    expiryDate: now + thirtyDaysInMs
  };

  setUsageData(data);
};

export const getRemainingDays = (toolId) => {
  const data = getUsageData();
  const toolData = data[toolId];

  if (!toolData) return 0;

  const now = new Date().getTime();
  if (now > toolData.expiryDate) return 0;

  const diff = toolData.expiryDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};