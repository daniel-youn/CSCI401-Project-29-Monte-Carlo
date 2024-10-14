from marshmallow import Schema, fields, validate

class DistributionGraphSchema(Schema):
    user_id = fields.Str(required=True, 
                         validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error="user_id must be alphanumeric with underscores allowed"))
    simulation_id = fields.Str(required=True, validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error="simulation_id must be alphanumeric with underscores allowed"))
    output_id = fields.Str(required=True, validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error="output_id must be alphanumeric with underscores allowed"))
    min_val = fields.Float(required=True)
    max_val = fields.Float(required=True)
    window_size = fields.Int(required=True)
    x_values = fields.List(fields.Float(), required=True)
    y_values = fields.List(fields.Int(), required=True)

# Instantiate the schema
distribution_graph_schema = DistributionGraphSchema()