from marshmallow import Schema, fields, validate
from app.schemas.summary_statistics_schema import SummaryStatisticsSchema

class OutputSchema(Schema):
    simulation_id = fields.Str(required=True, validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error="simulation_id must be alphanumeric with underscores allowed"))
    summary_statistics = fields.List(fields.Nested(SummaryStatisticsSchema), required=True, validate=validate.Length(min=5, max=5))

# Instantiate the schema
output_schema = OutputSchema()