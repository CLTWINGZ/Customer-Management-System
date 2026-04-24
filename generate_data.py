import csv
import random
from datetime import date, timedelta

# Sri Lankan Cities from data.sql
CITIES = ["Colombo", "Kandy", "Galle", "Jaffna", "Negombo", "Anuradhapura", "Ratnapura", "Batticaloa", "Matara", "Trincomalee", "Kurunegala", "Badulla", "Gampaha", "Kalutara", "Nuwara Eliya"]

def generate_customers(num_records):
    customers = []
    start_date = date(1950, 1, 1)
    end_date = date(2005, 12, 31)
    
    for i in range(num_records):
        name = f"Customer {i+1}"
        dob = start_date + timedelta(days=random.randint(0, (end_date - start_date).days))
        # NIC generation (12 digits for modern)
        nic = f"19{random.randint(50, 99)}{random.randint(10000000, 99999999)}"
        # Ensure uniqueness
        nic = nic[:10] + f"{i:06}"[-6:]
        
        # Mobiles (1-3 numbers)
        mobiles = ";".join([f"07{random.randint(10000000, 99999999)}" for _ in range(random.randint(1, 3))])
        
        # Address
        addr1 = f"No {random.randint(1, 500)}, Main Street"
        addr2 = f"Phase {random.randint(1, 5)}"
        city = random.choice(CITIES)
        country = "Sri Lanka"
        
        customers.append([name, dob.strftime("%Y-%m-%d"), nic, mobiles, addr1, addr2, city, country])
    
    return customers

def save_to_csv(filename, data):
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["Name", "Date of Birth", "NIC", "Mobile Numbers", "Address Line 1", "Address Line 2", "City", "Country"])
        writer.writerows(data)

if __name__ == "__main__":
    count = 10000
    print(f"Generating {count} records...")
    records = generate_customers(count)
    save_to_csv("customers_10000.csv", records)
    print(f"Generated {count} records in customers_10000.csv")
