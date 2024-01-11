
import os
from flask import Flask, url_for
from flask_cors import CORS, cross_origin
from flask_session import Session  # server-side session
from datetime import timedelta


def create_app(env="dev"):

    # main/instance, app.instance_path
    app = Flask(__name__, instance_relative_config=True)

    # ensure main/instance exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    """ multiple env config
        app.config.from_pyfile(f'{env}'.py, silent=True)
    """

    app.config['SECRET_KEY'] = 'super secret dev'
    app.config['DATABASE'] = os.path.join(
        app.instance_path, 'magicpost.sqlite')

    # Server-side session
    # Client-side will not work when integrating with React
    # Cre: https://stackoverflow.com/a/58259880/9122512
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['SESSION_COOKIE_SAMESITE'] = 'None'
    app.config['SESSION_COOKIE_SECURE'] = 'True'

    CORS(app, supports_credentials=True, origins=[
         'http://localhost:5173', 'http://127.0.0.1:5173'])
    Session(app)

    from main import db  # Sqlite3 DB
    db.init_app(app)

    from main.auth.routes import auth_bp
    app.register_blueprint(auth_bp)

    from main.accounts.routes import account_bp
    app.register_blueprint(account_bp)

    from main.points.routes import point_bp
    app.register_blueprint(point_bp)

    from main.orders.routes import order_bp
    app.register_blueprint(order_bp)

    # Other Blueprints...
    # from main.orders.routes import order_bp
    # app.register_blueprint(order_bp, url_prefix='/api/orders')

    # Map homepage/index page to login
    # app.add_url_rule('/', endpoint='auth.login')

    # Send API to Front End
    @app.route('/')
    def hello():
        return {
            "status": "success",
            "data": {
                "msg": "Welcome to MagicPost."
            }
        }

    return app
