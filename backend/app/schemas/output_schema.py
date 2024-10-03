from marshmallow import Schema, fields, validate

class OutputSchema(Schema):
    output_id = fields.Str(required=True, validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error="output_id must be alphanumeric with underscores allowed"))
    user_id = fields.Str(required=True, 
                         validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error="user_id must be alphanumeric with underscores allowed"))
    simulation_id = fields.Str(required=True, validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error="simulation_id must be alphanumeric with underscores allowed"))
    simulation_results = fields.List(fields.Float(), required=True)
    summary_statistics = fields.Str(required=True, validate=validate.Length(equal=24)) #SummaryStatistics ObjectID
    volatility_distribution = fields.Str(required=True, validate=validate.Length(equal=24)) #VolatilityDistribution ObjectID
    additional_calculation = fields.Str(required=True, validate=validate.Length(equal=24)) #AdditionalCalculation ObjectID

# Instantiate the schema
output_schema = OutputSchema()