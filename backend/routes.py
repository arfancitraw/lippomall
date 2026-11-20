from flask import request, jsonify, Blueprint
from sqlalchemy import func
from models import db, Unit, Tenant, ALLOWED_CATEGORIES

api_bp = Blueprint('api', __name__)

#Get Tenants
@api_bp.route('/tenants', methods=['GET'])
def get_tenants():
    q = request.args.get('q', '').strip()
    kategori = request.args.get('kategori', '').strip()
    lantai = request.args.get('lantai', '').strip()
    
    query = Tenant.query
    
    if lantai:
        query = query.join(Tenant.unit).filter(Unit.lantai == lantai)
    if q:
        query = query.filter(func.Lower(Tenant.nama).contains(q.lower()))
    if kategori:
        query = query.filter(Tenant.kategori == kategori)
    
    tenants = query.order_by(Tenant.id.asc()).all()
    return jsonify([tenant.to_dict() for tenant in tenants]), 200


#Post Tenant
@api_bp.route('/tenants', methods=['POST'])
def create_tenant():
    data = request.get_json() or {}
    nama = (data.get('nama') or '').strip()
    kategori = (data.get('kategori') or '').strip()
    
    if not nama:
        return jsonify({'error': 'Nama tenant harus diisi.'}), 400
    if kategori not in ALLOWED_CATEGORIES:
        return jsonify({'error': f'Kategori harus salah satu dari : {", ".join(ALLOWED_CATEGORIES)}.'}), 400
    
    existing_tenant = Tenant.query.filter(func.Lower(Tenant.nama) == nama.lower()).first()
    if existing_tenant:
        return jsonify({'error': f'Tenant dengan nama "{nama}" sudah ada.'}), 409
    
    new_tenant = Tenant(nama=nama, kategori=kategori, unit_id=None)
    db.session.add(new_tenant)
    db.session.commit()
    
    return jsonify(new_tenant.to_dict()), 201


#Put Tenant
@api_bp.route('/tenants/<int:tenant_id>', methods=['PUT'])
def update_tenant(tenant_id):
    tenant = Tenant.query.get(tenant_id)
    if not tenant:
        return jsonify({'error': 'Tenant tidak ditemukan.'}), 404
    
    data = request.get_json() or {}
    nama = (data.get('nama') or '').strip()
    kategori = (data.get('kategori') or '').strip()

    if nama:
        existing_tenant = Tenant.query.filter(func.Lower(Tenant.nama) == nama.lower(), Tenant.id != tenant_id).first()
        if existing_tenant:
            return jsonify({'error': f'Tenant dengan nama "{nama}" sudah di gunakan.'}), 409
        tenant.nama = nama
        
    if kategori:
        if kategori not in ALLOWED_CATEGORIES:
            return jsonify({'error': f'Kategori harus salah satu dari : {", ".join(ALLOWED_CATEGORIES)}.'}), 400
        tenant.kategori = kategori
    
    db.session.commit()
    return jsonify(tenant.to_dict()), 200


#Delete Tenant
@api_bp.route('/tenants/<int:tenant_id>', methods=['DELETE'])
def delete_tenant(tenant_id):
    tenant = Tenant.query.get(tenant_id)
    if not tenant:
        return jsonify({'error': 'Tenant tidak ditemukan.'}), 404
    
    db.session.delete(tenant)
    db.session.commit()
    
    return jsonify({'message': 'Tenant berhasil dihapus.'}), 200

#Put Tenant Unit
@api_bp.route('/tenants/<int:tenant_id>/unit', methods=['PUT'])
def assign_unit_to_tenant(tenant_id):
    tenant = Tenant.query.get(tenant_id)
    if not tenant:
        return jsonify({'error': 'Tenant tidak ditemukan.'}), 404
    
    data = request.get_json() or {}
    unit_id = data.get('unit_id')
    
    if unit_id is None:
        tenant.unit_id = None
        db.session.commit()
        return jsonify(tenant.to_dict()), 200
    
    target_unit = Unit.query.get(unit_id)
    if not target_unit:
        return jsonify({'error': 'Unit tidak ditemukan.'}), 404
    
    if tenant.unit_id == unit_id:
        return jsonify(tenant.to_dict()), 200
      
    occupant_tenant = Tenant.query.filter_by(unit_id=unit_id).first()
    if occupant_tenant and occupant_tenant.id != tenant.id:
        return jsonify({'error': f'Unit {target_unit.nomor} sudah ditempati oleh {occupant_tenant.nama}.'}), 409
    
    tenant.unit_id = unit_id
    db.session.commit()
    
    return jsonify(tenant.to_dict()), 200

#Get Units
@api_bp.route('/units', methods=['GET'])
def get_units():
    lantai = request.args.get('lantai', '').strip()
    status = request.args.get('status', '').strip().lower()
    
    query = Unit.query
    
    if lantai:
      query = query.filter(Unit.lantai == lantai)
    
    if status ==  'terisi':
      query = query.filter(Unit.tenant != None)
    elif status == 'kosong':
      query = query.filter(Unit.tenant == None)
    
    units = query.order_by(Unit.id.asc()).all()
    return jsonify([unit.to_dict() for unit in units]), 200

