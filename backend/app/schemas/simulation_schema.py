from marshmallow import Schema, fields, validate

class SimulationSchema(Schema):
    simulation_id = fields.Str(
        required=True, 
        validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error="simulation_id must be alphanumeric with underscores allowed")
    )
    user_id = fields.Str(
        required=True, 
        validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error="user_id must be alphanumeric with underscores allowed")
    )
    output_id = fields.Str(
        required=True
    )
    created_at = fields.DateTime(required=True)
    # model_variables = fields.Str(required=True, validate=validate.Length(equal=24)) #ObjectID
    model_variables = fields.Str(required=True) #ObjectID
    number_of_simulations = fields.Int(required=True)
    status = fields.Str(required=True, validate=validate.OneOf(["pending", "running", "completed", "failed"]))
    window_size = fields.Int(required=True, validate=validate.Range(min=1, max=1000))
    x_values = fields.List(fields.Float(), required=True)
    y_values = fields.List(fields.Int(), required=True)

simulation_schema = SimulationSchema()