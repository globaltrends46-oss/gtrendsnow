import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';
import pb from './pocketbaseClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const POSTS_FILE = path.resolve(DATA_DIR, 'posts.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Initialize posts.json if not present
 */
function loadPostsFromDisk() {
  try {
    if (fs.existsSync(POSTS_FILE)) {
      const data = fs.readFileSync(POSTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    logger.warn('Failed to read posts.json from disk:', err.message);
  }
  return [];
}

function savePostsToDisk(posts) {
  try {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8');
    return true;
  } catch (err) {
    logger.error('Failed to write posts to disk:', err.message);
    return false;
  }
}

// In-memory cache for ultra-fast response
let postsCache = loadPostsFromDisk();

export const contentStore = {
  /**
   * Save a newly generated post (persists to JSON and tries PocketBase)
   */
  async savePost({ title, content, category, featured_image, author, published_date, hookDescription }) {
    const newPost = {
      id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      content: content.trim(),
      category: category || 'trendjacking',
      featured_image: featured_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
      author: author || 'GTrends Global AI Research',
      hookDescription: hookDescription || (content ? content.substring(0, 160).replace(/[#*]/g, '').trim() + '...' : ''),
      published_date: published_date || new Date().toISOString(),
      created: new Date().toISOString(),
      status: 'published'
    };

    // Prepend to posts cache
    postsCache.unshift(newPost);

    // Enforce 20 posts limit per category
    const catPosts = postsCache.filter(p => p.category === newPost.category);
    if (catPosts.length > 20) {
      const keepIds = new Set(catPosts.slice(0, 20).map(p => p.id));
      postsCache = postsCache.filter(p => p.category !== newPost.category || keepIds.has(p.id));
    }

    // Persist to JSON
    savePostsToDisk(postsCache);
    logger.info(`💾 Post saved to local JSON store: "${newPost.title}" (${newPost.id})`);

    // Attempt to sync to PocketBase in background
    try {
      if (pb && pb.collection) {
        await pb.collection('blog_posts').create({
          title: newPost.title,
          content: newPost.content,
          category: newPost.category,
          featured_image: newPost.featured_image,
          author: newPost.author,
          status: 'published',
          published_date: newPost.published_date
        }, { $autoCancel: false });
        logger.info(`✅ Post synced to PocketBase`);
      }
    } catch (pbErr) {
      // PocketBase is optional; failure is non-blocking
      logger.warn('PocketBase sync bypassed:', pbErr.message);
    }

    return newPost;
  },

  /**
   * Get posts with optional filtering and pagination
   */
  getPosts({ category, limit = 20, offset = 0 } = {}) {
    let filtered = postsCache;
    if (category && category !== 'all') {
      filtered = postsCache.filter(p => p.category === category);
    }
    const total = filtered.length;
    const items = filtered.slice(offset, offset + limit);
    return { items, total };
  },

  /**
   * Get single post by ID
   */
  getPostById(id) {
    return postsCache.find(p => p.id === id) || null;
  },

  /**
   * Seed store with fallback articles if empty
   */
  seedWithFallback(fallbackItems) {
    if (postsCache.length === 0 && Array.isArray(fallbackItems) && fallbackItems.length > 0) {
      postsCache = [...fallbackItems];
      savePostsToDisk(postsCache);
      logger.info(`🌱 Seeded content store with ${fallbackItems.length} initial articles`);
    }
  }
};

export default contentStore;
