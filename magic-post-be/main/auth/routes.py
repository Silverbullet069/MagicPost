from flask_cors import cross_origin
import json
import functools
from flask import (
    Blueprint, request, session, url_for,
)
from main.db import get_db
from werkzeug.security import check_password_hash

# prefix set at App
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


# @auth_bp.route('/register', methods=['GET', 'POST'])
# @auth_bp.route('/forget', methods=['GET', 'POST'])
# ... for future


@auth_bp.get('/images')
@cross_origin(supports_credentials=True)
def get_login_images():
    return {
        "status": "success",
        "data": {
            "imgs": {
                "bkg": url_for('static', filename='mg-bkg.jpeg'),
                "logo": url_for('static', filename='mg-logo.png')
            }
        }
    }

# @auth_bp.post('/register')
# @auth_bp.post('/forget')


@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
@cross_origin(supports_credentials=True)
def login():

    credential = json.loads(request.data)
    username = credential['username']
    password = credential['password']

    if not username:
        return {
            "status": "fail",
            "data": {
                "msg": "Username is required."
            }
        }
    elif not password:
        return {
            "status": "fail",
            "data": {
                "msg": "Password is required."
            }
        }

    user = get_db().execute(
        "SELECT * FROM user WHERE username = ?",
        (username,)).fetchone()

    if user is None:
        return {
            "status": "fail",
            "data": {
                "msg": "Username is not existed!"
            }
        }

    elif not check_password_hash(user['pwdhash'], password):
        return {
            "status": "fail",
            "data": {
                "msg": "Incorrect password."
            }
        }

    user = get_db().execute(
        """SELECT u1.id, u1.name, u1.username, r.name as role, u2.id as supervisor_id, u2.name as supervisor_name, tp.id as trade_point_id, tp.name as trade_point_name, cp.id as consol_point_id, cp.name as consol_point_name
        FROM user u1
        INNER JOIN role r ON u1.role_id = r.id
        LEFT JOIN user u2 ON u1.supervisor_id = u2.id
        LEFT JOIN trade_point tp ON (u1.id = tp.mng_id AND r.name = 'tp_mng') OR (u2.id = tp.mng_id AND r.name = 'tp_emp')
        LEFT JOIN consol_point cp ON (u1.id = cp.mng_id AND r.name = 'cp_mng') OR (u2.id = cp.mng_id AND r.name = 'cp_emp')
        WHERE u1.id = ?""",
        (user['id'],)).fetchone()

    # Client-side session so this will work, it's different from server-side session
    session.clear()

    session['user'] = {
        "id": user['id'],
        "name": user['name'],
        "username": user['username'],
        "role": user['role'],
        "supervisor_id": user['supervisor_id'],
        "supervisor_name": user['supervisor_name'],
        "point_id": user['trade_point_id'] if user['trade_point_id'] else user['consol_point_id'],
        "point_name": user['trade_point_name'] if user['trade_point_name'] else user['consol_point_name']
    }

    print(session['user'])

    return {
        "status": "success",
        "data": {
            "msg": f"Login success. Welcome, {session.get('user')['name']}",
            "user": dict(session.get('user')),
            "session_id": session.sid
        }
    }

# Syntax: @login_required, no parenthesis ()
# Test: might need to add @cross_origin here, maybe later


def login_required(view):

    @functools.wraps(view)
    @cross_origin(supports_credentials=True)
    def wrapped_view(**kwargs):

        if not session.get('user'):
            return {
                "status": "fail",
                "data": {
                    'msg': 'Login is required.'
                }
            }, 401

        return view(**kwargs)

    return wrapped_view


# TODO: Only 1 role is specified, change to *args if you want more
def login_required2(*roles):

    def wrapper(view):
        @functools.wraps(view)
        def decorated_view(*args, **kwargs):

            if not session.get('user'):
                return {
                    "status": "fail",
                    "data": {
                        'msg': 'Login is required.'
                    }
                }, 401

            if session.get('user') and not session.get('user')['role'] in roles:
                return {
                    "status": "fail",
                    "data": {
                        'msg': 'Unauthorized access.'
                    }
                }, 403

            return view(*args, **kwargs)
        return decorated_view
    return wrapper


@auth_bp.route('/user')
@cross_origin(supports_credentials=True)
@login_required
def get_current_user():  # Not a great place to put this view function here, but since we aren't doing self user management so this will be enough

    return {
        "status": "success",
        "data": {
            "user": session.get('user')
        }
    }


@auth_bp.route('/logout')
@cross_origin(supports_credentials=True)
@login_required
def logout():
    user_name = session.get('user')['name']
    session.clear()
    return {
        "status": "success",
        'data': {
            'msg': f'Logout, goodbye {user_name}'
        }
    }
