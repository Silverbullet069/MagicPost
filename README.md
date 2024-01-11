# MagicPost
> A web app for managing internal affais for a delivery company called Magic Post.

## Table of contents
1. [Introduction](#introduction)
2. [Requirements](#requirements)
3. [Installation](#installation)
4. [Run](#run)
5. [How to use?](#how-to-use)
6. [What's missing](#whats-missing)
7. [Contributors](#contributors)

## Introduction
> <u>_NOTE:_</u> This project is being worked on using full English so Vietnamese terminologies like 'Điểm giao dịch', 'Điểm tập kết' are translated to 'Trading Point', 'Consolidation Point', respectively.

![login.png](./docs/login.png)

This web application allows the MagicPost's Managers to manage their subordinates accounts, their assigned points (trading/consolidation). Employees can manage the flow of orders in/out of the points.

> <u>_NOTE:_</u> This application is still in-development stage with mock data, but you can still download and experiment with it, instructions below.

## Requirements
- [**NodeJS**](https://nodejs.org/en/download/) with [**Yarn**](https://classic.yarnpkg.com/en/docs/install) installed.
- [**Python**](https://www.python.org/downloads/) (>=3.)

## Installation
1. Clone the repository
```sh
git clone --depth 1 https://github.com/Silverbullet069/MagicPost.git
```

2. Install Front-end YARN dependencies
```sh
cd MagicPost/magic-post-fe/
yarn install
```

3. Install Back-end PIP requirements
```sh
cd MagicPost/magic-post-be/
python3 -m venv py-magic-post-be
source py-magic-post-be/bin/activate[.fish | .csh]
pip install -r requirements.txt
```

> <u>_NOTE:_</u> use ```.fish``` if you're using [Fish shell](https://github.com/fish-shell/fish-shell), ```.csh``` if you're using [C shell](https://en.wikipedia.org/wiki/C_shell)

## Run

1. Run Front-end 
```sh
cd MagicPost/magic-post-fe/
yarn run dev
```
The web app will be available at URL: [http://localhost:5173](http://localhost:5173)

2. Run Back-end
```sh
cd MagicPost/magic-post-be/
flask --app main run --debug
```
The server will be available at URL: [http://localhost:5000](http://localhost:5000)

3. Initialize Database
**Note:** This can only be done after you have done [2-run-back-end](Step 2)
```sh
cd MagicPost/magic-post-be/
flask --app main init-db
flask --app main run-adhoc
```
A small database file in ```instance/``` directory called ```magicpost.sqlite``` is initialized.
The mock information, both generated manually by hand or automatically using [Mockaroo](https://www.mockaroo.com)

## How to use?

### Login
Use any client browsers to open [http://localhost:5173](http://localhost:5173)  
There you will see a login panel
There are 5 different accounts type that you can use, here are the credentials and their roles:

|No.#|Username|Password|Role|
|1|senior_mng|123456|Senior Managers|
|2|tp_mng_01|123456|Trade Point Managers|
|3|cp_mng_01|123456|Consolidation Point Managers|
|4|tp_emp_01|123456|Trade Point Employees|
|5|cp_emp_01|123456|Consolidation Point Employees|

There are many more accounts that share the same username pattern (e.g. ```tp_mng_02```, ```tp_mng_03```, ```cp_mng_02```, ...) and same password (i.e. ```123456```), you can find out about them in [schema.sql](https://github.com/Silverbullet069/MagicPost/blob/master/magic-post-be/main/schema.sql)

After login successfully, you will be guided to a Dashboard. I've designed it straightforwardly so you can use it without documentation.

### Client
Currently there aren't any navigation link to redirect to client so if you want to use the Client features, head to [http://localhost:5173/client](http://localhost:5173/client)

## What's missing
According to [https://itest.com.vn/lects/webappdev/mockproj/magic-post.htm](Project's Requirements), I've managed to implement Senior Managers, Trade/Consolidation Managers and Client required features. Trade/Consolidation Employees aren't finished.

## Contributors
|Info|Role|Work|
|[Bui Huu Viet Hung](https://github.com/Silverbullet069)|Leader, Full-stack developer| Project manager, Architecture design, UI/UX design, REST API design, Database design, GitHub, Documentation, Demo video|
