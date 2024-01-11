import json
from flask import (
    Blueprint, request, session, url_for
)
from flask_cors import cross_origin

from main.auth.routes import login_required2
from main.db import get_db

from main.helper.res_template import (
    be_validate, res_missing, res_invalid, handle_exception
)

point_bp = Blueprint('points', __name__, url_prefix='/api')

GET_ALL_TRADE_POINTS_SQL = \
    """SELECT tp.id, tp.name as trade_name,
            a.address, a.ward, a.district, a.city,
            u.name as user_name,
            cp.name as consolidation_name
    FROM trade_point tp
    LEFT JOIN address a ON tp.address_id = a.id
    LEFT JOIN consol_point cp ON tp.cp_id = cp.id
    LEFT JOIN user u on tp.mng_id = u.id"""

GET_ALL_CONSOL_POINTS_SQL = \
    """SELECT cp.id, cp.name as consolidation_name, 
        a.address, a.ward, a.district, a.city, 
        u.name as user_name, 
        REPLACE(GROUP_CONCAT(DISTINCT tp.name), ',', ' ----- ') as trade_name_list
    FROM consol_point cp 
    LEFT JOIN address a ON cp.address_id = a.id 
    LEFT JOIN user u ON cp.mng_id = u.id 
    LEFT JOIN trade_point tp ON tp.cp_id = cp.id 
    GROUP BY cp.id"""


def get_all_trade_points():
    trade_points = get_db().execute(GET_ALL_TRADE_POINTS_SQL)

    if not trade_points:
        return None

    return [dict(row) for row in trade_points]


def get_all_consol_points():
    consol_points = get_db().execute(GET_ALL_CONSOL_POINTS_SQL)

    if not consol_points:
        return None

    return [dict(row) for row in consol_points]


def get_trade_point(id):

    # tp.id, a.address, a.ward, a.district, a.ward, a.city, u.name, cp.name
    trade_point = get_db().execute(
        GET_ALL_TRADE_POINTS_SQL + ' WHERE tp.id = ?', (id, )).fetchone()

    if not trade_point:
        return None

    return dict(trade_point)


def get_consol_point(id):

    # ! Remember: it's HAVING, not WHERE, since GET_ALL_CONSOL_POINTS_SQL use GROUP BY
    consol_point = get_db().execute(
        GET_ALL_CONSOL_POINTS_SQL + ' HAVING cp.id = ?', (id, )
    ).fetchone()

    if not consol_point:
        return None

    return dict(consol_point)


@point_bp.get('/')
@cross_origin(supports_credentials=True)
@login_required2('senior_mng')
def get_both_points():
    pass


@point_bp.get('/trades')
@cross_origin(supports_credentials=True)
@login_required2('senior_mng')
def get_trade_points():

    try:
        property = request.args.get('property')  # noneable

        if property == 'consolidation_name':

            names = get_db().execute(
                "SELECT DISTINCT name FROM consol_point").fetchall()

            return {
                "status": "success",
                "data": {
                    property: [row['name'] for row in names]
                }
            }

        if property == 'user_name':

            unassigned_tp_mngs = get_db().execute(
                """SELECT u.name 
                FROM user u 
                LEFT JOIN trade_point tp ON u.id = tp.mng_id 
                LEFT JOIN role r ON u.role_id = r.id 
                WHERE r.name = 'tp_mng' and tp.mng_id is null"""
            ).fetchall()

            # print([dict(row) for row in data]) # debug

            return {
                "status": "success",
                "data": {
                    property: [row['name'] for row in unassigned_tp_mngs]
                }
            }

        if property == 'id':

            user_id = request.args.get('mng_id')

            tp = get_db().execute(
                "SELECT tp.id FROM trade_point tp INNER JOIN user u ON tp.mng_id = u.id WHERE u.id = ?", (user_id, )).fetchone()

            return {
                "status": "success",
                "data": {
                    property: tp['id']
                }
            }

        trade_points = get_db().execute(
            GET_ALL_TRADE_POINTS_SQL
        ).fetchall()

        return {
            "status": "success",
            # generalized condition: no wrap here
            "data": [dict(row) for row in trade_points]
        }

    except Exception as e:
        return handle_exception(e)


@point_bp.get('/consols')
@cross_origin(supports_credentials=True)
@login_required2('senior_mng')
def get_consol_points():

    try:
        property = request.args.get('property')

        if property == 'user_name':

            unassigned_cp_mngs = get_db().execute(
                """SELECT u.name 
                FROM user u 
                LEFT JOIN consol_point cp ON u.id = cp.mng_id 
                LEFT JOIN role r ON u.role_id = r.id
                WHERE r.name = 'cp_mng' and cp.mng_id is null"""
            ).fetchall()

            return {
                "status": "success",
                "data": {
                    property: [row['name'] for row in unassigned_cp_mngs]
                }
            }

        consol_points = get_db().execute(
            GET_ALL_CONSOL_POINTS_SQL
        ).fetchall()

        return {
            "status": "success",
            "data": [dict(row) for row in consol_points]
        }
    except Exception as e:

        print(e)

        return {
            "status": "fail",
            "data": {
                "msg": f"Server error: {str(e)}. Please check server logs."
            }
        }, 500

####################################################################


@point_bp.post('/trades')
@cross_origin(supports_credentials=True)
@login_required2('senior_mng')
def create_trade_point():

    # ! in js fetch() FE, I wrap everything inside 'data' key
    data = json.loads(request.data)['data']

    try:
        # BE validation
        if not be_validate(data['trade_name'],
                           data['address'],
                           data['ward'],
                           data['district'],
                           data['city'],
                           data['consolidation_name']):
            return res_missing()

        get_db().execute(
            "INSERT INTO address (address, ward, district, city) VALUES (?, ?, ?, ?)", (
                data['address'], data['ward'], data['district'], data['city'], )
        )

        address = get_db().execute(
            "SELECT id FROM address ORDER BY id DESC LIMIT 1;"
        ).fetchone()

        cp = get_db().execute(
            "SELECT id FROM consol_point WHERE name = ?",
            (data['consolidation_name'], )
        ).fetchone()  # ! trailing comma is needed to make a tuple

        user = None
        if data['user_name']:
            user = get_db().execute(
                "SELECT id FROM user WHERE name = ?",
                (data['user_name'], )
            ).fetchone()  # ! this is optional, so it might return null

        get_db().execute(
            "INSERT INTO trade_point (name, mng_id, cp_id, address_id)\
            VALUES (?, ?, ?, ?)",
            (data['trade_name'], None if not user else user['id'], cp['id'], address['id'], ))

        # print('yes')

        tp = get_db().execute(
            "SELECT id FROM trade_point ORDER BY id DESC LIMIT 1;"
        ).fetchone()

        get_db().commit()  # ! you must never forget this

        return {
            "status": "success",
            "data": {
                "msg": f"Trade Point ID: {tp['id']} created successfully!",
                "id": tp['id'],
                "item": get_trade_point(tp['id'])
            }
        }

    except Exception as e:
        return handle_exception(e)


@point_bp.put('/trades/<int:id>')
@cross_origin(supports_credentials=True)
@login_required2('senior_mng')
def update_trade_point(id):

    # ! in js fetch() FE, I wrap everything inside 'data' key
    data = json.loads(request.data)['data']

    try:
        # BE validation
        if not be_validate(data['trade_name'],
                           data['address'],
                           data['ward'],
                           data['district'],
                           data['city'],
                           data['consolidation_name']):
            return res_missing()

        address = get_db().execute(
            """SELECT a.id
            FROM address a
            JOIN trade_point tp ON tp.address_id = a.id
            WHERE tp.id = ?""", (id, )).fetchone()

        get_db().execute(
            """UPDATE address
            SET address = ?,
                ward = ?,
                district = ?,
                city = ?
            WHERE id = ?""", (data['address'], data['ward'], data['district'], data['city'], address['id'], ))

        user = None
        if data['user_name']:
            user = get_db().execute(
                "SELECT id FROM user WHERE name = ?",
                (data['user_name'], )
            ).fetchone()  # ! this is optional, so it might return null

        consol_point = get_db().execute(
            """SELECT id FROM consol_point WHERE name = ?""", (data['consolidation_name'], )).fetchone()

        get_db().execute(
            """UPDATE trade_point
            SET mng_id = ?,
                cp_id = ?,
                name = ?
            WHERE id = ?""", (None if not user else user['id'], consol_point['id'], data['trade_name'], id, ))

        get_db().commit()  # ! you must never forget this

        return {
            "status": "success",
            "data": {
                "msg": f"Trade Point ID: {id} edited successfully!",
                "item": get_trade_point(id)
            }
        }

    except Exception as e:
        return handle_exception(e)


@point_bp.delete('/trades/<int:id>')
@cross_origin(supports_credentials=True)
@login_required2('senior_mng')
def delete_trade_point(id):

    # no need get req body here

    try:

        get_db().execute(
            """DELETE FROM trade_point WHERE id = ?""", (id, )
        )

        # ! In Database, I will use trigger to delete the remaining associated data, like address

        get_db().commit()  # ! you must never forget this

        return {
            "status": "success",
            "data": {
                "msg": f"Trade Point ID:{id} removed successfully."
            }
        }, 200  # ! DO NOT set to 204, they aren't allowed to include response body

    except Exception as e:
        return handle_exception(e)

###################################################################


@point_bp.post('/consols')
@cross_origin(supports_credentials=True)
@login_required2('senior_mng')
def create_consol_point():

    # ! in js fetch() FE, I wrap everything inside 'data' key
    data = json.loads(request.data)['data']

    try:
        # BE validation

        if not be_validate(data['consolidation_name'],
                           data['address'],
                           data['ward'],
                           data['district'],
                           data['city']):
            return res_missing()

        get_db().execute(
            "INSERT INTO address (address, ward, district, city) VALUES (?, ?, ?, ?)", (
                data['address'], data['ward'], data['district'], data['city'], )
        )

        address = get_db().execute(
            "SELECT id FROM address ORDER BY id DESC LIMIT 1;"
        ).fetchone()

        user = None
        if data['user_name']:
            user = get_db().execute(
                "SELECT id FROM user WHERE name = ?",
                (data['user_name'], )
            ).fetchone()  # ! this is optional, so it might return null

        get_db().execute(
            "INSERT INTO consol_point (name, mng_id, address_id)\
            VALUES (?, ?, ?)",
            (data['consolidation_name'], None if not user else user['id'], address['id'], ))

        # print('yes') # debug

        cp = get_db().execute(
            "SELECT id FROM consol_point ORDER BY id DESC LIMIT 1;"
        ).fetchone()

        get_db().commit()  # ! you must never forget this

        return {
            "status": "success",
            "data": {
                "msg": f"Consolidation point ID: {cp['id']} created successfully!",
                "id": cp['id'],
                "item": get_consol_point(cp['id'])
            }
        }, 201

    except Exception as e:
        return handle_exception(e)


@point_bp.put('/consols/<int:id>')
@cross_origin(supports_credentials=True)
@login_required2('senior_mng')
def update_consol_point(id):

    # ! in js fetch() FE, I wrap everything inside 'data' key
    data = json.loads(request.data)['data']

    try:
        # BE validation
        if not be_validate(data['consolidation_name'],
                           data['address'],
                           data['ward'],
                           data['district'],
                           data['city']):
            return res_missing()

        address = get_db().execute(
            """SELECT a.id
            FROM address a
            JOIN consol_point cp ON cp.address_id = a.id
            WHERE cp.id = ?""", (id, )).fetchone()

        get_db().execute(
            """UPDATE address
            SET address = ?,
                ward = ?,
                district = ?,
                city = ?
            WHERE id = ?""", (data['address'], data['ward'], data['district'], data['city'], address['id'], ))

        user = None
        if data['user_name']:
            user = get_db().execute(
                "SELECT id FROM user WHERE name = ?",
                (data['user_name'], )
            ).fetchone()  # ! this is optional, so it might return null

        get_db().execute(
            """UPDATE consol_point
            SET mng_id = ?,
                name = ?
            WHERE id = ?""", (None if not user else user['id'], data['consolidation_name'], id, ))

        get_db().commit()  # ! you must never forget this

        return {
            "status": "success",
            "data": {
                "msg": f"Consolidation Point ID: {id} edited successfully!",
                "item": get_consol_point(id)
            }
        }

    except Exception as e:
        return handle_exception(e)


@point_bp.delete('/consols/<int:id>')
@cross_origin(supports_credentials=True)
@login_required2('senior_mng')
def delete_consol_point(id):

    # no need get req body here

    try:

        get_db().execute(
            """DELETE FROM consol_point WHERE id = ?""", (id, )
        )

        get_db().commit()  # ! you must never forget this

        return {
            "status": "success",
            "data": {
                "msg": f"Consolidation Point ID:{id} removed successfully."
            }
        }, 200  # ! DO NOT set to 204, they aren't allowed to include response body

    except Exception as e:
        return handle_exception(e)


###################################################################

@point_bp.get('/trades/stats')
@cross_origin(supports_credentials=True)
@login_required2('senior_mng')
def get_all_trades_stats():

    # no need query string here

    try:
        all_tp_total_sent = get_db().execute(
            """SELECT tp.id, tp.name, COUNT(*) as total
            FROM package_status ps 
            INNER JOIN trade_point tp ON ps.sender_id = tp.id
            WHERE ps.type='sent' AND ps.sender_subject = 'tp' AND ps.status = 'success' 
            GROUP BY name
            ORDER BY timestamp DESC
            """
        ).fetchall()  # time_interval if '' gonna return all timestamp

        all_tp_total_received = get_db().execute(
            """SELECT tp.id, tp.name, COUNT(*) as total
            FROM package_status ps
            INNER JOIN trade_point tp on ps.sender_id = tp.id
            WHERE ps.type='received' AND ps.receiver_subject = 'tp' AND ps.status = 'success'
            GROUP BY name
            ORDER BY timestamp DESC
            """
        ).fetchall()

        return {
            "status": "success",
            "data": {
                "msg": "All trade points statistics retrieved successfully!",
                "stats": {
                    "sent": [dict(row) for row in all_tp_total_sent],
                    "received": [dict(row) for row in all_tp_total_received]
                }
            }
        }

    except Exception as e:
        return handle_exception(e)


@point_bp.get('/trades/<int:id>/stats')
@cross_origin(supports_credentials=True)
@login_required2('senior_mng', 'tp_mng')
def get_one_trade_stats(id):

    # required (when filter by senior_mng)
    # optional (when fetch all time by tp_mng)
    # dir = request.args.get('dir')

    # optional (when filter by senior_mng)
    # year = request.args.get('year')
    # month = request.args.get('month')
    # # day = request.args.get('day')

    # pattern = ''
    # pattern += '%Y' if year else ''
    # pattern += '-%m' if month else ''
    # # pattern += '-%d' if day else ''

    # valuePattern = ''
    # valuePattern += year if year else ''
    # valuePattern += '-' + (f'0{month}' if int(month)
    #                        < 10 else month) if month else ''

    # print(valuePattern)

    try:
        one_tp_total_sent = get_db().execute(
            """SELECT tp.id, tp.name, strftime('%Y-%m', timestamp) as time_interval, COUNT(*) as total
            FROM package_status ps 
            INNER JOIN trade_point tp ON ps.sender_id = tp.id
            WHERE ps.type='sent' AND ps.status = 'success' AND ps.sender_subject = 'tp' AND tp.id = ?
            GROUP BY name, time_interval
            ORDER BY timestamp DESC
            """, (id, )
        ).fetchall()

        one_tp_total_received = get_db().execute(
            """SELECT tp.id, tp.name, strftime('%Y-%m', timestamp) as time_interval, COUNT(*) as total
            FROM package_status ps
            INNER JOIN trade_point tp ON ps.receiver_id = tp.id
            WHERE ps.type='received' AND ps.status = 'success' AND ps.receiver_subject = 'tp' AND tp.id = ?
            GROUP BY name, time_interval
            ORDER BY timestamp DESC
            """, (id, )
        ).fetchall()

        return {
            "status": "success",
            "data": {
                "msg": f"Trade point ID: {id} statistics retrieved successfully!",
                "stats": {
                    "sent": [dict(row) for row in one_tp_total_sent],
                    "received": [dict(row) for row in one_tp_total_received]
                }
            }
        }

    except Exception as e:
        return handle_exception(e)


@point_bp.get('/consols/stats')
@cross_origin(supports_credentials=True)
@login_required2('senior_mng')
def get_all_consol_stats():

    # no need query string

    try:
        all_cp_total_sent = get_db().execute(
            """SELECT cp.id, cp.name, COUNT(*) as total
            FROM package_status ps
            INNER JOIN consol_point cp ON ps.sender_id = cp.id
            WHERE ps.type='sent' AND ps.status = 'success' AND ps.sender_subject = 'cp'
            GROUP BY name
            ORDER BY timestamp DESC""",
        ).fetchall()

        all_cp_total_received = get_db().execute(
            """SELECT cp.id, cp.name, COUNT(*) as total
            FROM package_status ps
            INNER JOIN consol_point cp ON ps.receiver_id = cp.id
            WHERE ps.type='received' AND ps.status = 'success' AND ps.receiver_subject = 'cp'
            GROUP BY name
            ORDER BY timestamp DESC""",
        ).fetchall()

        return {
            "status": "success",
            "data": {
                "msg": "All consol points statistics retrieved successfully!",
                "stats": {
                    "sent": [dict(row) for row in all_cp_total_sent],
                    "received": [dict(row) for row in all_cp_total_received]
                }
            }
        }

    except Exception as e:
        return handle_exception(e)


@point_bp.get('/consols/<int:id>/stats')
@cross_origin(supports_credentials=True)
@login_required2('senior_mng', 'cp_mng')
def get_one_consol_stats(id):

    # required (when filter by senior_mng)
    # optional (when fetch all time by cp_mng)
    # dir = request.args.get('dir')

    # optional (when filter by senior_mng)
    # year = request.args.get('year')
    # month = request.args.get('month')
    # # day = request.args.get('day')

    # pattern = ''
    # pattern += '%Y' if year else ''
    # pattern += '-%m' if month else ''
    # # pattern += '-%d' if day else ''

    # valuePattern = ''
    # valuePattern += year if year else ''
    # valuePattern += '-' + (f'0{month}' if int(month)
    #                        < 10 else month) if month else ''

    # print(valuePattern)

    try:
        one_cp_total_sent = get_db().execute(
            """SELECT cp.id, cp.name, strftime('%Y-%m', timestamp) as time_interval, COUNT(*) as total
            FROM package_status ps 
            INNER JOIN consol_point cp ON ps.sender_id = cp.id
            WHERE ps.type='sent' AND ps.status = 'success' AND ps.sender_subject = 'cp' AND cp.id = ?
            GROUP BY name, time_interval
            ORDER BY timestamp DESC
            """, (id, )
        ).fetchall()

        one_cp_total_received = get_db().execute(
            """SELECT cp.id, cp.name, strftime('%Y-%m', timestamp) as time_interval, COUNT(*) as total 
            FROM package_status ps
            INNER JOIN consol_point cp ON ps.receiver_id = cp.id
            WHERE ps.type='received' AND ps.status = 'success' AND ps.receiver_subject = 'cp' AND cp.id = ?
            GROUP BY name, time_interval
            ORDER BY timestamp DESC
            """, (id, )
        ).fetchall()

        return {
            "status": "success",
            "data": {
                "msg": f"Consol point ID {id} statistics retrieved successfully!",
                "stats": {
                    "sent": [dict(row) for row in one_cp_total_sent],
                    "received": [dict(row) for row in one_cp_total_received]
                }
            }
        }

    except Exception as e:
        return handle_exception(e)

###################################################################
# ! Just in case the @login_required2() and @cross_origin() not working

# @point_bp.route('/create')
# @cross_origin(supports_credentials=True)
# def create_trade_point():

#     if not session['user']:
#         return {
#             "status": "fail",
#             "data": {
#                 "msg": "Login is required."
#             }
#         }

#     if session['user'] and session['user']['role'] is not ['senior_mng']:
#         return {
#             'status': 'fail',
#             'data': {
#                 'msg': "Unauthorized access."
#             }
#         }, 401

#     credential = json.loads(request.data)
#     type = credential['type']

#     if type not in ['trade', 'consol']:
#         return {
#             'success': 'failed',
#             'data': {
#                 'msg': "Type is not supported."
#             }
#         }

    # name = request.form['name']
    # mng_id = request.form['mng_id']
    # address_id = request.form['address_id']
    # cp_id = request.form['cp_id']

    # get_db().execute("INSERT INTO trade_point (name, mng_id, cp_id, address_id) VALUES (?, ?, ?, ?)",
    #                  (name, mng_id, cp_id, address_id, ))

    # get_db().commit()

    # return {
    #     "status": "success",
    #     "data": {
    #         "msg": "Trade point created successfully!"
    #     }
    # }
