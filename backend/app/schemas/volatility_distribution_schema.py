from marshmallow import Schema, fields, validate

class VolatilityDistributionSchema(Schema):
    user_id = fields.Str(required=True, 
                         validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error="user_id must be alphanumeric with underscores allowed"))
    simulation_id = fields.Str(required=True, validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error="simulation_id must be alphanumeric with underscores allowed"))
    output_id = fields.Str(required=True, validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error="output_id must be alphanumeric with underscores allowed"))
    mean = fields.Float(required=True)
    standard_deviation = fields.Float(required=True)
    
# Instantiate the schema
volatility_distribution_schema = VolatilityDistributionSchema()