from bson import ObjectId

# Helper function to validate ObjectId
def validate_objectid(oid):
    try:
        return ObjectId(oid)
    except:
        return None
