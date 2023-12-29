
import os

from flask import Flask, render_template


def create_app(env="dev"):

    # main/instance, app.instance_path
    app = Flask(__name__, instance_relative_config=True)

    # ensure main/instance exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    """
        app.config.from_pyfile(f'{env}'.py, silent=True)
    """

    app.config['SECRET_KEY'] = 'dev'
    app.config['DATABASE'] = os.path.join(
        app.instance_path, 'magicpost.sqlite')

    @app.route('/')
    # Homepage
    def index():
        return render_template('auth/login.html')

    from main import db
    db.init_app(app)

    # Login Blueprint
    from main import login
    app.register_blueprint(login.bp)

    # Dashboard Blueprint
    # from main import dashboard
    # app.register_blueprint(dashboard.bp)

    # Other Blueprints...

    return app
