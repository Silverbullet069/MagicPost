import os
import json
from werkzeug.security import generate_password_hash


instance_path = '/home/silverbullet069/Desktop/Hung/UETSubject/Year4/Web/magic-post-be/instance'


def json_to_sql_address():

    with open(os.path.join(instance_path, 'magic_post_address.json'), 'r+', encoding='utf-8') as json_file:

        with open(os.path.join(instance_path, 'magic_post_address.sql'), 'a+', encoding='utf-8') as f:

            addresses = json.load(json_file)
            f.write('DELETE FROM address;\n')

            for address in addresses:
                # print(
                #     f"insert into address (id, address, ward, district, city) values ('{address['id']}', '{address['address']}', '{address['ward']}', '{address['district']}', '{address['city']}');") # debug

                f.write(
                    f"insert into address (id, address, ward, district, city) values ('{address['id']}', '{address['address']}', '{address['ward']}', '{address['district']}', '{address['city']}');\n")


def json_to_sql_consol_point():

    with open(os.path.join(instance_path, 'magic_post_consol_point.json'), 'r+', encoding='utf-8') as json_file:

        with open(os.path.join(instance_path, 'magic_post_consol_point.sql'), 'a+', encoding='utf-8') as f:

            consol_points = json.load(json_file)
            f.write('DELETE FROM consol_point;\n')

            for consol_point in consol_points:
                # print(
                #     f"insert into consol_point (id, name, mng_id, address_id) values ('{consol_point['id']}', '{consol_point['name']}', '{consol_point['mng_id']}', '{consol_point['address_id']}');")  # debug

                f.write(
                    f"insert into consol_point (id, name, mng_id, address_id) values ('{consol_point['id']}', '{consol_point['name']}', '{consol_point['mng_id']}', '{consol_point['address_id']}');\n")


def json_to_sql_trade_point():

    with open(os.path.join(instance_path, 'magic_post_trade_point.json'), 'r+', encoding='utf-8') as json_file:

        with open(os.path.join(instance_path, 'magic_post_trade_point.sql'), 'a+', encoding='utf-8') as f:

            trade_points = json.load(json_file)
            f.write('DELETE FROM trade_point;\n')

            for trade_point in trade_points:
                # print(
                #     f"insert into trade_point (id, name, mng_id, cp_id, address_id) values ('{trade_point['id']}', '{trade_point['name']}', '{trade_point['mng_id']}', '{trade_point['cp_id']}', '{trade_point['address_id']}');")  # debug

                f.write(
                    f"insert into trade_point (id, name, mng_id, cp_id, address_id) values ('{trade_point['id']}', '{trade_point['name']}', '{trade_point['mng_id']}', '{trade_point['cp_id']}', '{trade_point['address_id']}');\n")


def json_to_sql_user():
    with open(os.path.join(instance_path, 'magic_post_user.json'), 'r+', encoding='utf-8') as json_file:

        with open(os.path.join(instance_path, 'magic_post_user.sql'), 'a+', encoding='utf-8') as f:

            users = json.load(json_file)
            f.write('DELETE FROM user;\n')

            for user in users:
                # print(
                #     f"insert into user (id, name, username, password, role) values ('{user['id']}', '{user['name']}', '{user['username']}', '{user['password']}', '{user['role']}');")  # debug

                f.write(
                    f"insert into user (id, name, username, pwdhash, role) values ('{user['id']}', '{user['name']}', '{user['username']}', '{generate_password_hash(user['password'])}', '{user['role']}');\n")


def json_to_sql_customer():
    pass


def json_to_sql_package():
    pass


def json_to_sql_package_status():
    pass


if __name__ == '__main__':
    # json_to_sql_address()
    # json_to_sql_consol_point()
    json_to_sql_user()
    # json_to_sql_trade_point()
