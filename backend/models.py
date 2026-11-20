from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

ALLOWED_CATEGORIES = ['F&B', 'Fashion', 'Elektronik', 'Jasa']

class Unit(db.Model):
    __tablename__ = 'units'
    id = db.Column(db.Integer, primary_key=True)
    nomor = db.Column(db.String(20), unique=True, nullable=False)
    lantai = db.Column(db.String(10), nullable=False)
    luas_m2 = db.Column(db.Float, nullable=True)
    
    tenant = db.relationship('Tenant', back_populates='unit', uselist=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nomor': self.nomor,
            'lantai': self.lantai,
            'luas_m2': self.luas_m2,
            'tenant': {
                'id': self.tenant.id,
                'nama': self.tenant.nama,
                'kategori': self.tenant.kategori
            } if self.tenant else None
        }

class Tenant(db.Model):
    __tablename__ = 'tenants'
    id = db.Column(db.Integer, primary_key=True)
    nama = db.Column(db.String(100), nullable=False)
    kategori = db.Column(db.String(50), nullable=False)
    unit_id = db.Column(db.Integer, db.ForeignKey('units.id'), unique=True, nullable=True)
    
    unit = db.relationship('Unit', back_populates='tenant')
    
    def to_dict(self):
        return {
            'id': self.id,
            'nama': self.nama,
            'kategori': self.kategori,
            'unit': {
                'id': self.unit.id,
                'nomor': self.unit.nomor,
                'lantai': self.unit.lantai,
                'luas_m2': self.unit.luas_m2
            } if self.unit else None
        }