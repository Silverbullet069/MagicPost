
import os
import sqlite3
import click
from contextlib import closing
from flask import current_app


def init_db():
    with closing(sqlite3.connect(os.path.join(current_app.instance_path, "magicpost.db"))) as connection:
        with current_app.open_resource('mock_data.sql') as f:
            connection.executescript(f.read().decode('utf8'))


@click.command('init-db')
def init_db_command():
    # Clear the existing data and create new tables.
    init_db()

    # Confirmation
    click.echo('Database initialized successfully!')

# Import and call this function from the Application Factory (a.k.a main/__init__.py)


def init_app(app):
    # app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)


# def get_db():
#     if 'db' not in g:
#         g.db = sqlite3.connect(
#             current_app.config['DATABASE'],
#             detect_types=sqlite3.PARSE_DECLTYPES
#         )  # Connection obj
#         g.db.row_factory = sqlite3.Row

#     return g.db


# def close_db(e=None):
#     db = g.pop('db', None)

#     if db is not None:
#         db.close()
