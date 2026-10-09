import sys
import argparse
from app.db.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password

def list_users(db):
    users = db.query(User).all()
    print('\n--- Users in Database ---')
    if not users:
        print('No users found.')
    for u in users:
        print(f'ID: {u.id} | Email: {u.email} | Name: {u.name} | Role: {u.role}')
    print('-------------------------\n')

def reset_password(email: str, new_password: str, make_admin: bool=False):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"Error: No user found with email: '{email}'")
            list_users(db)
            return False
        user.password_hash = hash_password(new_password)
        if make_admin:
            user.role = 'ADMIN'
        db.commit()
        print(f"Success! Password for user '{email}' has been reset.")
        if make_admin:
            print(f'User role set to ADMIN.')
        return True
    except Exception as e:
        db.rollback()
        print(f'Database error: {e}')
        return False
    finally:
        db.close()
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Reset user password in Smart Event Management database')
    parser.add_argument('--email', type=str, help='Email of the user')
    parser.add_argument('--password', type=str, help='New password to set')
    parser.add_argument('--admin', action='store_true', help='Set user role to ADMIN')
    parser.add_argument('--list', action='store_true', help='List all registered users')
    args = parser.parse_args()
    db = SessionLocal()
    if args.list or len(sys.argv) == 1:
        list_users(db)
        db.close()
        if len(sys.argv) == 1:
            email = input('Enter user email to reset password: ').strip()
            if email:
                new_pw = input('Enter new password: ').strip()
                if new_pw:
                    make_admin_input = input('Make ADMIN? (y/n) [n]: ').strip().lower()
                    reset_password(email, new_pw, make_admin=make_admin_input == 'y')
    elif args.email and args.password:
        reset_password(args.email, args.password, make_admin=args.admin)
    else:
        parser.print_help()