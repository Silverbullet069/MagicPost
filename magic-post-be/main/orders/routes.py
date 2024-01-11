

import json
from flask import (
    Blueprint, request, session
)
from flask_cors import cross_origin

from main.db import get_db
from main.auth.routes import login_required2

order_bp = Blueprint('order', __name__, url_prefix='/api/orders')

# For customer, no need login required


@order_bp.get('/<int:id>')
@cross_origin(supports_credentials=True)
def get_order(id):

    try:
        order = get_db().execute(
            "SELECT id FROM package WHERE id = ?", (id, )
        ).fetchone()

        if not order:
            return {
                "status": "fail",
                "data": {
                    "msg": 'Id not right. Please try again.'
                }
            }

        # order_info = get_db().execute(
        #     """SELECT p.id, p.created_at, p.info, p.weight, p.charge,
        #         u1.name as tp_emp_name, tp.name as trade_point_name,
        #         c1.name as sender_name, c2.name as receiver_name
        #         FROM package p
        #         INNER JOIN user u1 ON p.tp_emp_id = u1.id
        #         INNER JOIN user u2 ON u1.supervisor_id = u2.id
        #         INNER JOIN trade_point tp ON tp.mng_id = u2.id
        #         INNER JOIN customer c1 ON p.customer_sender_id = c1.id AND c1.type = 'sender'
        #         INNER JOIN customer c2 ON p.customer_receiver_id = c2.id AND c2.type = 'receiver'
        #         WHERE p.id = ?
        #         """, (id, )
        # ).fetchone()

        order_status = get_db().execute(
            """SELECT ps.timestamp, ps.type, ps.status, tp.name as trade_point_name, cp.name as consol_point_name, c.name as customer_name, ps.sender_subject, ps.receiver_subject
            FROM package_status ps
            LEFT JOIN trade_point tp ON (ps.sender_subject = 'tp' AND ps.sender_id = tp.id) OR (ps.receiver_subject = 'tp' AND ps.receiver_id = tp.id)
            LEFT JOIN consol_point cp ON (ps.sender_subject = 'cp' AND ps.sender_id = cp.id) OR (ps.receiver_subject = 'cp' AND ps.receiver_id = cp.id)
            LEFT JOIN customer c ON (ps.sender_subject = 'sender' AND ps.sender_id = c.id) OR (ps.receiver_subject = 'receiver' AND ps.receiver_id = c.id)
            WHERE ps.package_id = ?
            """, (id, )
        ).fetchall()

        return {
            "status": "success",
            "data": {
                "msg": f"Order ID: {id} retrieved successfully!",
                # "order_info": dict(order_info),
                "order_status": [dict(row) for row in order_status]
            }
        }

    except Exception as e:
        print(e)
        return {
            "status": "success",
            "data": {
                "msg": f"Server error: {str(e)}. Please check server logs."
            }
        }
