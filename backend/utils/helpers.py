import json, bcrypt, os

def load_json(path):
    if not os.path.exists(path):
        return {}
    with open(path, "r") as f:
        return json.load(f)

def save_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

def load_email_list(path="emails.txt"):
    with open(path) as f:
        return [line.strip() for line in f if line.strip()]

def add_email_to_txt(email, path="emails.txt"):
    emails = set(load_email_list(path))
    emails.add(email)
    with open(path, "w") as f:
        f.write("\n".join(sorted(emails)) + "\n")

def hash_password(plain):
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()
