from marshmallow import Schema, fields, validate

class SimulationSchema(Schema):
    simulation_id = fields.Str(required=True, validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error="simulation_id must be alphanumeric with underscores allowed"))
    output_id = fields.Str(required=True)
    project_id = fields.Str(required=True, validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error="project_id must be alphanumeric with underscores allowed"))
    model_variables = fields.List(fields.Str(required=True))
    status = fields.Str(required=True, validate=validate.OneOf(["pending", "running", "completed", "failed"]))
    simulation_type = fields.Str(required=True, validate=validate.OneOf(["normal", "admin", "cross-check"]))

simulation_schema = SimulationSchema()