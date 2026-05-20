import os
import requests
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

# 1. Existing User Alice
ALICE_ID = "8892fe68-f99e-4f52-99ab-39e91bc2927f"

# 2. Mock Users Data
MOCK_USERS = [
    {
        "email": "jordan.forest@example.com",
        "user_name": "jforest",
        "first_name": "Jordan",
        "last_name": "Forest",
        "password": "hashed_dummy_password", # Bypass real auth for mock
        "avatar_url": None
    },
    {
        "email": "alex.rivers@example.com",
        "user_name": "arivers",
        "first_name": "Alex",
        "last_name": "Rivers",
        "password": "hashed_dummy_password",
        "avatar_url": None
    },
    {
        "email": "sam.green@example.com",
        "user_name": "sgreen",
        "first_name": "Sam",
        "last_name": "Green",
        "password": "hashed_dummy_password",
        "avatar_url": None
    }
]

def main():
    print("1. Creating mock users in 'users' table...")
    mock_ids = []
    
    for u in MOCK_USERS:
        resp = requests.post(f"{SUPABASE_URL}/rest/v1/users", headers=HEADERS, json=u)
        if resp.status_code in (200, 201):
            inserted_user = resp.json()[0]
            mock_ids.append(inserted_user["id"])
            print(f"Created user: {u['first_name']} {u['last_name']}")
        elif resp.status_code == 409:
            print(f"User {u['email']} already exists. Skipping creation.")
            # If they exist, let's fetch their ID to update their stats
            get_resp = requests.get(f"{SUPABASE_URL}/rest/v1/users?email=eq.{u['email']}", headers=HEADERS)
            if get_resp.status_code == 200 and get_resp.json():
                mock_ids.append(get_resp.json()[0]["id"])
        else:
            print(f"Failed to create user {u['email']}: {resp.text}")

    print("\n2. Seeding 'user_stats' table with points...")
    
    # Let's define the points we want to give them
    # Make sure they have different points so we get a nice podium
    stats_data = [
        {"user_id": ALICE_ID, "total_points": 1500, "trees_planted": 1},
    ]
    
    # Assign points to our mock users if they were created
    if len(mock_ids) >= 1:
        stats_data.append({"user_id": mock_ids[0], "total_points": 3200, "trees_planted": 3}) # Jordan: 1st place
    if len(mock_ids) >= 2:
        stats_data.append({"user_id": mock_ids[1], "total_points": 2800, "trees_planted": 2}) # Alex: 2nd place
    if len(mock_ids) >= 3:
        stats_data.append({"user_id": mock_ids[2], "total_points": 800, "trees_planted": 0})  # Sam: 4th place
        
    # We use UPSERT for user_stats (Prefer: resolution=merge-duplicates)
    upsert_headers = HEADERS.copy()
    upsert_headers["Prefer"] = "resolution=merge-duplicates"
    
    for stat in stats_data:
        resp = requests.post(f"{SUPABASE_URL}/rest/v1/user_stats", headers=upsert_headers, json=stat)
        if resp.status_code in (200, 201):
            print(f"Successfully upserted stats for user {stat['user_id']} with {stat['total_points']} points.")
        else:
            print(f"Failed to upsert stats for {stat['user_id']}: {resp.text}")

    print("\n3. Adding friends to users...")
    all_user_ids = [ALICE_ID] + mock_ids
    
    # For each user, add at least 5 friends from the other users
    for i, user_id in enumerate(all_user_ids):
        # Get list of other users to be friends with (up to 5)
        potential_friends = all_user_ids[:i] + all_user_ids[i+1:]
        friends_to_add = potential_friends[:5]  # Take up to 5 friends
        
        for friend_id in friends_to_add:
            friendship_data = {
                "user_id": user_id,
                "friend_id": friend_id,
                "status": "accepted"
            }
            resp = requests.post(f"{SUPABASE_URL}/rest/v1/friends", headers=HEADERS, json=friendship_data)
            if resp.status_code in (200, 201):
                print(f"Added friend relationship: {user_id} <-> {friend_id}")
            elif resp.status_code == 409:
                print(f"Friendship already exists between {user_id} and {friend_id}")
            else:
                print(f"Failed to add friendship: {resp.text}")

    print("\nMock data seeded successfully! You can now test the Leaderboard and Friends endpoints.")

if __name__ == "__main__":
    main()
