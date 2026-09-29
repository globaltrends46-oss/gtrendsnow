const API_PREFIXES = ['/hcgi/api', '/api', ''];

const apiServerClient = {
    fetch: async (url, options = {}) => {
        let lastResponse = null;
        let lastError = null;

        for (const prefix of API_PREFIXES) {
            try {
                const targetUrl = `${prefix}${url}`;
                
                // Add default timeout so hanging requests do not block UI indefinitely
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), options.timeout || 6000);
                
                const fetchOptions = {
                    ...options,
                    signal: options.signal || controller.signal
                };

                const res = await window.fetch(targetUrl, fetchOptions);
                clearTimeout(timeoutId);

                // If 403 Forbidden, 404 Not Found, 500/502/503/504 Server Error, try next prefix!
                if ([403, 404, 500, 502, 503, 504].includes(res.status)) {
                    lastResponse = res;
                    continue;
                }

                // If response is HTML (e.g. SPA index.html fallback from Apache rewrite) when expecting API, try next
                const contentType = res.headers.get('content-type') || '';
                if (contentType.includes('text/html') && !url.endsWith('.html')) {
                    lastResponse = res;
                    continue;
                }

                return res;
            } catch (err) {
                lastError = err;
            }
        }

        if (lastResponse) return lastResponse;
        if (lastError) throw lastError;
        return window.fetch(`/api${url}`, options);
    }
};

export default apiServerClient;
export { apiServerClient };
