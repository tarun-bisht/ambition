from flask import Flask
from ambition.config import Config
from flask_compress import Compress
from flask_caching import Cache

compress=Compress()
cache = Cache(config={'CACHE_TYPE': 'simple'})

from ambition.routes import routes

def create_app(config_class=Config):
	app=Flask(__name__)
	app.config.from_object(Config)
	app.register_blueprint(routes)
	compress.init_app(app)
	cache.init_app(app)
	cache.clear()
	return app