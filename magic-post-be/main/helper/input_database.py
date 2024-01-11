
import os
import sqlite3


def manual_input():

    instance_path = '/home/silverbullet069/Desktop/Hung/UETSubject/Year4/Web/magic-post-be/instance'

    filenames = ['magic_post_address.sql', 'magic_post_user.sql',
                 'magic_post_consol_point.sql', 'magic_post_trade_point.sql']

    connection = sqlite3.connect(os.path.join(
        instance_path, 'magicpost.sqlite'), detect_types=sqlite3.PARSE_DECLTYPES)
    connection.row_factory = sqlite3.Row  # enable to use square bracket

    for filename in filenames:
        with open(os.path.join(instance_path, filename), 'r+', encoding='utf8') as f:
            connection.executescript(f.read())


if __name__ == "__main__":
    manual_input()
