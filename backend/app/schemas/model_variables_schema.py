from marshmallow import Schema, fields, validate

class ModelVariablesSchema(Schema):
    user_id = fields.Str(required=True, 
                         validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error="user_id must be alphanumeric with underscores allowed"))
    simulation_id = fields.Str(required=True, validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error="simulation_id must be alphanumeric with underscores allowed"))

    # Revenue Parameters
    willingness_to_pay_standard = fields.List(fields.Float(), required=True)  # [min, max]
    willingness_to_pay_premium = fields.List(fields.Float(), required=True)  # [min, max]
    num_standard_users_per_deal = fields.List(fields.Float(), required=True)  # [min, max]
    num_premium_users_per_deal = fields.List(fields.Float(), required=True)  # [min, max]
    num_deals_per_year = fields.List(fields.Float(), required=True)  # [min, max]
    expected_discount_per_deal = fields.List(fields.Float(), required=True)  # [min, max]

    # Cross-Check Factors
    initial_market_size = fields.List(fields.Float(), required=True)  # [min, max]
    yoy_growth_rate = fields.List(fields.Float(), required=True)  # [min, max]

    # Dynamic Distribution Fields
    distribution_type = fields.Str(required=True, validate=validate.OneOf(["normal", "uniform", "triangular"]))  # User chooses the distribution

# Instantiate the schema
model_variables_schema = ModelVariablesSchema()
