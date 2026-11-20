import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from models import db
from routes import api_bp
from seed import seed_data

load_dotenv()

def create_app():
  app = Flask(__name__)
  CORS(app)
  
  db_host = os.getenv('DB_HOST', 'localhost')
  db_port = os.getenv('DB_PORT', '3306')
  db_user = os.getenv('DB_USER', 'root')
  db_password = os.getenv('DB_PASSWORD', '')
  db_name = os.getenv('DB_NAME', 'mall_db')
  
  database_url = f'mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
  
  app.config['SQLALCHEMY_DATABASE_URI'] = database_url
  app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
  
  db.init_app(app)
  app.register_blueprint(api_bp)
  
  with app.app_context():
    db.create_all()
    seed_data()
  
  return app

if __name__ == '__main__':
  app = create_app()
  port = int(os.getenv('PORT', 5000))
  debug = os.environ.get('FLASK_DEBUG', 'True') == 'True'
  app.run(debug=debug, host='0.0.0.0', port=port)