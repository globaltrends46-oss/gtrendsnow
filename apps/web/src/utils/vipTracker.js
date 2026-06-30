export const isVipUser = () => {
  if (typeof window === 'undefined') return false;
  return document.cookie.includes('vipUser=true') || localStorage.getItem('vipUser') === 'true';
};

export const setVipUser = () => {
  if (typeof window === 'undefined') return;
  document.cookie = "vipUser=true; path=/; max-age=31536000";
  localStorage.setItem('vipUser', 'true');
};

export const canGenerateDocument = () => {
  if (typeof window === 'undefined') return true;
  if (isVipUser()) return true;
  
  const lastGen = localStorage.getItem('lastGenerationDate');
  if (!lastGen) return true;
  
  const timeDiff = Date.now() - parseInt(lastGen, 10);
  return timeDiff > 24 * 60 * 60 * 1000;
};

export const markGenerationUsed = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('lastGenerationDate', Date.now().toString());
};