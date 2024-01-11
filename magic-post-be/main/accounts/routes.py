
import json
from flask import (
    Blueprint, request, session
)
from flask_cors import cross_origin
from werkzeug.security import generate_password_hash

from main.db import get_db
from main.auth.routes import login_required2
from main.helper.res_template import (
    be_validate, res_missing, res_invalid, handle_exception
)

account_bp = Blueprint('account', __name__, url_prefix='/api/accounts')


def get_tp_emp(id):
    tp_mng_acc = get_db().execute(
        """SELECT u1.id, u1.name, u1.username, tp.name as assigned_trading_point, u2.name as supervisor_name 
        FROM user u1
        INNER JOIN role r ON r.id = u1.role_id
        LEFT JOIN user u2 ON u1.supervisor_id = u2.id
        LEFT JOIN trade_point tp ON u2.id = tp.mng_id
        WHERE r.name = 'tp_emp' AND u1.id = ?""",
        (id, )
    ).fetchone()

    return dict(tp_mng_acc)


def get_cp_emp(id):
    cp_mng_acc = get_db().execute(
        """SELECT u1.id, u1.name, u1.username, cp.name as assigned_consolidation_point, u2.name as supervisor_name 
        FROM user u1
        INNER JOIN role r ON r.id = u1.role_id
        LEFT JOIN user u2 ON u1.supervisor_id = u2.id
        LEFT JOIN consol_point cp ON u2.id = cp.mng_id
        WHERE r.name = 'cp_emp' AND u1.id = ?""",
        (id, )
    ).fetchone()

    return dict(cp_mng_acc)


def get_tp_mng(id):

    tp_mng = get_db().execute(
        """SELECT u1.id, u1.name, u1.username, tp.name as assigned_trading_point, u2.name as supervisor_name
        FROM user u1
        INNER JOIN user u2 ON u1.supervisor_id = u2.id
        INNER JOIN trade_point tp ON tp.mng_id = u1.id
        WHERE u1.id = ?""",
        (id, )).fetchone()

    return dict(tp_mng)


def get_cp_mng(id):

    cp_mng = get_db().execute(
        """SELECT u1.id, u1.name, u1.username, cp.name as assigned_consolidation_point, u2.name as supervisor_name
        FROM user u1
        INNER JOIN user u2 ON u1.supervisor_id = u2.id
        INNER JOIN consol_point cp ON cp.mng_id = u1.id
        WHERE u1.id = ?""",
        (id, )).fetchone()

    return dict(cp_mng)


@account_bp.get('/tp-mngs')  # query string: type
@cross_origin(supports_credentials=True)
@login_required2('senior_mng')
def get_tp_mngs():

    property = request.args.get('property')

    try:
        if property == 'assigned_trading_point':

            unassigned_tps = get_db().execute(
                "SELECT name FROM trade_point WHERE mng_id IS NULL",
            ).fetchall()

            return {
                "status": "success",
                "data": {
                    property: [row['name'] for row in unassigned_tps]
                }
            }

        tp_mng_accs = get_db().execute(
            """SELECT u1.id, u1.name, u1.username, tp.name as assigned_trading_point, u2.name as supervisor_name 
            FROM user u1
            INNER JOIN role r ON r.id = u1.role_id
            LEFT JOIN user u2 ON u1.supervisor_id = u2.id
            LEFT JOIN trade_point tp ON u1.id = tp.mng_id
            WHERE r.name='tp_mng'"""
        ).fetchall()  # Unassigned accounts also

        return {
            "status": "success",
            # generalized condition: no wrap here
            "data": [dict(row) for row in tp_mng_accs]
        }

    except Exception as e:
        return handle_exception(e)


@account_bp.post('/tp-mngs')  # query string: type
@cross_origin(supports_credentials=True)
@login_required2('senior_mng')
def create_tp_mng():

    # ! in js fetch() FE, I wrap everything inside 'data' key
    data = json.loads(request.data)['data']

    try:
        # BE validation
        if not data['name'] or not data['password'] or not data['username'] or not data['assigned_trading_point'] or not data['supervisor_id']:

            return {
                'status': 'fail',
                'data': {
                    'msg': 'Missing field. Please check again.'
                }
            }

        role = get_db().execute("SELECT id FROM role WHERE name = 'tp_mng'").fetchone()

        get_db().execute(
            """INSERT INTO user (username, pwdhash, name, role_id, supervisor_id)
            VALUES (?, ?, ?, ?, ?)""",
            (data['username'], generate_password_hash(
                data['password']), data['name'], role['id'], data['supervisor_id'], ))

        tp_mng = get_db().execute(
            "SELECT id FROM user ORDER BY id DESC LIMIT 1;"
        ).fetchone()

        get_db().execute(
            """UPDATE trade_point
                SET mng_id = ?
                WHERE name = ?""", (tp_mng['id'], data['assigned_trading_point']))

        get_db().commit()  # ! never forget this line

        return {
            "status": "success",
            "data": {
                "msg": f"Trading Point Manager {tp_mng['id']} created successfully!",
                "id": tp_mng['id'],
                "item": get_tp_mng(tp_mng['id'])
            }
        }

    except Exception as e:
        return handle_exception(e)


@account_bp.put('/tp-mngs/<int:id>')  # query string: type
@cross_origin(supports_credentials=True)
@login_required2('senior_mng')
def update_tp_mng(id):

    # ! in js fetch() FE, I wrap everything inside 'data' key
    data = json.loads(request.data)['data']

    try:
        # BE validation
        if not data['name'] or not data['username'] or not data['password'] or not data['assigned_trading_point']:
            return {
                "status": "fail",
                "data": {
                    "msg": "Missing fields. Please check again."
                }
            }

        # unassigned current mng_id first
        get_db().execute(
            """UPDATE trade_point
                SET mng_id = NULL
                WHERE mng_id = ?
            """, (id, ))

        # then reassigned new mnd_id (it might be the old one, but I don't have the mechanism to tell its difference)
        get_db().execute(
            """UPDATE trade_point
                SET mng_id = ?
                WHERE name = ?""", (id, data['assigned_trading_point'], )
        )

        get_db().execute(
            """UPDATE user
                SET name = ?,
                    username = ?,
                    pwdhash = ?
                WHERE id = ?""",
            (data['name'], data['username'], generate_password_hash(data['password']), id, ))

        get_db().commit()

        return {
            "status": "success",
            "data": {
                "msg": f"Trading Point Manager Account ID: {id} edited successfully!",
                "item": get_tp_mng(id)
            }
        }

    except Exception as e:
        return handle_exception(e)


@account_bp.delete('/tp-mngs/<int:id>')  # query string: type
@cross_origin(supports_credentials=True)
@login_required2('senior_mng')
def delete_tp_mng(id):

    try:
        # This might not work, since I've put DELETE RESTRICT on supervisor_id
        # Any account that is not supervising anyone can be deleted
        get_db().execute("DELETE FROM user WHERE id = ?", (id, ))
        get_db().commit()

        return {
            "status": "success",
            "data": {
                "msg": f"Trading Point Manager Account ID: {id} deleted successfully!",
            }
        }

    except Exception as e:
        return handle_exception(e)

# ######################################################################


@account_bp.get('/cp-mngs')  # query string: type
@cross_origin(supports_credentials=True)
@login_required2('senior_mng')
def get_cp_mngs():
    property = request.args.get('property')

    try:
        if property == 'assigned_consolidation_point':

            unassigned_cps = get_db().execute(
                "SELECT name FROM consol_point WHERE mng_id IS NULL",
            ).fetchall()

            return {
                "status": "success",
                "data": {
                    property: [row['name'] for row in unassigned_cps]
                }
            }

        cp_mng_accs = get_db().execute(
            """SELECT u1.id, u1.name, u1.username, cp.name as assigned_consolidation_point, u2.name as supervisor_name 
            FROM user u1
            INNER JOIN role r ON r.id = u1.role_id
            LEFT JOIN user u2 ON u1.supervisor_id = u2.id
            LEFT JOIN consol_point cp ON u1.id = cp.mng_id
            WHERE r.name='cp_mng'"""
        ).fetchall()  # Unassigned accounts also

        return {
            "status": "success",
            # generalized condition: no wrap here
            "data": [dict(row) for row in cp_mng_accs]
        }

    except Exception as e:
        return handle_exception(e)


@account_bp.post('/cp-mngs')  # query string: type
@cross_origin(supports_credentials=True)
@login_required2('senior_mng')
def create_cp_mng():

    # ! in js fetch() FE, I wrap everything inside 'data' key
    data = json.loads(request.data)['data']

    try:
        # BE validation
        if not data['name'] or not data['password'] or not data['username'] or not data['assigned_consolidation_point'] or not data['supervisor_id']:

            return {
                'status': 'fail',
                'data': {
                    'msg': 'Missing field. Please check again.'
                }
            }

        role = get_db().execute("SELECT id FROM role WHERE name = 'cp_mng'").fetchone()

        get_db().execute(
            """INSERT INTO user (username, pwdhash, name, role_id, supervisor_id)
            VALUES (?, ?, ?, ?, ?)""",
            (data['username'], generate_password_hash(
                data['password']), data['name'], role['id'], data['supervisor_id'], ))

        cp_mng = get_db().execute(
            "SELECT id FROM user ORDER BY id DESC LIMIT 1;"
        ).fetchone()

        get_db().execute(
            """UPDATE consol_point
                SET mng_id = ?
                WHERE name = ?""", (cp_mng['id'], data['assigned_consolidation_point'], ))

        get_db().commit()  # ! never forget this line

        return {
            "status": "success",
            "data": {
                "msg": f"Consolidation Point Manager {cp_mng['id']} created successfully!",
                "id": cp_mng['id'],
                "item": get_cp_mng(cp_mng['id'])
            }
        }

    except Exception as e:
        return handle_exception(e)


@account_bp.put('/cp-mngs/<int:id>')  # query string: type
@cross_origin(supports_credentials=True)
@login_required2('senior_mng')
def update_cp_mng(id):

    # ! in js fetch() FE, I wrap everything inside 'data' key
    data = json.loads(request.data)['data']

    try:
        # BE validation
        if not data['name'] or not data['username'] or not data['password'] or not data['assigned_consolidation_point']:
            return {
                "status": "fail",
                "data": {
                    "msg": "Missing fields. Please check again."
                }
            }

        # unassigned current mng_id
        get_db().execute(
            """UPDATE consol_point
                SET mng_id = NULL
                WHERE mng_id = ?
            """, (id, ))

        # reassigned new mnd_id (it might be the old one, but I don't have the mechanism to tell its difference)
        get_db().execute(
            """UPDATE consol_point
                SET mng_id = ?
                WHERE name = ?""", (id, data['assigned_consolidation_point'], )
        )

        get_db().execute(
            """UPDATE user
                SET name = ?,
                    username = ?,
                    pwdhash = ?
                WHERE id = ?""",
            (data['name'], data['username'], generate_password_hash(data['password']), id, ))

        get_db().commit()

        return {
            "status": "success",
            "data": {
                "msg": f"Consolidation Point Manager Account ID: {id} edited successfully!",
                "item": get_cp_mng(id)
            }
        }

    except Exception as e:
        return handle_exception(e)


@account_bp.delete('/cp-mngs/<int:id>')  # query string: type
@cross_origin(supports_credentials=True)
@login_required2('senior_mng')
def delete_cp_mng(id):

    try:
        # This might not work, since I've put DELETE RESTRICT on supervisor_id
        # Any account that is not supervising anyone can be deleted
        get_db().execute("DELETE FROM user WHERE id = ?", (id, ))
        get_db().commit()

        return {
            "status": "success",
            "data": {
                "msg": f"Consolidation Point Manager Account ID: {id} deleted successfully!",
            }
        }

    except Exception as e:
        return handle_exception(e)

# ######################################################################


@account_bp.get('/tp-mngs/<int:mng_id>/emps')  # query string: type
@cross_origin(supports_credentials=True)
@login_required2('tp_mng')
def get_tp_emps(mng_id):

    print(mng_id)

    try:
        tp_mng_accs = get_db().execute(
            """SELECT u1.id, u1.name, u1.username, tp.name as assigned_trading_point, u2.name as supervisor_name 
            FROM user u1
            INNER JOIN role r ON r.id = u1.role_id
            LEFT JOIN user u2 ON u1.supervisor_id = u2.id
            LEFT JOIN trade_point tp ON u2.id = tp.mng_id
            WHERE r.name = 'tp_emp' AND u2.id = ?""",  # ! DO NOT USE tp.mng_id, if the emp's manager hasn't been assigned to a point yet, this query will return []
            (mng_id, )
        ).fetchall()  # Unassigned accounts also

        print(tp_mng_accs)

        return {
            "status": "success",
            # generalized condition: no wrap here
            "data": [dict(row) for row in tp_mng_accs]
        }

    except Exception as e:
        return handle_exception(e)


@account_bp.post('/tp-mngs/<int:mng_id>/emps')
@cross_origin(supports_credentials=True)
@login_required2('tp_mng')
def create_tp_emp(mng_id):

    data = json.loads(request.data)['data']

    try:

        role = get_db().execute("SELECT id FROM role WHERE name = 'tp_emp'").fetchone()

        get_db().execute(
            """INSERT INTO user (username, pwdhash, name, role_id, supervisor_id)
            VALUES (?, ?, ?, ?, ?)""",
            (data['username'], generate_password_hash(
                data['password']), data['name'], role['id'], data['supervisor_id'], )
        )

        tp_emp = get_db().execute(
            """SELECT id FROM user ORDER BY id DESC LIMIT 1"""
        ).fetchone()

        get_db().commit()

        return {
            "status": "success",
            "data": {
                "msg": f"Consolidation point employee {data['name']} created successfully!",
                "item": get_tp_emp(tp_emp['id'])
            }
        }

    except Exception as e:
        return handle_exception(e)


@account_bp.put('/tp-mngs/<int:mng_id>/emps/<int:emp_id>')
@cross_origin(supports_credentials=True)
@login_required2('tp_mng')
def change_tp_emp(mng_id, emp_id):

    data = json.loads(request.data)['data']

    try:
        get_db().execute("""
            UPDATE user
                SET name = ?,
                    username = ?,
                    pwdhash = ?
            WHERE id = ? AND supervisor_id = ?
                         """,
                         (data['name'], data['username'], generate_password_hash(data['password']), emp_id, mng_id, ))

        get_db().commit()

        return {
            "status": "success",
            "data": {
                "msg": f'Trade point employee ID: {emp_id} updated successfully!',
                "item": get_tp_emp(emp_id)
            }
        }

    except Exception as e:
        return handle_exception(e)


@account_bp.delete('/tp-mngs/<int:mng_id>/emps/<int:emp_id>')
@cross_origin(supports_credentials=True)
@login_required2('tp_mng')
def delete_tp_emp(mng_id, emp_id):
    try:
        get_db().execute("DELETE FROM user WHERE id = ? AND supervisor_id = ?", (emp_id, mng_id, ))
        get_db().commit()

        return {
            "status": "success",
            "data": {
                "msg": f"Trading Point Employee Account ID: {emp_id} deleted successfully!",
            }
        }

    except Exception as e:
        return handle_exception(e)

# ######################################################################


@account_bp.get('/cp-mngs/<int:mng_id>/emps')  # query string: type
@cross_origin(supports_credentials=True)
@login_required2('cp_mng')
def get_cp_emps(mng_id):
    try:
        cp_mng_accs = get_db().execute(
            """SELECT u1.id, u1.name, u1.username, cp.name as assigned_consolidation_point, u2.name as supervisor_name 
            FROM user u1
            INNER JOIN role r ON r.id = u1.role_id
            LEFT JOIN user u2 ON u1.supervisor_id = u2.id
            LEFT JOIN consol_point cp ON u2.id = cp.mng_id
            WHERE r.name = 'cp_emp' AND u2.id = ?""",  # ! Same as above at get_tp_emps()
            (mng_id, )
        ).fetchall()  # Unassigned accounts also

        return {
            "status": "success",
            # generalized condition: no wrap here
            "data": [dict(row) for row in cp_mng_accs]
        }

    except Exception as e:
        return handle_exception(e)


@account_bp.post('/cp-mngs/<int:mng_id>/emps')
@cross_origin(supports_credentials=True)
@login_required2('cp_mng')
def create_cp_emp(mng_id):

    data = json.loads(request.data)['data']

    try:

        role = get_db().execute("SELECT id FROM role WHERE name = 'cp_emp'").fetchone()

        get_db().execute(
            """INSERT INTO user (username, pwdhash, name, role_id, supervisor_id)
            VALUES (?, ?, ?, ?, ?)""",
            (data['username'], generate_password_hash(
                data['password']), data['name'], role['id'], data['supervisor_id'], )
        )

        cp_emp = get_db().execute(
            """SELECT id FROM user ORDER BY id DESC LIMIT 1"""
        ).fetchone()

        get_db().commit()

        return {
            "status": "success",
            "data": {
                "msg": f"Consolidation point employee {data['name']} created successfully!",
                "item": get_cp_emp(cp_emp['id'])
            }
        }

    except Exception as e:
        return handle_exception(e)


@account_bp.put('/cp-mngs/<int:mng_id>/emps/<int:emp_id>')
@cross_origin(supports_credentials=True)
@login_required2('cp_mng')
def change_cp_emp(mng_id, emp_id):
    data = json.loads(request.data)['data']

    try:
        get_db().execute("""
            UPDATE user
                SET name = ?,
                    username = ?,
                    pwdhash = ?
            WHERE id = ? AND supervisor_id = ?
                         """,
                         (data['name'], data['username'], generate_password_hash(data['password']), emp_id, mng_id, ))

        get_db().commit()

        return {
            "status": "success",
            "data": {
                "msg": f'Consolidation point employee ID: {emp_id} updated successfully!',
                "item": get_cp_emp(emp_id)
            }
        }

    except Exception as e:
        return handle_exception(e)


@account_bp.delete('/cp-mngs/<int:mng_id>/emps/<int:emp_id>')
@cross_origin(supports_credentials=True)
@login_required2('cp_mng')
def delete_cp_emp(mng_id, emp_id):
    try:
        get_db().execute("DELETE FROM user WHERE id = ? AND supervisor_id = ?", (emp_id, mng_id, ))

        get_db().commit()  # Missing this line, always

        return {
            "status": "success",
            "data": {
                "msg": f"Consolidation Point Employee Account ID: {emp_id} deleted successfully!",
            }
        }

    except Exception as e:
        return handle_exception(e)
