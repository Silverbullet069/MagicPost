
import functools
from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)
from main.db import get_db

from werkzeug.security import check_password_hash


bp = Blueprint('auth', __name__, url_prefix='/auth')

# @bp.route('/register', methods=['GET', 'POST'])
# @bp.route('/forget', methods=['GET', 'POST'])


@bp.route('/login', methods=('GET', 'POST'))
def login():

    if (request.method == 'GET'):
        return render_template('auth/login.html')

    if (request.method == 'POST'):
        username = request.form['username']
        password = request.form['password']

        if not username:
            return {
                "error": 'Username is required.'
            }
        elif not password:
            return {
                "error": 'Password is required.'
            }

        user = get_db().execute(
            "SELECT * FROM users WHERE username = ?",
            (username,)).fetchone()

        if user is None:
            return {"error": "Username not existed!"}

        elif not check_password_hash(user['password'], password):
            return {"error": "Incorrect password!"}

        session.clear()
        session['user_id'] = user['id']  # Persist user id

        # Here, role and template file name are the same
        return redirect(url_for(f'dashboard/{user["role"]}.html'))


@bp.before_app_request
# Load user data each time a request is sent
def load_logged_in_user():
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        db = get_db()
        g.user = db.execute(
            "SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        # Session: persist across req
        # g: not persist, use for 1 req cycle only. g can be setup during before_request hooks and last available during teardown_request


@bp.route('/forbid')
def forbid():
    return render_template('auth/forbidden.html')


@bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('auth/login.html'))


def login_required(view):

    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for("login"))
        return view(**kwargs)

    return wrapped_view


def login_required2(role=None):

    def wrapper(view):
        @functools.wraps(view)
        def decorated_view(*args, **kwargs):

            if g.user is None:
                return redirect(url_for("login"))

            if g.user and role is not None and g.user['role'] != role:
                return redirect(url_for("forbid"))

            return view(*args, **kwargs)
        return decorated_view
    return wrapper
