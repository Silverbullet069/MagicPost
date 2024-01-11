
import sqlite3
import click
from flask import current_app, g


def init_db():  # Create table + mock data
    db = get_db()

    with current_app.open_resource('schema.sql') as f:
        db.executescript(f.read().decode('utf8'))


def run_adhoc():
    db = get_db()

    with current_app.open_resource('adhoc.sql') as f:
        db.executescript(f.read().decode('utf8'))


@click.command('run-adhoc')
def run_adhoc_command():
    run_adhoc()
    click.echo('Database adhoc queries finished successfully!')  # Notify


@click.command('init-db')  # Turn create table + mock data into CLI command
def init_db_command():
    init_db()
    click.echo('Database initialized successfully!')  # Notify


def init_app(app):  # Register App instance with DB
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
    app.cli.add_command(run_adhoc_command)


def get_db():  # Use DB
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )  # Connection obj
        g.db.row_factory = sqlite3.Row

    return g.db


def close_db(e=None):  # Clean up DB
    db = g.pop('db', None)

    if db is not None:
        db.close()
