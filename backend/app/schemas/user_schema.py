from marshmallow import Schema, fields, validate

class UserSchema(Schema):
    user_id = fields.Str(required=True, 
                         validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error="user_id must be alphanumeric with underscores allowed"))
    first_name = fields.Str(required=True, validate=[
        validate.Length(min=2, max=50),
        validate.Regexp(r'^[a-zA-Z]+$', error="First name must only contain letters")
    ])
    last_name = fields.Str(required=True, validate=[
        validate.Length(min=2, max=50),
        validate.Regexp(r'^[a-zA-Z]+$', error="Last name must only contain letters")
    ])
    password = fields.Str(required=True, validate=[
        validate.Length(min=8, error="Password must be at least 8 characters long"),
        validate.Regexp(r'(?=.*[0-9])(?=.*[!@#$%^&*])', 
                        error="Password must include at least one number and one special character")
    ])
    simulations = fields.List(fields.Str(validate=validate.Length(equal=24)), required=True)
    email = fields.Email(required=True)
    settings = fields.Dict(required=True)

# Instantiate the schema
user_schema = UserSchema()
