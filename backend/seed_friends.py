import os
import requests
import itertools
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing Supabase credentials")
    exit(1)

SUPABASE_URL = SUPABASE_URL.rstrip("/")
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}


def get_all_users():
    """Fetch all users from the database"""
    print("Fetching all users from database...")
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/users",
        headers=HEADERS,
        params={"select": "id,email,user_name"}
    )
    if resp.status_code == 200:
        users = resp.json()
        print(f"Found {len(users)} users")
        return users
    else:
        print(f"Failed to fetch users: {resp.text}")
        return []


def get_existing_friendships():
    """Fetch all existing friendships"""
    print("Fetching existing friendships...")
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/friends",
        headers=HEADERS
    )
    if resp.status_code == 200:
        friendships = resp.json()
        print(f"Found {len(friendships)} existing friendships")
        # Create a set of existing friendships (both directions)
        existing = set()
        for f in friendships:
            user_id = str(f["user_id"])
            friend_id = str(f["friend_id"])
            # Store both directions to check duplicates
            existing.add((user_id, friend_id))
            existing.add((friend_id, user_id))
        return existing
    else:
        print(f"Failed to fetch friendships: {resp.text}")
        return set()


def add_friendship(user_id, friend_id):
    """Add a friendship between two users"""
    friendship_data = {
        "user_id": user_id,
        "friend_id": friend_id,
        "status": "accepted"
    }
    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/friends",
        headers=HEADERS,
        json=friendship_data
    )
    if resp.status_code in (200, 201):
        return True
    elif resp.status_code == 409:
        # Conflict - friendship already exists
        return None
    else:
        print(f"Error adding friendship {user_id} -> {friend_id}: {resp.text}")
        return False


def main():
    users = get_all_users()
    
    if len(users) < 2:
        print("Not enough users in database to create friendships (need at least 2)")
        return
    
    existing = get_existing_friendships()
    
    print(f"\n{len(users)} users available for friendship")
    print(f"{len(existing) // 2} existing friendship pairs\n")
    
    friends_added = 0
    friends_skipped = 0
    friends_failed = 0
    
    # For each user, add at least 5 friends
    for i, user in enumerate(users):
        user_id = str(user["id"])
        username = user.get("user_name", "Unknown")
        
        # Get all other users as potential friends
        other_users = users[:i] + users[i+1:]
        
        # Take first 5 or all if less than 5
        friends_to_add = other_users[:5]
        
        print(f"Adding friends for {username}...")
        friends_added_for_user = 0
        
        for friend_user in friends_to_add:
            friend_id = str(friend_user["id"])
            
            # Check if friendship already exists (in both directions)
            if (user_id, friend_id) in existing or (friend_id, user_id) in existing:
                friends_skipped += 1
                continue
            
            result = add_friendship(user_id, friend_id)
            if result is True:
                friends_added += 1
                friends_added_for_user += 1
                print(f"  ✓ Added {friend_user.get('user_name', 'Unknown')} as friend")
            elif result is None:
                friends_skipped += 1
            else:
                friends_failed += 1
        
        print(f"  → {friends_added_for_user} friends added\n")
    
    print("\n" + "="*50)
    print(f"Seeding Complete!")
    print(f"  Friends Added: {friends_added}")
    print(f"  Friends Skipped (already existed): {friends_skipped}")
    print(f"  Friends Failed: {friends_failed}")
    print("="*50)


if __name__ == "__main__":
    main()
