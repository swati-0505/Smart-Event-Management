from __future__ import annotations
import json
import logging
from datetime import date, datetime
from decimal import Decimal
from typing import Any, Callable
from uuid import UUID
import redis
from pydantic import BaseModel
from app.core.config import settings
logger = logging.getLogger('app.core.redis_cache')

class JSONEncoderCustom(json.JSONEncoder):

    def default(self, obj: Any) -> Any:
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        if isinstance(obj, UUID):
            return str(obj)
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, BaseModel):
            return obj.model_dump(mode='json')
        if hasattr(obj, '__dict__'):
            return obj.__dict__
        return super().default(obj)

class RedisCacheManager:

    def __init__(self) -> None:
        self.client: redis.Redis | None = None
        self.is_connected: bool = False
        self._initialize()

    def _initialize(self) -> None:
        if not settings.ENABLE_REDIS_CACHE:
            logger.info('Redis cache is explicitly disabled via configuration (ENABLE_REDIS_CACHE=false).')
            self.is_connected = False
            return
        try:
            self.client = redis.from_url(settings.REDIS_URL, decode_responses=True, socket_timeout=1.5, socket_connect_timeout=1.5)
            self.client.ping()
            self.is_connected = True
            logger.info('Successfully connected to Redis server at %s', settings.REDIS_URL)
        except Exception as exc:
            self.is_connected = False
            self.client = None
            logger.warning('Redis connection unavailable at %s (%s). Falling back to direct database queries.', settings.REDIS_URL, exc)

    def get(self, key: str) -> Any | None:
        if not self.is_connected or not self.client:
            return None
        try:
            val = self.client.get(key)
            if val is not None:
                logger.debug('Cache HIT for key: %s', key)
                return json.loads(val)
        except Exception as exc:
            logger.warning('Cache GET failed for key %s: %s. Returning None.', key, exc)
        return None

    def set(self, key: str, value: Any, ttl: int | None=None) -> bool:
        if not self.is_connected or not self.client:
            return False
        if ttl is None:
            ttl = settings.REDIS_CACHE_TTL_SECONDS
        try:
            serialized = json.dumps(value, cls=JSONEncoderCustom)
            self.client.set(key, serialized, ex=ttl)
            logger.debug('Cache SET for key: %s (TTL: %ds)', key, ttl)
            return True
        except Exception as exc:
            logger.warning('Cache SET failed for key %s: %s.', key, exc)
            return False

    def delete(self, key: str) -> bool:
        if not self.is_connected or not self.client:
            return False
        try:
            self.client.delete(key)
            logger.debug('Cache DELETE for key: %s', key)
            return True
        except Exception as exc:
            logger.warning('Cache DELETE failed for key %s: %s.', key, exc)
            return False

    def delete_pattern(self, pattern: str) -> int:
        if not self.is_connected or not self.client:
            return 0
        try:
            keys = list(self.client.scan_iter(match=pattern, count=100))
            if keys:
                deleted_count = self.client.delete(*keys)
                logger.info("Invalidated %d cache keys matching pattern '%s'", deleted_count, pattern)
                return deleted_count
        except Exception as exc:
            logger.warning("Cache pattern deletion failed for '%s': %s.", pattern, exc)
        return 0

    def clear(self) -> bool:
        if not self.is_connected or not self.client:
            return False
        try:
            self.client.flushdb()
            logger.info('Flushed all Redis cache entries.')
            return True
        except Exception as exc:
            logger.warning('Cache flush failed: %s.', exc)
            return False

    def invalidate_events(self) -> int:
        return self.delete_pattern('events:*')

    def invalidate_venues(self) -> int:
        return self.delete_pattern('venues:*')

    def invalidate_policies(self) -> int:
        return self.delete_pattern('policy:*')

    def status(self) -> dict:
        info = {'connected': self.is_connected, 'url': None}
        if not self.is_connected or not self.client:
            return info
        try:
            safe_url = settings.REDIS_URL.split('@')[-1] if '@' in settings.REDIS_URL else settings.REDIS_URL
            info['url'] = safe_url
            raw = self.client.info('server')
            info['redis_version'] = raw.get('redis_version', '?')
            info['uptime_seconds'] = raw.get('uptime_in_seconds', 0)
            mem = self.client.info('memory')
            info['used_memory_human'] = mem.get('used_memory_human', '?')
            stats = self.client.info('stats')
            info['keyspace_hits'] = stats.get('keyspace_hits', 0)
            info['keyspace_misses'] = stats.get('keyspace_misses', 0)
            info['total_keys'] = self.client.dbsize()
        except Exception as exc:
            info['error'] = str(exc)
        return info


redis_cache = RedisCacheManager()