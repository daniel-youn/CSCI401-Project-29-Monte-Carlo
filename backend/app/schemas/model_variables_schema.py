from marshmallow import Schema, fields, validate

class FactorSchema(Schema):
    factor_name = fields.Str(required=True)
    distribution_type = fields.Str(required=True, 
                                    validate=validate.OneOf(["normal", "uniform", "triangular"]))
    min_val = fields.Float(allow_none=True)  # Optional for distributions without min_val
    max_val = fields.Float(allow_none=True)  # Optional for distributions without max_val
    mean = fields.Float(allow_none=True)      # Optional for normal distributions
    stddev = fields.Float(allow_none=True)    # Optional for normal distributions

class ModelVariablesSchema(Schema):
    user_id = fields.Str(
        required=True, 
        validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error="user_id must be alphanumeric with underscores allowed")
    )
    simulation_id = fields.Str(
        required=True, 
        validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error="simulation_id must be alphanumeric with underscores allowed")
    )

    # Define the factors as a dictionary with specific key and value types
    factors = fields.Dict(
        keys=fields.Str(),  # Each key in the dictionary will be a string (the factor names)
        values=fields.Nested(FactorSchema),  # Use the nested schema for values
        required=True
    )

# Instantiate the schema
model_variables_schema = ModelVariablesSchema()
