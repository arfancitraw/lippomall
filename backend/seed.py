from models import db, Unit, Tenant

def seed_data():
  if Unit.query.count() == 0:
    units_data = [
      Unit(id=1, nomor='GF-01', lantai='GF', luas_m2=45.0),
      Unit(id=2, nomor='GF-02', lantai='GF', luas_m2=60.0),
      Unit(id=3, nomor='GF-03', lantai='GF', luas_m2=30.0),
      Unit(id=4, nomor='L1-01', lantai='L1', luas_m2=80.0),
      Unit(id=5, nomor='L1-02', lantai='L1', luas_m2=55.0),
      Unit(id=6, nomor='L1-03', lantai='L1', luas_m2=120.0),
      Unit(id=7, nomor='L2-01', lantai='L2', luas_m2=70.0),
      Unit(id=8, nomor='L2-02', lantai='L2', luas_m2=90.0),
    ]
    db.session.bulk_save_objects(units_data)
    db.session.commit()
    print("Data units berhasil di-seed.")
    
  if Tenant.query.count() == 0:
    tenants_data = [
      Tenant(id=1, nama='Kopi Senja', kategori='F&B', unit_id=1),
      Tenant(id=2, nama='Fashion Corner', kategori='Fashion', unit_id=4),
      Tenant(id=3, nama='Gadget Hub', kategori='Elektronik', unit_id=None),
      Tenant(id=4, nama='Pijat Sehat', kategori='Jasa', unit_id=None),
    ]
    db.session.add_all(tenants_data)
    db.session.commit()
    print("Data tenants berhasil di-seed.")