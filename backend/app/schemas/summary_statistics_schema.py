from marshmallow import Schema, fields, validate

class SummaryStatisticsSchema(Schema):
    user_id = fields.Str(required=True, 
                         validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error="user_id must be alphanumeric with underscores allowed"))
    simulation_id = fields.Str(required=True, validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error="simulation_id must be alphanumeric with underscores allowed"))
    output_id = fields.Str(required=True, validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error="output_id must be alphanumeric with underscores allowed"))
    mean_outcome = fields.Float(required=True)
    median_outcome = fields.Float(required=True)
    standard_deviation = fields.Float(required=True)
    min_outcome = fields.Float(required=True)
    max_outcome = fields.Float(required=True)
    percentile_5 = fields.Float(required=True)
    percentile_95 = fields.Float(required=True)
    
# Instantiate the schema
summary_statistics_schema = SummaryStatisticsSchema()