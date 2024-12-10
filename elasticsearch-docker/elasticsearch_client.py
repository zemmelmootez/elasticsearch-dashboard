from elasticsearch import Elasticsearch
import uuid
from datetime import datetime, timedelta
import random

def generate_product_sales_data():
    # Create Elasticsearch client
    es = Elasticsearch("http://localhost:9200")
    
    # Define product categories
    categories = [
        'Electronics', 'Clothing', 'Home & Kitchen', 
        'Sports & Outdoors', 'Books', 'Toys & Games'
    ]
    
    # Generate sales data for multiple days
    current_date = datetime.now() - timedelta(days=30)
    
    for _ in range(500):  # Generate 500 sample sales records
        product = {
            'name': f"{random.choice(['Wireless', 'Smart', 'Premium', 'Classic'])} "
                    f"{random.choice(['Headphones', 'Watch', 'Speaker', 'Camera'])}",
            'category': random.choice(categories),
            'price': round(random.uniform(10, 500), 2),
            'quantity_sold': random.randint(1, 20),
            'revenue': 0.0,
            'timestamp': current_date.isoformat(),
            'is_discounted': random.choice([True, False])
        }
        
        # Calculate revenue
        product['revenue'] = round(product['price'] * product['quantity_sold'], 2)
        
        # Index document
        doc_id = str(uuid.uuid4())
        es.index(index='product_sales', id=doc_id, document=product)
        
        # Move to next day
        current_date += timedelta(days=1)
        if current_date > datetime.now():
            break
    
    # Refresh index
    es.indices.refresh(index='product_sales')
    
    print("Generated sample sales data in Elasticsearch")

if __name__ == "__main__":
    generate_product_sales_data()