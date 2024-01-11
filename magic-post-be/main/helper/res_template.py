

def be_validate(*args):
    # only for required query string
    return not all(args)


def res_missing():
    return {
        "status": "fail",
        "data": {
            "msg": "Missing fields. Please check again."
        }
    }


def res_invalid():
    return {
        "status": "fail",
        "data": {
            "msg": "Fields invalid value. Please check again."
        }
    }


def handle_exception(e):
    print(e)
    return {
        "status": "fail",
        "data": {
            "msg": f'Server error: {str(e)}. Please check server logs.'
        }
    }, 500
