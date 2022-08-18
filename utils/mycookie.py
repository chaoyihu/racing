def get_cookie(cookie, cname):
    key = cname + "="
    ls = cookie.split(";")
    value = ""
    for entry in ls:
        s = entry.strip(" ")
        if s.startswith(key):
            value = s[len(key):]
    return value
