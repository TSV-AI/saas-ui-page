"""
Anti-Detection Utilities
Provides tools for evading bot detection while scraping
"""

import asyncio
import random
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse

import structlog
from fake_useragent import UserAgent
from playwright.async_api import Browser, BrowserContext, Page

from scraper.config.settings import settings

logger = structlog.get_logger(__name__)


class AntiDetectionManager:
    """
    Manages anti-detection strategies for web scraping
    """
    
    def __init__(self):
        self.user_agent_rotator = UserAgentRotator()
        self.proxy_manager = ProxyManager()
        self.session_manager = SessionManager()
    
    async def create_stealth_context(
        self,
        browser: Browser,
        platform: str = "google",
        use_proxy: bool = True
    ) -> BrowserContext:
        """
        Create a browser context with anti-detection measures
        """
        # Get proxy if enabled
        proxy = None
        if use_proxy and settings.PROXY_ENABLED:
            proxy = await self.proxy_manager.get_proxy()
        
        # Configure context
        context_options = {
            "user_agent": self.user_agent_rotator.get_user_agent(),
            "viewport": self._get_random_viewport(),
            "locale": "en-US",
            "timezone_id": "America/New_York",
            "extra_http_headers": self._get_realistic_headers(platform),
            "java_script_enabled": True,
            "accept_downloads": False,
            "bypass_csp": True,
            "ignore_https_errors": True,
        }
        
        if proxy:
            context_options["proxy"] = {
                "server": proxy["url"],
                "username": proxy.get("username"),
                "password": proxy.get("password"),
            }
        
        # Create context
        context = await browser.new_context(**context_options)
        
        # Add stealth scripts
        await self._inject_stealth_scripts(context)
        
        logger.info(
            "Created stealth context",
            platform=platform,
            user_agent=context_options["user_agent"][:50] + "...",
            proxy_enabled=proxy is not None
        )
        
        return context
    
    async def create_stealth_page(
        self,
        context: BrowserContext,
        platform: str = "google"
    ) -> Page:
        """
        Create a page with additional anti-detection measures
        """
        page = await context.new_page()
        
        # Set additional properties
        await page.add_init_script("""
            // Override webdriver property
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
            
            // Override chrome property
            window.chrome = {
                runtime: {},
            };
            
            // Override permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Cypress.env('permissions') || 'granted' }) :
                    originalQuery(parameters)
            );
            
            // Override plugins length
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
            });
            
            // Override languages
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en'],
            });
        """)
        
        # Platform-specific configurations
        if platform == "linkedin":
            await self._configure_linkedin_page(page)
        elif platform == "facebook":
            await self._configure_facebook_page(page)
        elif platform == "google":
            await self._configure_google_page(page)
        
        return page
    
    def _get_random_viewport(self) -> Dict[str, int]:
        """Get a random realistic viewport size"""
        viewports = [
            {"width": 1920, "height": 1080},
            {"width": 1366, "height": 768},
            {"width": 1440, "height": 900},
            {"width": 1536, "height": 864},
            {"width": 1280, "height": 720},
        ]
        return random.choice(viewports)
    
    def _get_realistic_headers(self, platform: str) -> Dict[str, str]:
        """Generate realistic HTTP headers for platform"""
        base_headers = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Cache-Control": "max-age=0",
        }
        
        # Platform-specific headers
        if platform == "linkedin":
            base_headers.update({
                "sec-ch-ua": '"Chromium";v="119", "Not?A_Brand";v="24"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
            })
        
        return base_headers
    
    async def _inject_stealth_scripts(self, context: BrowserContext):
        """Inject stealth scripts into the context"""
        await context.add_init_script("""
            // Remove webdriver traces
            delete navigator.__proto__.webdriver;
            
            // Mock chrome object
            window.chrome = window.chrome || {};
            window.chrome.runtime = window.chrome.runtime || {};
            
            // Override permissions API
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: 'granted' }) :
                    originalQuery(parameters)
            );
            
            // Randomize canvas fingerprint
            const getImageData = HTMLCanvasElement.prototype.getContext('2d').getImageData;
            HTMLCanvasElement.prototype.getContext('2d').getImageData = function(sx, sy, sw, sh) {
                const imageData = getImageData.apply(this, arguments);
                for (let i = 0; i < imageData.data.length; i += 4) {
                    imageData.data[i] += Math.floor(Math.random() * 10) - 5;
                    imageData.data[i + 1] += Math.floor(Math.random() * 10) - 5;
                    imageData.data[i + 2] += Math.floor(Math.random() * 10) - 5;
                }
                return imageData;
            };
        """)
    
    async def _configure_linkedin_page(self, page: Page):
        """Configure page for LinkedIn scraping"""
        # Block unnecessary resources
        await page.route("**/*.{png,jpg,jpeg,gif,svg,woff,woff2}", lambda route: route.abort())
        await page.route("**/analytics/**", lambda route: route.abort())
        await page.route("**/tracking/**", lambda route: route.abort())
    
    async def _configure_facebook_page(self, page: Page):
        """Configure page for Facebook scraping"""
        # Block trackers and ads
        await page.route("**/*tracking*", lambda route: route.abort())
        await page.route("**/*analytics*", lambda route: route.abort())
        await page.route("**/*ads*", lambda route: route.abort())
    
    async def _configure_google_page(self, page: Page):
        """Configure page for Google scraping"""
        # Accept cookies automatically
        await page.add_init_script("""
            window.addEventListener('load', () => {
                const acceptButton = document.querySelector('[aria-label*="Accept"], [id*="accept"], .accept-button');
                if (acceptButton) {
                    acceptButton.click();
                }
            });
        """)


class UserAgentRotator:
    """
    Manages user agent rotation
    """
    
    def __init__(self):
        self.ua = UserAgent()
        self.cache = []
        self.cache_size = 50
        self._populate_cache()
    
    def _populate_cache(self):
        """Populate user agent cache"""
        for _ in range(self.cache_size):
            try:
                ua = self.ua.random
                if ua not in self.cache:
                    self.cache.append(ua)
            except Exception:
                # Fallback user agents
                fallback_uas = [
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
                    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
                ]
                self.cache.extend(fallback_uas)
                break
    
    def get_user_agent(self) -> str:
        """Get a random user agent"""
        if not self.cache:
            self._populate_cache()
        return random.choice(self.cache)


class ProxyManager:
    """
    Manages proxy rotation and health checking
    """
    
    def __init__(self):
        self.proxies = self._load_proxies()
        self.current_index = 0
    
    def _load_proxies(self) -> List[Dict]:
        """Load proxies from configuration"""
        proxies = []
        
        if settings.PROXY_LIST:
            proxy_urls = settings.PROXY_LIST.split(",")
            for proxy_url in proxy_urls:
                proxy_url = proxy_url.strip()
                if proxy_url:
                    parsed = urlparse(proxy_url)
                    proxy = {
                        "url": f"{parsed.scheme}://{parsed.hostname}:{parsed.port}",
                        "username": parsed.username,
                        "password": parsed.password,
                        "type": parsed.scheme,
                        "healthy": True,
                        "last_used": None,
                        "success_count": 0,
                        "failure_count": 0,
                    }
                    proxies.append(proxy)
        
        return proxies
    
    async def get_proxy(self) -> Optional[Dict]:
        """Get next healthy proxy"""
        if not self.proxies:
            return None
        
        # Find next healthy proxy
        for _ in range(len(self.proxies)):
            proxy = self.proxies[self.current_index]
            self.current_index = (self.current_index + 1) % len(self.proxies)
            
            if proxy["healthy"]:
                return proxy
        
        # If no healthy proxies, return first one
        return self.proxies[0] if self.proxies else None
    
    async def mark_proxy_success(self, proxy: Dict):
        """Mark proxy as successful"""
        proxy["success_count"] += 1
        proxy["healthy"] = True
        proxy["last_used"] = asyncio.get_event_loop().time()
    
    async def mark_proxy_failure(self, proxy: Dict):
        """Mark proxy as failed"""
        proxy["failure_count"] += 1
        
        # Mark as unhealthy if failure rate is high
        total_requests = proxy["success_count"] + proxy["failure_count"]
        if total_requests > 10:
            failure_rate = proxy["failure_count"] / total_requests
            if failure_rate > 0.3:  # 30% failure rate threshold
                proxy["healthy"] = False


class SessionManager:
    """
    Manages session persistence and cookies
    """
    
    def __init__(self):
        self.sessions = {}
    
    async def get_session_cookies(self, platform: str) -> Dict:
        """Get session cookies for platform"""
        return self.sessions.get(platform, {})
    
    async def save_session_cookies(self, platform: str, cookies: List[Dict]):
        """Save session cookies for platform"""
        self.sessions[platform] = {
            "cookies": cookies,
            "timestamp": asyncio.get_event_loop().time()
        }
    
    async def human_like_delay(self, min_delay: float = 1.0, max_delay: float = 3.0):
        """Add human-like delay between actions"""
        if settings.HUMAN_LIKE_DELAYS:
            delay = random.uniform(min_delay, max_delay)
            await asyncio.sleep(delay)
    
    async def human_like_typing(self, page: Page, selector: str, text: str):
        """Type text with human-like delays"""
        await page.click(selector)
        
        for char in text:
            await page.keyboard.type(char)
            if settings.HUMAN_LIKE_DELAYS:
                await asyncio.sleep(random.uniform(0.05, 0.15))


class RateLimiter:
    """
    Simple rate limiter for scraping operations
    """
    
    def __init__(self, requests_per_second: float = 1.0):
        self.requests_per_second = requests_per_second
        self.last_request_time = 0
    
    async def wait(self):
        """Wait if necessary to respect rate limit"""
        current_time = asyncio.get_event_loop().time()
        time_since_last = current_time - self.last_request_time
        min_interval = 1.0 / self.requests_per_second
        
        if time_since_last < min_interval:
            wait_time = min_interval - time_since_last
            await asyncio.sleep(wait_time)
        
        self.last_request_time = asyncio.get_event_loop().time()