from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

def _get_engine_options(raw_url: str):
    url = raw_url
    if url.startswith('postgres://'):
        url = url.replace('postgres://', 'postgresql://', 1)
    parsed = urlparse(url)
    if parsed.query:
        query_params = parse_qs(parsed.query, keep_blank_values=True)
        if 'channel_binding' in query_params:
            del query_params['channel_binding']
        new_query = urlencode(query_params, doseq=True)
        parsed = parsed._replace(query=new_query)
        url = urlunparse(parsed)
    connect_args = {}
    if url.startswith('postgresql'):
        connect_args = {'keepalives': 1, 'keepalives_idle': 30, 'keepalives_interval': 10, 'keepalives_count': 5}
        if 'sslmode' not in url:
            connect_args['sslmode'] = 'require'
    return (url, connect_args)
db_url, connect_args = _get_engine_options(settings.DATABASE_URL)
engine = create_engine(db_url, connect_args=connect_args, pool_pre_ping=True, pool_recycle=300)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()