const API_KEY = 'f478592874e54847960732449d64b49c';

const getTargetUrl = (category = 'geopolitics') => {
  switch (category) {
    case 'geopolitics':
      return `https://newsapi.org/v2/everything?q=geopolitics&sources=reuters,bbc-news,bloomberg&language=en&sortBy=publishedAt&apiKey=${API_KEY}`;
    case 'energy':
      return `https://newsapi.org/v2/everything?q=energy%20OR%20commodities&sources=reuters,bbc-news,bloomberg,business-insider,cnbc,financial-times,the-wall-street-journal&language=en&sortBy=publishedAt&apiKey=${API_KEY}`;
    case 'tech':
      return `https://newsapi.org/v2/everything?q=technology%20OR%20AI&sources=reuters,bbc-news,bloomberg,business-insider,cnbc,financial-times,the-wall-street-journal&language=en&sortBy=publishedAt&apiKey=${API_KEY}`;
    case 'sports':
      return `https://newsapi.org/v2/everything?q=sports&sources=reuters,bbc-news,bloomberg,business-insider,cnbc,financial-times,the-wall-street-journal,associated-press&language=en&sortBy=publishedAt&apiKey=${API_KEY}`;
    default:
      return `https://newsapi.org/v2/everything?q=geopolitics&sources=reuters,bbc-news,bloomberg&language=en&sortBy=publishedAt&apiKey=${API_KEY}`;
  }
};

const BLOCKED_KEYWORDS = ['india', 'kerala', 'delhi', 'mumbai', 'bangalore', 'hyderabad'];

const filterArticles = (articles) => {
  return (articles || []).filter(article => {
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    const content = (article.content || '').toLowerCase();

    // Filter out [Removed] items (News API quirk)
    if (title === '[removed]' || description === '[removed]') {
      return false;
    }

    // Filter out blocked keywords (hyper-localized/regional news)
    for (const keyword of BLOCKED_KEYWORDS) {
      if (title.includes(keyword) || description.includes(keyword) || content.includes(keyword)) {
        return false;
      }
    }

    return true;
  });
};

const fallbackArticles = [
  {
    title: 'Global Markets Rally on Positive Macro Economic Data',
    source: { name: 'GTrends Global' },
    description: 'International markets show strong performance as major economies report better-than-expected growth figures and stabilized inflation rates globally.',
    publishedAt: new Date().toISOString(),
    urlToImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'AI Innovation Accelerates Across Global Tech Sector',
    source: { name: 'GTrends Global' },
    description: 'Leading international technology companies announce breakthrough developments in artificial intelligence and enterprise machine learning applications.',
    publishedAt: new Date().toISOString(),
    urlToImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Energy Transition Reshapes Global Markets',
    source: { name: 'GTrends Global' },
    description: 'Renewable energy investments surge worldwide as nations commit to sustainable infrastructure development and diversified energy portfolios.',
    publishedAt: new Date().toISOString(),
    urlToImage: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=800&auto=format&fit=crop'
  }
];

export const fetchArticles = async (category = 'geopolitics') => {
  const targetUrl = getTargetUrl(category);
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Proxy API Error: ${response.status}`);
    }
    
    const proxyData = await response.json();
    
    // Handle both proxy-wrapped responses and direct API responses
    let data;
    if (proxyData.contents) {
      data = JSON.parse(proxyData.contents);
    } else {
      data = proxyData;
    }

    if (data.status === 'error') {
      throw new Error(data.message || 'News API returned an error');
    }
    
    // Apply strict filtering for blocked keywords and missing fields
    const validArticles = filterArticles(data.articles);

    if (validArticles.length === 0) {
      return fallbackArticles;
    }

    return validArticles;
  } catch (error) {
    console.error('Failed to fetch news, using fallback articles:', error);
    return fallbackArticles;
  }
};