
import functools
from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)
from werkzeug.exceptions import abort

from main import db
from main.login import login_required, login_required2

from main.models.trading_points import TradingPoints
from main.models.consol_points import ConsolPoints


bp = Blueprint('dashboard', __name__, url_prefix='/dashboard')

# @bp.route('/register', methods=['GET', 'POST'])
# @bp.route('/forget', methods=['GET', 'POST'])


@bp.route('/')
@login_required
def index():
    return render_template('dashboard/senior_manager.html')


@bp.route('/trades')
@login_required
def get_trading_points():

    pass


@bp.route('/trades/<int:id>/consols/')
def get_consol_points(id):
    pass


@bp.route('/trades/create')
def create_trading_point():
    pass


@bp.route('/trades/<int:id>/update')
def update_trading_point(id):
    pass


@bp.route('/trades/<int:id>/delete')
def delete_trading_point(id):
    pass


@bp.route('/trades/<int:id>/consols/create')
def create_consol_point(id):
    pass


@bp.route('/trades/<int:id>/consols/<int:id>/update')
def update_consol_point(id):
    pass


@bp.route('/trades/<int:id>/consols/<int:id>/delete')
def delete_consol_point(id):
    pass


@bp.route('/', methods=('GET', 'POST'))
def login():
    if (request.method == 'POST'):

        username = request.form['username']
        password = request.form['password']
        error = None

        if not username:
            error = 'Username is required.'
        elif not password:
            error = 'Password is required.'

        if error is not None:
            return {
                "error": error
            }

        user_cred = db.session.execute(
            db.select(UserCredentials).filter_by(username=username)).scalar_one_or_none()  # no need to handle exception
        # scalar_one() produce exception
        # one_or_404() produce 404 Not Found

        if user_cred is None:
            error = "Username not existed!"
        elif not check_password_hash(user_cred.password, password):
            # remember, use dot notation (for scaler, SQLAlchemy), square bracket (for sqlite3 directly)
            error = "Incorrect password!"

        if error is not None:
            return {
                "error": error
            }

        session.clear()
        session['user_id'] = user_cred.id

        user = db.session.execute(db.select(Users, UserCredentials).filter(
            Users.credential_id == UserCredentials.id)).all()

        print(user)

        return {
            "msg": "success"
        }

        return redirect(url_for('index'))

    return render_template('auth/login.html')


@bp.before_app_request  # Reg a func that runs before the view func
# Checks if a user id is stored in the session, and gets that user's data from the database, storing it on g.user
def load_logged_in_user():
    session.clear()
    user_id = session.get('user_cred_id')

    if user_id is None:
        g.user = None
    else:
        g.user = db.session.execute(
            db.select(Users).where(Users.id == user_id)).scalar_one()


@bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))


def login_required(view):

    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for("login"))
        return view(**kwargs)

    return wrapped_view
