from marshmallow import Schema, fields, validate

class ModelVariablesSchema(Schema):
    user_id = fields.Str(required=True, 
                         validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error="user_id must be alphanumeric with underscores allowed"))
    simulation_id = fields.Str(required=True, validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error="simulation_id must be alphanumeric with underscores allowed"))
    variables = fields.Str(required=True)
    probability_distribution = fields.Dict(required=True)
    co_relation = fields.Dict(required=False)

# Instantiate the schema
model_variables_schema = ModelVariablesSchema()